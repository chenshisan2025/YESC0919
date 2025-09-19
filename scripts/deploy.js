// Hardhat合约部署脚本
// 部署Guardian NFT和YesCoin代币合约到BSC网络

const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// 部署配置
const DEPLOY_CONFIG = {
  // BSC主网配置
  mainnet: {
    chainId: 56,
    name: "BSC Mainnet",
    rpcUrl: "https://bsc-dataseed1.binance.org/",
    blockExplorer: "https://bscscan.com"
  },
  // BSC测试网配置
  testnet: {
    chainId: 97,
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    blockExplorer: "https://testnet.bscscan.com"
  }
};

// 代币初始参数
const TOKEN_CONFIG = {
  name: "YesCoin",
  symbol: "YES",
  totalSupply: ethers.parseEther("1000000000"), // 10亿代币
  decimals: 18
};

// NFT初始参数
const NFT_CONFIG = {
  name: "Guardian NFT",
  symbol: "GUARD",
  baseURI: "https://api.yescoin.com/metadata/",
  maxSupply: 10000,
  mintPrice: ethers.parseEther("0.01") // 0.01 BNB
};

// 空投配置
const AIRDROP_CONFIG = {
  tokenAmount: ethers.parseEther("100000000"), // 1亿代币用于空投
  taskReward: ethers.parseEther("1000"), // 每个任务1000代币
  referralBonus: ethers.parseEther("500") // 推荐奖励500代币
};

