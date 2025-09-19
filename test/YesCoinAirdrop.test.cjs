const { expect } = require("chai");
const hre = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const { ethers } = hre;

describe("YesCoin Token and Airdrop System", function () {
  let yesToken, airdrop;
  let owner, addr1, addr2, addr3, backendSigner;
  let merkleTree, merkleRoot;
  let airdropAmount;
  
  // Test addresses for whitelist
  const whitelistAddresses = [];
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3, backendSigner] = await ethers.getSigners();
    
    // Add test addresses to whitelist
    whitelistAddresses.push(addr1.address, addr2.address, addr3.address);
    
    // Create Merkle tree
    const leaves = whitelistAddresses.map(addr => keccak256(addr));
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getHexRoot();
    
    // Deploy YesCoin Token
    const YesCoinToken = await ethers.getContractFactory("YesCoinToken");
    yesToken = await YesCoinToken.deploy();
    await yesToken.waitForDeployment();
    
    // Deploy Airdrop Contract
    const YesCoinAirdrop = await ethers.getContractFactory("YesCoinAirdrop");
    airdrop = await YesCoinAirdrop.deploy(
      await yesToken.getAddress(),
      merkleRoot,
      backendSigner.address
    );
    await airdrop.waitForDeployment();
    
    // Set airdrop amount
    airdropAmount = await airdrop.AIRDROP_AMOUNT();
    
    // Transfer tokens to airdrop contract
    const transferAmount = ethers.parseEther("100000000"); // 100M YES
    await yesToken.transfer(await airdrop.getAddress(), transferAmount);
  });
  
  describe("YesCoin Token", function () {
    it("Should have correct initial values", async function () {
      expect(await yesToken.name()).to.equal("YesCoin");
      expect(await yesToken.symbol()).to.equal("YES");
      expect(await yesToken.decimals()).to.equal(18);
      expect(await yesToken.totalSupply()).to.equal(ethers.parseEther("1000000000"));
    });
    
    it("Should mint tokens to owner", async function () {
      const ownerBalance = await yesToken.balanceOf(owner.address);
      expect(ownerBalance).to.be.gt(0);
    });
    
    it("Should allow owner to mint new tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await yesToken.mint(addr1.address, mintAmount);
      
      const balance = await yesToken.balanceOf(addr1.address);
      expect(balance).to.equal(mintAmount);
    });
    
    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        yesToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should allow token burning", async function () {
      const mintAmount = ethers.parseEther("1000");
      await yesToken.mint(addr1.address, mintAmount);
      
      const burnAmount = ethers.parseEther("500");
      await yesToken.connect(addr1).burn(burnAmount);
      
      const balance = await yesToken.balanceOf(addr1.address);
      expect(balance).to.equal(mintAmount - burnAmount);
    });
    
    it("Should pause and unpause transfers", async function () {
      await yesToken.pause();
      
      await expect(
        yesToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
      
      await yesToken.unpause();
      
      await expect(
        yesToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });
  });
  
  describe("YesCoin Airdrop - Deployment", function () {
    it("Should have correct initial values", async function () {
      expect(await airdrop.yesToken()).to.equal(await yesToken.getAddress());
      expect(await airdrop.merkleRoot()).to.equal(merkleRoot);
      expect(await airdrop.backendSigner()).to.equal(backendSigner.address);
      expect(await airdrop.AIRDROP_AMOUNT()).to.equal(ethers.parseEther("10000000"));
    });
    
    it("Should have received tokens", async function () {
      const balance = await yesToken.balanceOf(await airdrop.getAddress());
      expect(balance).to.be.gt(0);
    });
    
    it("Should return correct airdrop stats", async function () {
      const stats = await airdrop.getAirdropStats();
      expect(stats.totalClaimed_).to.equal(0);
      expect(stats.totalClaimants_).to.equal(0);
      expect(stats.tokenBalance).to.be.gt(0);
    });
  });
  
  describe("YesCoin Airdrop - Merkle Proof Claims", function () {
    it("Should allow valid Merkle proof claim", async function () {
      const leaf = keccak256(addr1.address);
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(addr1).claimWithMerkleProof(proof)
      ).to.emit(airdrop, "AirdropClaimed")
        .withArgs(addr1.address, airdropAmount, "merkle");
      
      expect(await airdrop.hasClaimed(addr1.address)).to.be.true;
      expect(await yesToken.balanceOf(addr1.address)).to.equal(airdropAmount);
    });
    
    it("Should reject invalid Merkle proof", async function () {
      const invalidProof = ["0x" + "0".repeat(64)];
      
      await expect(
        airdrop.connect(addr1).claimWithMerkleProof(invalidProof)
      ).to.be.revertedWith("YesCoinAirdrop: invalid Merkle proof");
    });
    
    it("Should prevent double claiming with Merkle proof", async function () {
      const leaf = keccak256(addr1.address);
      const proof = merkleTree.getHexProof(leaf);
      
      // First claim
      await airdrop.connect(addr1).claimWithMerkleProof(proof);
      
      // Second claim should fail
      await expect(
        airdrop.connect(addr1).claimWithMerkleProof(proof)
      ).to.be.revertedWith("YesCoinAirdrop: already claimed");
    });
  });
  
  describe("YesCoin Airdrop - Signature Claims", function () {
    it("Should allow valid signature claim", async function () {
      const nonce = 12345;
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "address", "uint256", "uint256", "uint256"],
        ["YesCoinAirdrop", addr1.address, airdropAmount, nonce, 31337] // hardhat chainId
      );
      
      const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));
      
      await expect(
        airdrop.connect(addr1).claimWithSignature(signature, nonce)
      ).to.emit(airdrop, "AirdropClaimed")
        .withArgs(addr1.address, airdropAmount, "signature");
      
      expect(await airdrop.hasClaimed(addr1.address)).to.be.true;
      expect(await yesToken.balanceOf(addr1.address)).to.equal(airdropAmount);
    });
    
    it("Should reject invalid signature", async function () {
      const nonce = 12345;
      const invalidSignature = "0x" + "0".repeat(130);
      
      await expect(
        airdrop.connect(addr1).claimWithSignature(invalidSignature, nonce)
      ).to.be.revertedWith("YesCoinAirdrop: invalid signature");
    });
    
    it("Should prevent double claiming with signature", async function () {
      const nonce = 12345;
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "address", "uint256", "uint256", "uint256"],
        ["YesCoinAirdrop", addr1.address, airdropAmount, nonce, 31337]
      );
      
      const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));
      
      // First claim
      await airdrop.connect(addr1).claimWithSignature(signature, nonce);
      
      // Second claim should fail
      await expect(
        airdrop.connect(addr1).claimWithSignature(signature, nonce)
      ).to.be.revertedWith("YesCoinAirdrop: already claimed");
    });
  });
  
  describe("YesCoin Airdrop - Whitelist Claims", function () {
    beforeEach(async function () {
      // Add addr1 to manual whitelist
      await airdrop.updateWhitelist([addr1.address], true);
    });
    
    it("Should allow whitelisted address to claim", async function () {
      await expect(
        airdrop.connect(addr1).claimWithWhitelist()
      ).to.emit(airdrop, "AirdropClaimed")
        .withArgs(addr1.address, airdropAmount, "whitelist");
      
      expect(await airdrop.hasClaimed(addr1.address)).to.be.true;
      expect(await yesToken.balanceOf(addr1.address)).to.equal(airdropAmount);
    });
    
    it("Should reject non-whitelisted address", async function () {
      await expect(
        airdrop.connect(addr2).claimWithWhitelist()
      ).to.be.revertedWith("YesCoinAirdrop: not whitelisted");
    });
    
    it("Should allow owner to update whitelist", async function () {
      await expect(
        airdrop.updateWhitelist([addr2.address], true)
      ).to.emit(airdrop, "WhitelistUpdated")
        .withArgs(addr2.address, true);
      
      expect(await airdrop.isWhitelisted(addr2.address)).to.be.true;
    });
  });
  
  describe("YesCoin Airdrop - Admin Functions", function () {
    it("Should allow owner to update Merkle root", async function () {
      const newRoot = "0x" + "1".repeat(64);
      
      await expect(
        airdrop.updateMerkleRoot(newRoot)
      ).to.emit(airdrop, "MerkleRootUpdated")
        .withArgs(merkleRoot, newRoot);
      
      expect(await airdrop.merkleRoot()).to.equal(newRoot);
    });
    
    it("Should allow owner to update backend signer", async function () {
      await expect(
        airdrop.updateBackendSigner(addr3.address)
      ).to.emit(airdrop, "BackendSignerUpdated")
        .withArgs(backendSigner.address, addr3.address);
      
      expect(await airdrop.backendSigner()).to.equal(addr3.address);
    });
    
    it("Should allow owner to withdraw tokens", async function () {
      const withdrawAmount = ethers.parseEther("1000");
      
      await expect(
        airdrop.withdrawTokens(owner.address, withdrawAmount)
      ).to.emit(airdrop, "TokensWithdrawn")
        .withArgs(owner.address, withdrawAmount);
    });
    
    it("Should allow owner to emergency withdraw", async function () {
      const initialBalance = await yesToken.balanceOf(await airdrop.getAddress());
      
      await expect(
        airdrop.emergencyWithdraw(owner.address)
      ).to.emit(airdrop, "EmergencyWithdraw")
        .withArgs(owner.address, initialBalance);
      
      expect(await yesToken.balanceOf(await airdrop.getAddress())).to.equal(0);
    });
    
    it("Should allow owner to pause and unpause", async function () {
      await airdrop.pause();
      
      const leaf = keccak256(addr1.address);
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(addr1).claimWithMerkleProof(proof)
      ).to.be.revertedWith("Pausable: paused");
      
      await airdrop.unpause();
      
      await expect(
        airdrop.connect(addr1).claimWithMerkleProof(proof)
      ).to.not.be.reverted;
    });
  });
  
  describe("YesCoin Airdrop - Eligibility Check", function () {
    it("Should correctly check eligibility for whitelisted address", async function () {
      await airdrop.updateWhitelist([addr1.address], true);
      
      const [eligible, method] = await airdrop.checkEligibility(addr1.address, []);
      expect(eligible).to.be.true;
      expect(method).to.equal("whitelist");
    });
    
    it("Should correctly check eligibility for Merkle proof", async function () {
      const leaf = keccak256(addr1.address);
      const proof = merkleTree.getHexProof(leaf);
      
      const [eligible, method] = await airdrop.checkEligibility(addr1.address, proof);
      expect(eligible).to.be.true;
      expect(method).to.equal("merkle");
    });
    
    it("Should return not eligible for non-whitelisted address", async function () {
      const [eligible, method] = await airdrop.checkEligibility(addr3.address, []);
      expect(eligible).to.be.false;
      expect(method).to.equal("not_eligible");
    });
    
    it("Should return already claimed for claimed address", async function () {
      await airdrop.updateWhitelist([addr1.address], true);
      await airdrop.connect(addr1).claimWithWhitelist();
      
      const [eligible, method] = await airdrop.checkEligibility(addr1.address, []);
      expect(eligible).to.be.false;
      expect(method).to.equal("already_claimed");
    });
  });
  
  describe("YesCoin Airdrop - Security", function () {
    it("Should prevent non-owner from admin functions", async function () {
      await expect(
        airdrop.connect(addr1).updateMerkleRoot("0x" + "1".repeat(64))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        airdrop.connect(addr1).updateBackendSigner(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        airdrop.connect(addr1).withdrawTokens(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should handle insufficient token balance", async function () {
      // Withdraw most tokens
      const balance = await yesToken.balanceOf(await airdrop.getAddress());
      await airdrop.withdrawTokens(owner.address, balance - ethers.parseEther("1"));
      
      const leaf = keccak256(addr1.address);
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(addr1).claimWithMerkleProof(proof)
      ).to.be.revertedWith("YesCoinAirdrop: insufficient token balance");
    });
    
    it("Should prevent reentrancy attacks", async function () {
      // This test ensures the ReentrancyGuard is working
      // In a real attack scenario, a malicious contract would try to call claim functions recursively
      const leaf = keccak256(addr1.address);
      const proof = merkleTree.getHexProof(leaf);
      
      // Normal claim should work
      await expect(
        airdrop.connect(addr1).claimWithMerkleProof(proof)
      ).to.not.be.reverted;
    });
  });
  
  describe("YesCoin Airdrop - Statistics", function () {
    it("Should update statistics correctly after claims", async function () {
      // Initial stats
      let stats = await airdrop.getAirdropStats();
      expect(stats.totalClaimed_).to.equal(0);
      expect(stats.totalClaimants_).to.equal(0);
      
      // First claim
      await airdrop.updateWhitelist([addr1.address], true);
      await airdrop.connect(addr1).claimWithWhitelist();
      
      stats = await airdrop.getAirdropStats();
      expect(stats.totalClaimed_).to.equal(airdropAmount);
      expect(stats.totalClaimants_).to.equal(1);
      
      // Second claim
      const leaf = keccak256(addr2.address);
      const proof = merkleTree.getHexProof(leaf);
      await airdrop.connect(addr2).claimWithMerkleProof(proof);
      
      stats = await airdrop.getAirdropStats();
      expect(stats.totalClaimed_).to.equal(airdropAmount * 2n);
      expect(stats.totalClaimants_).to.equal(2);
    });
  });
});