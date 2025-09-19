const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Configuration - Update these values before deployment
const CONFIG = {
  // YES Token contract address (deploy token first if not exists)
  YES_TOKEN_ADDRESS: "", // Replace with actual YES token address
  
  // Initial Merkle root (can be updated later)
  INITIAL_MERKLE_ROOT: "0x0000000000000000000000000000000000000000000000000000000000000000",
  
  // Backend signer address for signature verification
  BACKEND_SIGNER: "", // Replace with actual backend signer address
  
  // Amount of YES tokens to transfer to airdrop contract
  AIRDROP_ALLOCATION: "100000000", // 100M YES tokens
};

async function main() {
  console.log("🚀 开始部署 YesCoin 空投合约...");
  
  // Validate configuration
  if (!CONFIG.YES_TOKEN_ADDRESS) {
    console.error("❌ 错误: 请先设置 YES_TOKEN_ADDRESS");
    process.exit(1);
  }
  
  if (!CONFIG.BACKEND_SIGNER) {
    console.error("❌ 错误: 请先设置 BACKEND_SIGNER 地址");
    process.exit(1);
  }
  
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("👤 部署账户:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "BNB");
  console.log("🌐 网络:", hre.network.name);
  console.log("🔗 Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  
  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  警告: 账户余额较低，可能无法完成部署");
  }
  
  // Verify YES token exists
  console.log("\n🔍 验证 YES 代币合约...");
  try {
    const yesToken = await ethers.getContractAt("YesCoinToken", CONFIG.YES_TOKEN_ADDRESS);
    const tokenName = await yesToken.name();
    const tokenSymbol = await yesToken.symbol();
    const totalSupply = await yesToken.totalSupply();
    const deployerBalance = await yesToken.balanceOf(deployer.address);
    
    console.log("✅ YES 代币信息:");
    console.log("   名称:", tokenName);
    console.log("   符号:", tokenSymbol);
    console.log("   总供应量:", ethers.formatEther(totalSupply), "YES");
    console.log("   部署者余额:", ethers.formatEther(deployerBalance), "YES");
    
    const requiredAmount = ethers.parseEther(CONFIG.AIRDROP_ALLOCATION);
    if (deployerBalance < requiredAmount) {
      console.error("❌ 错误: 部署者 YES 代币余额不足");
      console.error(`   需要: ${ethers.formatEther(requiredAmount)} YES`);
      console.error(`   当前: ${ethers.formatEther(deployerBalance)} YES`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ 错误: 无法连接到 YES 代币合约");
    console.error("   地址:", CONFIG.YES_TOKEN_ADDRESS);
    console.error("   错误:", error.message);
    process.exit(1);
  }
  
  // Deploy YesCoin Airdrop Contract
  console.log("\n📦 部署空投合约...");
  console.log("📋 合约参数:");
  console.log("   YES Token:", CONFIG.YES_TOKEN_ADDRESS);
  console.log("   Merkle Root:", CONFIG.INITIAL_MERKLE_ROOT);
  console.log("   Backend Signer:", CONFIG.BACKEND_SIGNER);
  
  const YesCoinAirdrop = await hre.ethers.getContractFactory("YesCoinAirdrop");
  
  console.log("⏳ 正在部署合约...");
  const airdrop = await YesCoinAirdrop.deploy(
    CONFIG.YES_TOKEN_ADDRESS,
    CONFIG.INITIAL_MERKLE_ROOT,
    CONFIG.BACKEND_SIGNER
  );
  
  console.log("⏳ 等待合约部署确认...");
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  
  console.log("✅ 空投合约部署成功!");
  console.log("📍 合约地址:", airdropAddress);
  
  // Transfer tokens to airdrop contract
  console.log("\n💰 转移代币到空投合约...");
  const airdropAllocation = ethers.parseEther(CONFIG.AIRDROP_ALLOCATION);
  console.log("📊 转移数量:", ethers.formatEther(airdropAllocation), "YES");
  
  const yesToken = await ethers.getContractAt("YesCoinToken", CONFIG.YES_TOKEN_ADDRESS);
  
  console.log("⏳ 执行代币转移...");
  const transferTx = await yesToken.transfer(airdropAddress, airdropAllocation);
  console.log("⏳ 等待交易确认...");
  await transferTx.wait();
  
  console.log("✅ 代币转移成功!");
  
  // Verify airdrop contract balance
  const airdropBalance = await yesToken.balanceOf(airdropAddress);
  console.log("💰 空投合约余额:", ethers.formatEther(airdropBalance), "YES");
  
  // Get airdrop statistics
  const stats = await airdrop.getAirdropStats();
  console.log("\n📊 空投合约统计:");
  console.log("   代币余额:", ethers.formatEther(stats.tokenBalance), "YES");
  console.log("   已领取总量:", ethers.formatEther(stats.totalClaimed_), "YES");
  console.log("   领取人数:", stats.totalClaimants_.toString());
  console.log("   剩余代币:", ethers.formatEther(stats.remainingTokens), "YES");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  const blockNumber = await ethers.provider.getBlockNumber();
  
  // Prepare deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number(network.chainId),
    blockNumber: blockNumber,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      YesCoinToken: CONFIG.YES_TOKEN_ADDRESS,
      YesCoinAirdrop: airdropAddress
    },
    config: {
      airdropAllocation: CONFIG.AIRDROP_ALLOCATION,
      merkleRoot: CONFIG.INITIAL_MERKLE_ROOT,
      backendSigner: CONFIG.BACKEND_SIGNER
    },
    transactions: {
      deploy: airdrop.deploymentTransaction()?.hash,
      transfer: transferTx.hash
    }
  };
  
  // Save deployment info
  const deploymentDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentDir, `airdrop-${hre.network.name}-${Date.now()}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n💾 部署信息已保存到:", deploymentPath);
  
  // Verify contract on BSCScan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 验证合约...");
    console.log("⏳ 等待区块确认...");
    
    try {
      await hre.run("verify:verify", {
        address: airdropAddress,
        constructorArguments: [
          CONFIG.YES_TOKEN_ADDRESS,
          CONFIG.INITIAL_MERKLE_ROOT,
          CONFIG.BACKEND_SIGNER
        ],
      });
      console.log("✅ 合约验证成功!");
    } catch (error) {
      console.log("❌ 合约验证失败:", error.message);
      console.log("💡 提示: 可以稍后手动验证合约");
    }
  }
  
  // Display blockchain explorer link
  let explorerUrl = "";
  if (hre.network.name === "bscTestnet") {
    explorerUrl = `https://testnet.bscscan.com/address/${airdropAddress}`;
  } else if (hre.network.name === "bscMainnet") {
    explorerUrl = `https://bscscan.com/address/${airdropAddress}`;
  }
  
  console.log("\n🎉 空投合约部署完成!");
  console.log("📋 部署摘要:");
  console.log("   网络:", hre.network.name);
  console.log("   空投合约:", airdropAddress);
  console.log("   YES 代币:", CONFIG.YES_TOKEN_ADDRESS);
  console.log("   分配数量:", CONFIG.AIRDROP_ALLOCATION, "YES");
  console.log("   后端签名者:", CONFIG.BACKEND_SIGNER);
  
  if (explorerUrl) {
    console.log("   区块链浏览器:", explorerUrl);
  }
  
  console.log("\n📝 下一步操作:");
  console.log("1. 更新后端配置中的空投合约地址");
  console.log("2. 设置 Merkle 根 (如果使用白名单验证)");
  console.log("3. 配置后端签名服务");
  console.log("4. 测试空投功能");
  console.log("5. 开始空投活动");
}

// Error handling
main().catch((error) => {
  console.error("\n❌ 部署失败:");
  console.error(error);
  process.exitCode = 1;
});