// YesCoin 完整部署脚本
// 一键部署所有合约到BSC网络（测试网或主网）

const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// 部署配置
const DEPLOY_CONFIG = {
  // 网络配置
  networks: {
    bscTestnet: {
      chainId: 97,
      name: "BSC Testnet",
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      blockExplorer: "https://testnet.bscscan.com",
      currency: "tBNB"
    },
    bscMainnet: {
      chainId: 56,
      name: "BSC Mainnet",
      rpcUrl: "https://bsc-dataseed1.binance.org/",
      blockExplorer: "https://bscscan.com",
      currency: "BNB"
    }
  },
  
  // 代币配置
  token: {
    name: "YesCoin",
    symbol: "YES",
    totalSupply: ethers.parseEther("1000000000"), // 10亿代币
    decimals: 18
  },
  
  // NFT配置
  nft: {
    name: "YesCoin Guardian NFT",
    symbol: "GUARD",
    baseURI: "https://api.yescoin.com/metadata/",
    maxSupply: 10000,
    mintPrice: ethers.parseEther("0.01") // 0.01 BNB
  },
  
  // 空投配置
  airdrop: {
    tokenAllocation: ethers.parseEther("100000000"), // 1亿代币用于空投
    taskReward: ethers.parseEther("1000"), // 每个任务1000代币
    referralBonus: ethers.parseEther("500"), // 推荐奖励500代币
    merkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000" // 初始Merkle根
  }
};

// 部署状态跟踪
let deploymentState = {
  network: null,
  deployer: null,
  contracts: {},
  transactions: {},
  gasUsed: 0n,
  startTime: null,
  endTime: null
};

