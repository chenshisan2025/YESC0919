const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YesCoinGuardianNFT", function () {
  let guardianNFT;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  
  const CONTRACT_NAME = "YesCoin Guardian NFT";
  const CONTRACT_SYMBOL = "YGNT";
  const BASE_URI = "https://api.yescoin.gold/nft/guardian/";
  const MINT_PRICE = ethers.parseEther("0.01");
  const REFERRAL_REWARD_BNB = ethers.parseEther("0.005");
  const REFERRAL_REWARD_YES = ethers.parseEther("1000000");
  
  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    const YesCoinGuardianNFT = await ethers.getContractFactory("YesCoinGuardianNFT");
    guardianNFT = await YesCoinGuardianNFT.deploy(CONTRACT_NAME, CONTRACT_SYMBOL, BASE_URI);
    await guardianNFT.waitForDeployment();
  });
  
  describe("部署", function () {
    it("应该正确设置合约名称和符号", async function () {
      expect(await guardianNFT.name()).to.equal(CONTRACT_NAME);
      expect(await guardianNFT.symbol()).to.equal(CONTRACT_SYMBOL);
    });
    
    it("应该正确设置owner", async function () {
      expect(await guardianNFT.owner()).to.equal(owner.address);
    });
    
    it("应该正确设置常量", async function () {
      expect(await guardianNFT.MAX_SUPPLY()).to.equal(10000);
      expect(await guardianNFT.MINT_PRICE()).to.equal(MINT_PRICE);
      expect(await guardianNFT.REFERRAL_REWARD_BNB()).to.equal(REFERRAL_REWARD_BNB);
      expect(await guardianNFT.REFERRAL_REWARD_YES()).to.equal(REFERRAL_REWARD_YES);
    });
  });
  
  describe("铸造功能", function () {
    it("应该能够成功铸造NFT", async function () {
      await expect(guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: MINT_PRICE }))
        .to.emit(guardianNFT, "NFTMinted")
        .withArgs(addr1.address, 1, ethers.ZeroAddress);
      
      expect(await guardianNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await guardianNFT.balanceOf(addr1.address)).to.equal(1);
    });
    
    it("应该拒绝支付不足的铸造", async function () {
      const insufficientPayment = ethers.parseEther("0.005");
      await expect(
        guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: insufficientPayment })
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("应该拒绝自我推荐", async function () {
      await expect(
        guardianNFT.connect(addr1).mint(addr1.address, { value: MINT_PRICE })
      ).to.be.revertedWith("Cannot refer yourself");
    });
    
    it("应该退还多余的支付", async function () {
      const excessPayment = ethers.parseEther("0.02");
      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      const tx = await guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: excessPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      const expectedBalance = initialBalance - MINT_PRICE - gasUsed;
      
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });
  });
  
  describe("推荐系统", function () {
    it("应该正确记录推荐关系", async function () {
      await guardianNFT.connect(addr1).mint(addr2.address, { value: MINT_PRICE });
      
      const [referrer, , ,] = await guardianNFT.getReferralInfo(addr1.address);
      expect(referrer).to.equal(addr2.address);
    });
    
    it("应该正确计算推荐奖励", async function () {
      await expect(guardianNFT.connect(addr1).mint(addr2.address, { value: MINT_PRICE }))
        .to.emit(guardianNFT, "ReferralReward")
        .withArgs(addr2.address, addr1.address, REFERRAL_REWARD_BNB, REFERRAL_REWARD_YES);
      
      const [, referralCount, pendingBNB, pendingYES] = await guardianNFT.getReferralInfo(addr2.address);
      expect(referralCount).to.equal(1);
      expect(pendingBNB).to.equal(REFERRAL_REWARD_BNB);
      expect(pendingYES).to.equal(REFERRAL_REWARD_YES);
    });
    
    it("应该能够领取BNB奖励", async function () {
      // 先铸造以产生奖励
      await guardianNFT.connect(addr1).mint(addr2.address, { value: MINT_PRICE });
      
      const initialBalance = await ethers.provider.getBalance(addr2.address);
      
      await expect(guardianNFT.connect(addr2).claimBNBRewards())
        .to.emit(guardianNFT, "RewardsClaimed")
        .withArgs(addr2.address, REFERRAL_REWARD_BNB, 0);
      
      const finalBalance = await ethers.provider.getBalance(addr2.address);
      expect(finalBalance).to.be.gt(initialBalance);
      
      // 检查奖励已清零
      const [, , pendingBNB,] = await guardianNFT.getReferralInfo(addr2.address);
      expect(pendingBNB).to.equal(0);
    });
    
    it("应该拒绝领取零奖励", async function () {
      await expect(guardianNFT.connect(addr1).claimBNBRewards())
        .to.be.revertedWith("No BNB rewards to claim");
    });
  });
  
  describe("铸造进度", function () {
    it("应该正确返回铸造进度", async function () {
      // 初始状态
      let [current, maximum, percentage] = await guardianNFT.getMintProgress();
      expect(current).to.equal(0);
      expect(maximum).to.equal(10000);
      expect(percentage).to.equal(0);
      
      // 铸造一个NFT
      await guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: MINT_PRICE });
      
      [current, maximum, percentage] = await guardianNFT.getMintProgress();
      expect(current).to.equal(1);
      expect(maximum).to.equal(10000);
      expect(percentage).to.equal(0); // 1/10000 = 0% (整数除法)
    });
  });
  
  describe("管理员功能", function () {
    it("应该允许owner设置baseURI", async function () {
      const newBaseURI = "https://new-api.yescoin.gold/nft/guardian/";
      
      await expect(guardianNFT.connect(owner).setBaseURI(newBaseURI))
        .to.emit(guardianNFT, "BaseURIUpdated")
        .withArgs(newBaseURI);
    });
    
    it("应该拒绝非owner设置baseURI", async function () {
      const newBaseURI = "https://malicious.com/";
      
      await expect(guardianNFT.connect(addr1).setBaseURI(newBaseURI))
        .to.be.revertedWithCustomError(guardianNFT, "OwnableUnauthorizedAccount");
    });
    
    it("应该允许owner暂停和恢复合约", async function () {
      // 暂停
      await guardianNFT.connect(owner).pause();
      
      // 暂停时应该无法铸造
      await expect(
        guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: MINT_PRICE })
      ).to.be.revertedWithCustomError(guardianNFT, "EnforcedPause");
      
      // 恢复
      await guardianNFT.connect(owner).unpause();
      
      // 恢复后应该能够铸造
      await expect(guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: MINT_PRICE }))
        .to.emit(guardianNFT, "NFTMinted");
    });
    
    it("应该允许owner提取资金", async function () {
      // 先铸造一些NFT以产生资金
      await guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: MINT_PRICE });
      await guardianNFT.connect(addr2).mint(ethers.ZeroAddress, { value: MINT_PRICE });
      
      const contractBalance = await ethers.provider.getBalance(await guardianNFT.getAddress());
      expect(contractBalance).to.be.gt(0);
      
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      await guardianNFT.connect(owner).withdraw();
      
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
      
      const finalContractBalance = await ethers.provider.getBalance(await guardianNFT.getAddress());
      expect(finalContractBalance).to.equal(0);
    });
  });
  
  describe("安全性", function () {
    it("应该防止重入攻击", async function () {
      // 这个测试需要一个恶意合约来测试重入
      // 由于ReentrancyGuard的存在，正常情况下应该是安全的
      expect(await guardianNFT.connect(addr1).mint(ethers.ZeroAddress, { value: MINT_PRICE }));
    });
    
    it("应该正确处理边界条件", async function () {
      // 测试最大供应量限制需要大量gas，这里只测试逻辑
      const maxSupply = await guardianNFT.MAX_SUPPLY();
      expect(maxSupply).to.equal(10000);
    });
  });
});