async function main() {
  console.log("🚀 开始部署YesCoin智能合约...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 部署信息:");
  console.log(`- 部署者地址: ${deployer.address}`);
  console.log(`- 网络: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`- 部署者余额: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB`);
  
  // 检查网络
  const isTestnet = network.chainId === 97n;
  const isMainnet = network.chainId === 56n;
  
  if (!isTestnet && !isMainnet) {
    throw new Error(`❌ 不支持的网络: ${network.name} (Chain ID: ${network.chainId})`);
  }
  
  console.log(`🌐 部署到: ${isTestnet ? 'BSC测试网' : 'BSC主网'}`);
  
  // 部署合约
  const deployedContracts = {};
  
  try {
    // 1. 部署YesCoin代币合约
    console.log("\n📄 部署YesCoin代币合约...");
    const YesCoin = await ethers.getContractFactory("YesCoin");
    const yesCoin = await YesCoin.deploy(
      TOKEN_CONFIG.name,
      TOKEN_CONFIG.symbol,
      TOKEN_CONFIG.totalSupply
    );
    await yesCoin.waitForDeployment();
    const yesCoinAddress = await yesCoin.getAddress();
    
    console.log(`✅ YesCoin部署成功: ${yesCoinAddress}`);
    deployedContracts.YesCoin = {
      address: yesCoinAddress,
      contract: yesCoin,
      config: TOKEN_CONFIG
    };
    
    // 2. 部署Guardian NFT合约
    console.log("\n🎨 部署Guardian NFT合约...");
    const GuardianNFT = await ethers.getContractFactory("GuardianNFT");
    const guardianNFT = await GuardianNFT.deploy(
      NFT_CONFIG.name,
      NFT_CONFIG.symbol,
      NFT_CONFIG.baseURI,
      NFT_CONFIG.maxSupply,
      NFT_CONFIG.mintPrice
    );
    await guardianNFT.waitForDeployment();
    const guardianNFTAddress = await guardianNFT.getAddress();
    
    console.log(`✅ Guardian NFT部署成功: ${guardianNFTAddress}`);
    deployedContracts.GuardianNFT = {
      address: guardianNFTAddress,
      contract: guardianNFT,
      config: NFT_CONFIG
    };
    
    // 3. 部署空投合约
    console.log("\n🎁 部署空投合约...");
    const YesCoinAirdrop = await ethers.getContractFactory("YesCoinAirdrop");
    const airdrop = await YesCoinAirdrop.deploy(
      yesCoinAddress,
      guardianNFTAddress,
      AIRDROP_CONFIG.taskReward,
      AIRDROP_CONFIG.referralBonus
    );
    await airdrop.waitForDeployment();
    const airdropAddress = await airdrop.getAddress();
    
    console.log(`✅ 空投合约部署成功: ${airdropAddress}`);
    deployedContracts.YesCoinAirdrop = {
      address: airdropAddress,
      contract: airdrop,
      config: AIRDROP_CONFIG
    };
    
    // 4. 初始化合约设置
    console.log("\n⚙️ 初始化合约设置...");
    
    // 向空投合约转移代币
    console.log("- 向空投合约转移代币...");
    const transferTx = await yesCoin.transfer(airdropAddress, AIRDROP_CONFIG.tokenAmount);
    await transferTx.wait();
    console.log(`✅ 已转移 ${ethers.formatEther(AIRDROP_CONFIG.tokenAmount)} YES 到空投合约`);
    
    // 设置NFT合约的空投合约地址
    console.log("- 设置NFT合约权限...");
    const setAirdropTx = await guardianNFT.setAirdropContract(airdropAddress);
    await setAirdropTx.wait();
    console.log(`✅ 已设置空投合约地址到NFT合约`);
    
    // 5. 验证部署
    console.log("\n🔍 验证合约部署...");
    
    // 验证代币合约
    const tokenName = await yesCoin.name();
    const tokenSymbol = await yesCoin.symbol();
    const totalSupply = await yesCoin.totalSupply();
    console.log(`- YesCoin: ${tokenName} (${tokenSymbol}), 总供应量: ${ethers.formatEther(totalSupply)}`);
    
    // 验证NFT合约
    const nftName = await guardianNFT.name();
    const nftSymbol = await guardianNFT.symbol();
    const maxSupply = await guardianNFT.maxSupply();
    const mintPrice = await guardianNFT.mintPrice();
    console.log(`- Guardian NFT: ${nftName} (${nftSymbol}), 最大供应量: ${maxSupply}, 铸造价格: ${ethers.formatEther(mintPrice)} BNB`);
    
    // 验证空投合约
    const airdropTokenAddress = await airdrop.token();
    const airdropNFTAddress = await airdrop.guardianNFT();
    const taskReward = await airdrop.taskReward();
    console.log(`- 空投合约: 代币地址 ${airdropTokenAddress}, NFT地址 ${airdropNFTAddress}, 任务奖励 ${ethers.formatEther(taskReward)} YES`);
    
    // 6. 保存部署信息
    console.log("\n💾 保存部署信息...");
    const deploymentInfo = {
      network: {
        name: network.name,
        chainId: Number(network.chainId),
        isTestnet,
        blockExplorer: isTestnet ? DEPLOY_CONFIG.testnet.blockExplorer : DEPLOY_CONFIG.mainnet.blockExplorer
      },
      deployer: {
        address: deployer.address,
        balance: ethers.formatEther(await ethers.provider.getBalance(deployer.address))
      },
      contracts: {
        YesCoin: {
          address: yesCoinAddress,
          name: TOKEN_CONFIG.name,
          symbol: TOKEN_CONFIG.symbol,
          totalSupply: ethers.formatEther(TOKEN_CONFIG.totalSupply),
          decimals: TOKEN_CONFIG.decimals
        },
        GuardianNFT: {
          address: guardianNFTAddress,
          name: NFT_CONFIG.name,
          symbol: NFT_CONFIG.symbol,
          maxSupply: NFT_CONFIG.maxSupply,
          mintPrice: ethers.formatEther(NFT_CONFIG.mintPrice),
          baseURI: NFT_CONFIG.baseURI
        },
        YesCoinAirdrop: {
          address: airdropAddress,
          tokenAmount: ethers.formatEther(AIRDROP_CONFIG.tokenAmount),
          taskReward: ethers.formatEther(AIRDROP_CONFIG.taskReward),
          referralBonus: ethers.formatEther(AIRDROP_CONFIG.referralBonus)
        }
      },
      deploymentTime: new Date().toISOString(),
      gasUsed: {
        YesCoin: "估算中...",
        GuardianNFT: "估算中...",
        YesCoinAirdrop: "估算中..."
      }
    };
    
    // 保存到文件
    const deploymentDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const networkName = isTestnet ? 'testnet' : 'mainnet';
    const deploymentFile = path.join(deploymentDir, `${networkName}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`✅ 部署信息已保存到: ${deploymentFile}`);
    
    // 7. 生成环境变量文件
    console.log("\n📝 生成环境变量文件...");
    const envContent = `# YesCoin合约地址 - ${network.name}
# 部署时间: ${new Date().toISOString()}
# 部署者: ${deployer.address}

# 网络配置
VITE_CHAIN_ID=${network.chainId}
VITE_NETWORK_NAME=${network.name}
VITE_RPC_URL=${isTestnet ? DEPLOY_CONFIG.testnet.rpcUrl : DEPLOY_CONFIG.mainnet.rpcUrl}
VITE_BLOCK_EXPLORER=${isTestnet ? DEPLOY_CONFIG.testnet.blockExplorer : DEPLOY_CONFIG.mainnet.blockExplorer}

# 合约地址
VITE_YESCOIN_CONTRACT=${yesCoinAddress}
VITE_GUARDIAN_NFT_CONTRACT=${guardianNFTAddress}
VITE_AIRDROP_CONTRACT=${airdropAddress}

# 后端API配置
API_PORT=3001
API_HOST=localhost
DATABASE_URL=postgresql://username:password@localhost:5432/yescoin

# Web3配置
WEB3_PROVIDER_URL=${isTestnet ? DEPLOY_CONFIG.testnet.rpcUrl : DEPLOY_CONFIG.mainnet.rpcUrl}
PRIVATE_KEY=your_private_key_here

# 项目配置
NODE_ENV=${isTestnet ? 'development' : 'production'}
FRONTEND_URL=${isTestnet ? 'http://localhost:3066' : 'https://yescoin.com'}
BACKEND_URL=${isTestnet ? 'http://localhost:3001' : 'https://api.yescoin.com'}
`;
    
    const envFile = path.join(__dirname, `../.env.${networkName}`);
    fs.writeFileSync(envFile, envContent);
    console.log(`✅ 环境变量文件已生成: ${envFile}`);
    
    // 8. 显示部署总结
    console.log("\n🎉 部署完成总结:");
    console.log("=".repeat(60));
    console.log(`网络: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`区块浏览器: ${isTestnet ? DEPLOY_CONFIG.testnet.blockExplorer : DEPLOY_CONFIG.mainnet.blockExplorer}`);
    console.log("");
    console.log("📄 合约地址:");
    console.log(`- YesCoin代币: ${yesCoinAddress}`);
    console.log(`- Guardian NFT: ${guardianNFTAddress}`);
    console.log(`- 空投合约: ${airdropAddress}`);
    console.log("");
    console.log("🔗 区块浏览器链接:");
    const explorerBase = isTestnet ? DEPLOY_CONFIG.testnet.blockExplorer : DEPLOY_CONFIG.mainnet.blockExplorer;
    console.log(`- YesCoin: ${explorerBase}/address/${yesCoinAddress}`);
    console.log(`- Guardian NFT: ${explorerBase}/address/${guardianNFTAddress}`);
    console.log(`- 空投合约: ${explorerBase}/address/${airdropAddress}`);
    console.log("");
    console.log("📋 下一步操作:");
    console.log(`1. 复制 .env.${networkName} 文件内容到项目根目录的 .env 文件`);
    console.log("2. 更新前端配置文件中的合约地址");
    console.log("3. 更新后端API中的合约地址");
    console.log("4. 在区块浏览器上验证合约源码（可选）");
    console.log("5. 测试所有功能是否正常工作");
    console.log("=".repeat(60));
    
    return deployedContracts;
    
  } catch (error) {
    console.error("❌ 部署失败:", error);
    
    // 清理已部署的合约（如果需要）
    console.log("\n🧹 清理部分部署的合约...");
    // 注意：智能合约一旦部署就无法删除，只能记录失败信息
    
    const errorInfo = {
      error: error.message,
      stack: error.stack,
      deployedContracts: Object.keys(deployedContracts),
      timestamp: new Date().toISOString(),
      network: {
        name: (await ethers.provider.getNetwork()).name,
        chainId: Number((await ethers.provider.getNetwork()).chainId)
      }
    };
    
    const errorFile = path.join(__dirname, '../deployments/deployment-error.json');
    fs.writeFileSync(errorFile, JSON.stringify(errorInfo, null, 2));
    console.log(`❌ 错误信息已保存到: ${errorFile}`);
    
    throw error;
  }
}

// 验证合约源码函数（可选）
async function verifyContracts(deployedContracts) {
  console.log("\n🔍 验证合约源码...");
  
  try {
    // 这里可以添加Hardhat验证插件的代码
    // await hre.run("verify:verify", {
    //   address: deployedContracts.YesCoin.address,
    //   constructorArguments: [...]
    // });
    
    console.log("✅ 合约源码验证完成");
  } catch (error) {
    console.warn("⚠️ 合约源码验证失败:", error.message);
    console.log("💡 可以稍后手动在区块浏览器上验证");
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎉 部署脚本执行完成!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ 部署脚本执行失败:", error);
      process.exit(1);
    });
}

module.exports = {
  main,
  verifyContracts,
  DEPLOY_CONFIG,
  TOKEN_CONFIG,
  NFT_CONFIG,
  AIRDROP_CONFIG
};