// 工具函数
function formatGas(gasUsed) {
  return gasUsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

async function waitForConfirmation(tx, description) {
  console.log(`⏳ 等待交易确认: ${description}`);
  console.log(`   交易哈希: ${tx.hash}`);
  
  const receipt = await tx.wait();
  deploymentState.gasUsed += receipt.gasUsed;
  
  console.log(`✅ 交易确认成功 (Gas: ${formatGas(receipt.gasUsed)})`);
  return receipt;
}

async function deployContract(contractName, constructorArgs = [], description = "") {
  console.log(`\n📦 部署${description || contractName}合约...`);
  
  const ContractFactory = await ethers.getContractFactory(contractName);
  
  console.log(`⏳ 正在部署 ${contractName}...`);
  const contract = await ContractFactory.deploy(...constructorArgs);
  
  const receipt = await waitForConfirmation(
    contract.deploymentTransaction(),
    `${contractName} 部署`
  );
  
  const contractAddress = await contract.getAddress();
  console.log(`✅ ${contractName} 部署成功: ${contractAddress}`);
  
  return {
    contract,
    address: contractAddress,
    receipt
  };
}

async function verifyDeployment() {
  console.log("\n🔍 验证合约部署...");
  
  const { YesCoin, GuardianNFT, YesCoinAirdrop } = deploymentState.contracts;
  
  try {
    // 验证代币合约
    const tokenName = await YesCoin.contract.name();
    const tokenSymbol = await YesCoin.contract.symbol();
    const totalSupply = await YesCoin.contract.totalSupply();
    console.log(`✅ YesCoin: ${tokenName} (${tokenSymbol}), 总供应量: ${ethers.formatEther(totalSupply)}`);
    
    // 验证NFT合约
    const nftName = await GuardianNFT.contract.name();
    const nftSymbol = await GuardianNFT.contract.symbol();
    const maxSupply = await GuardianNFT.contract.maxSupply();
    const mintPrice = await GuardianNFT.contract.mintPrice();
    console.log(`✅ Guardian NFT: ${nftName} (${nftSymbol}), 最大供应量: ${maxSupply}, 铸造价格: ${ethers.formatEther(mintPrice)} BNB`);
    
    // 验证空投合约
    const airdropToken = await YesCoinAirdrop.contract.token();
    const airdropNFT = await YesCoinAirdrop.contract.guardianNFT();
    const taskReward = await YesCoinAirdrop.contract.taskReward();
    console.log(`✅ 空投合约: 代币 ${airdropToken}, NFT ${airdropNFT}, 任务奖励 ${ethers.formatEther(taskReward)} YES`);
    
    return true;
  } catch (error) {
    console.error(`❌ 验证失败: ${error.message}`);
    return false;
  }
}

async function initializeContracts() {
  console.log("\n⚙️ 初始化合约设置...");
  
  const { YesCoin, GuardianNFT, YesCoinAirdrop } = deploymentState.contracts;
  
  try {
    // 1. 向空投合约转移代币
    console.log("📤 向空投合约转移代币...");
    const transferTx = await YesCoin.contract.transfer(
      YesCoinAirdrop.address,
      DEPLOY_CONFIG.airdrop.tokenAllocation
    );
    await waitForConfirmation(transferTx, "代币转移");
    console.log(`✅ 已转移 ${ethers.formatEther(DEPLOY_CONFIG.airdrop.tokenAllocation)} YES 到空投合约`);
    
    // 2. 设置NFT合约的空投合约地址
    console.log("🔗 设置NFT合约权限...");
    const setAirdropTx = await GuardianNFT.contract.setAirdropContract(YesCoinAirdrop.address);
    await waitForConfirmation(setAirdropTx, "设置空投合约权限");
    console.log(`✅ 已设置空投合约地址到NFT合约`);
    
    // 3. 验证初始化结果
    const airdropBalance = await YesCoin.contract.balanceOf(YesCoinAirdrop.address);
    console.log(`💰 空投合约代币余额: ${ethers.formatEther(airdropBalance)} YES`);
    
    return true;
  } catch (error) {
    console.error(`❌ 初始化失败: ${error.message}`);
    return false;
  }
}

async function saveDeploymentInfo() {
  console.log("\n💾 保存部署信息...");
  
  const networkConfig = DEPLOY_CONFIG.networks[deploymentState.network.name] || {};
  
  const deploymentInfo = {
    // 网络信息
    network: {
      name: deploymentState.network.name,
      chainId: Number(deploymentState.network.chainId),
      blockExplorer: networkConfig.blockExplorer,
      currency: networkConfig.currency
    },
    
    // 部署者信息
    deployer: {
      address: deploymentState.deployer.address,
      balance: ethers.formatEther(await ethers.provider.getBalance(deploymentState.deployer.address))
    },
    
    // 合约信息
    contracts: {
      YesCoin: {
        address: deploymentState.contracts.YesCoin.address,
        name: DEPLOY_CONFIG.token.name,
        symbol: DEPLOY_CONFIG.token.symbol,
        totalSupply: ethers.formatEther(DEPLOY_CONFIG.token.totalSupply),
        decimals: DEPLOY_CONFIG.token.decimals
      },
      GuardianNFT: {
        address: deploymentState.contracts.GuardianNFT.address,
        name: DEPLOY_CONFIG.nft.name,
        symbol: DEPLOY_CONFIG.nft.symbol,
        maxSupply: DEPLOY_CONFIG.nft.maxSupply,
        mintPrice: ethers.formatEther(DEPLOY_CONFIG.nft.mintPrice),
        baseURI: DEPLOY_CONFIG.nft.baseURI
      },
      YesCoinAirdrop: {
        address: deploymentState.contracts.YesCoinAirdrop.address,
        tokenAllocation: ethers.formatEther(DEPLOY_CONFIG.airdrop.tokenAllocation),
        taskReward: ethers.formatEther(DEPLOY_CONFIG.airdrop.taskReward),
        referralBonus: ethers.formatEther(DEPLOY_CONFIG.airdrop.referralBonus)
      }
    },
    
    // 部署统计
    deployment: {
      timestamp: new Date().toISOString(),
      duration: formatTime(deploymentState.endTime - deploymentState.startTime),
      totalGasUsed: formatGas(deploymentState.gasUsed),
      blockNumber: await ethers.provider.getBlockNumber()
    },
    
    // 环境变量模板
    envTemplate: {
      VITE_YES_TOKEN_ADDRESS: deploymentState.contracts.YesCoin.address,
      VITE_GUARDIAN_NFT_ADDRESS: deploymentState.contracts.GuardianNFT.address,
      VITE_AIRDROP_CONTRACT_ADDRESS: deploymentState.contracts.YesCoinAirdrop.address,
      VITE_CHAIN_ID: Number(deploymentState.network.chainId),
      VITE_NETWORK_NAME: deploymentState.network.name
    }
  };
  
  // 创建部署目录
  const deploymentDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // 保存部署信息
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const deploymentPath = path.join(deploymentDir, `deployment-${deploymentState.network.name}-${timestamp}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`✅ 部署信息已保存到: ${deploymentPath}`);
  
  // 生成环境变量文件
  const envPath = path.join(__dirname, '..', `.env.${deploymentState.network.name}`);
  const envContent = Object.entries(deploymentInfo.envTemplate)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ 环境变量文件已生成: ${envPath}`);
  
  return deploymentInfo;
}

async function main() {
  deploymentState.startTime = Date.now();
  
  console.log("🚀 开始部署YesCoin完整智能合约套件...");
  console.log("=".repeat(60));
  
  try {
    // 1. 获取网络和部署者信息
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    deploymentState.network = network;
    deploymentState.deployer = deployer;
    
    console.log("📋 部署信息:");
    console.log(`   部署者地址: ${deployer.address}`);
    console.log(`   网络: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`   部署者余额: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB`);
    
    // 检查网络支持
    const isTestnet = network.chainId === 97n;
    const isMainnet = network.chainId === 56n;
    
    if (!isTestnet && !isMainnet) {
      throw new Error(`❌ 不支持的网络: ${network.name} (Chain ID: ${network.chainId})`);
    }
    
    console.log(`🌐 目标网络: ${isTestnet ? 'BSC测试网' : 'BSC主网'}`);
    
    // 检查余额
    const balance = await ethers.provider.getBalance(deployer.address);
    const minBalance = ethers.parseEther("0.1"); // 最少需要0.1 BNB
    
    if (balance < minBalance) {
      console.warn(`⚠️  警告: 账户余额较低 (${ethers.formatEther(balance)} BNB)`);
      console.warn(`   建议至少准备 ${ethers.formatEther(minBalance)} BNB 用于部署`);
    }
    
    // 2. 部署YesCoin代币合约
    const yesCoinDeployment = await deployContract(
      "YesCoinToken",
      [
        DEPLOY_CONFIG.token.name,
        DEPLOY_CONFIG.token.symbol,
        DEPLOY_CONFIG.token.totalSupply
      ],
      "YesCoin代币"
    );
    deploymentState.contracts.YesCoin = yesCoinDeployment;
    
    // 3. 部署Guardian NFT合约
    const guardianNFTDeployment = await deployContract(
      "YesCoinGuardianNFT",
      [
        DEPLOY_CONFIG.nft.name,
        DEPLOY_CONFIG.nft.symbol,
        DEPLOY_CONFIG.nft.baseURI,
        DEPLOY_CONFIG.nft.maxSupply,
        DEPLOY_CONFIG.nft.mintPrice
      ],
      "Guardian NFT"
    );
    deploymentState.contracts.GuardianNFT = guardianNFTDeployment;
    
    // 4. 部署空投合约
    const airdropDeployment = await deployContract(
      "YesCoinAirdrop",
      [
        yesCoinDeployment.address,
        guardianNFTDeployment.address,
        DEPLOY_CONFIG.airdrop.taskReward,
        DEPLOY_CONFIG.airdrop.referralBonus
      ],
      "空投"
    );
    deploymentState.contracts.YesCoinAirdrop = airdropDeployment;
    
    // 5. 验证部署
    const verificationSuccess = await verifyDeployment();
    if (!verificationSuccess) {
      throw new Error("合约验证失败");
    }
    
    // 6. 初始化合约
    const initializationSuccess = await initializeContracts();
    if (!initializationSuccess) {
      throw new Error("合约初始化失败");
    }
    
    // 7. 保存部署信息
    deploymentState.endTime = Date.now();
    const deploymentInfo = await saveDeploymentInfo();
    
    // 8. 显示部署摘要
    console.log("\n🎉 部署完成!");
    console.log("=".repeat(60));
    console.log("📋 部署摘要:");
    console.log(`   网络: ${deploymentInfo.network.name} (${deploymentInfo.network.chainId})`);
    console.log(`   部署时间: ${deploymentInfo.deployment.duration}`);
    console.log(`   总Gas消耗: ${deploymentInfo.deployment.totalGasUsed}`);
    console.log(`   区块高度: ${deploymentInfo.deployment.blockNumber}`);
    
    console.log("\n📍 合约地址:");
    console.log(`   YesCoin代币: ${deploymentInfo.contracts.YesCoin.address}`);
    console.log(`   Guardian NFT: ${deploymentInfo.contracts.GuardianNFT.address}`);
    console.log(`   空投合约: ${deploymentInfo.contracts.YesCoinAirdrop.address}`);
    
    if (deploymentInfo.network.blockExplorer) {
      console.log("\n🔍 区块链浏览器链接:");
      console.log(`   YesCoin: ${deploymentInfo.network.blockExplorer}/address/${deploymentInfo.contracts.YesCoin.address}`);
      console.log(`   Guardian NFT: ${deploymentInfo.network.blockExplorer}/address/${deploymentInfo.contracts.GuardianNFT.address}`);
      console.log(`   空投合约: ${deploymentInfo.network.blockExplorer}/address/${deploymentInfo.contracts.YesCoinAirdrop.address}`);
    }
    
    console.log("\n💡 下一步:");
    console.log(`   1. 更新前端环境变量文件 (.env.${deploymentState.network.name})`);
    console.log(`   2. 更新后端配置文件中的合约地址`);
    console.log(`   3. 在区块链浏览器上验证合约源码`);
    console.log(`   4. 测试合约功能`);
    
  } catch (error) {
    deploymentState.endTime = Date.now();
    console.error("\n❌ 部署失败!");
    console.error(`错误: ${error.message}`);
    
    if (error.stack) {
      console.error(`\n堆栈跟踪:\n${error.stack}`);
    }
    
    console.log("\n🔧 故障排除建议:");
    console.log("   1. 检查网络连接和RPC端点");
    console.log("   2. 确认账户有足够的BNB余额");
    console.log("   3. 验证私钥配置正确");
    console.log("   4. 检查合约代码是否有语法错误");
    
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 执行部署
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n✅ 部署脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ 部署脚本执行失败:", error);
      process.exit(1);
    });
}

module.exports = { main, DEPLOY_CONFIG };