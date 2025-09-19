// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title YesCoinGuardianNFT
 * @dev ERC721 NFT contract for YesCoin Guardian NFTs with referral system
 */
contract YesCoinGuardianNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    // Constants
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.01 ether; // 0.01 BNB mint fee
    uint256 public constant REFERRAL_REWARD_BNB = 0.005 ether; // 0.005 BNB referral reward
    uint256 public constant REFERRAL_REWARD_YES = 1000000 * 10**18; // 1,000,000 YES tokens
    
    // State variables
    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;
    
    // Referral system
    mapping(address => address) public referrers; // minter => referrer
    mapping(address => uint256) public referralCounts; // referrer => count of successful referrals
    mapping(address => uint256) public pendingBNBRewards; // referrer => pending BNB rewards
    mapping(address => uint256) public pendingYESRewards; // referrer => pending YES token rewards
    
    // Events
    event NFTMinted(address indexed minter, uint256 indexed tokenId, address indexed referrer);
    event ReferralReward(address indexed referrer, address indexed minter, uint256 bnbReward, uint256 yesReward);
    event RewardsClaimed(address indexed referrer, uint256 bnbAmount, uint256 yesAmount);
    event BaseURIUpdated(string newBaseURI);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Mint a Guardian NFT with optional referrer
     * @param referrer Optional referrer address (can be zero address)
     */
    function mint(address referrer) external payable nonReentrant whenNotPaused {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(referrer != msg.sender, "Cannot refer yourself");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        
        // Handle referral if valid referrer provided
        if (referrer != address(0)) {
            referrers[msg.sender] = referrer;
            referralCounts[referrer]++;
            
            // Add rewards to pending balances
            pendingBNBRewards[referrer] += REFERRAL_REWARD_BNB;
            pendingYESRewards[referrer] += REFERRAL_REWARD_YES;
            
            emit ReferralReward(referrer, msg.sender, REFERRAL_REWARD_BNB, REFERRAL_REWARD_YES);
        }
        
        emit NFTMinted(msg.sender, tokenId, referrer);
        
        // Refund excess payment
        if (msg.value > MINT_PRICE) {
            payable(msg.sender).transfer(msg.value - MINT_PRICE);
        }
    }
    
    /**
     * @dev Claim pending BNB rewards (YES tokens handled separately)
     */
    function claimBNBRewards() external nonReentrant {
        uint256 bnbReward = pendingBNBRewards[msg.sender];
        require(bnbReward > 0, "No BNB rewards to claim");
        require(address(this).balance >= bnbReward, "Insufficient contract balance");
        
        pendingBNBRewards[msg.sender] = 0;
        payable(msg.sender).transfer(bnbReward);
        
        emit RewardsClaimed(msg.sender, bnbReward, 0);
    }
    
    /**
     * @dev Get mint progress information
     * @return current Current number of minted NFTs
     * @return maximum Maximum supply
     * @return percentage Mint progress percentage (0-100)
     */
    function getMintProgress() external view returns (uint256 current, uint256 maximum, uint256 percentage) {
        current = _nextTokenId - 1;
        maximum = MAX_SUPPLY;
        percentage = (current * 100) / maximum;
        return (current, maximum, percentage);
    }
    
    /**
     * @dev Get referral information for an address
     * @param user Address to query
     * @return referrer The referrer address
     * @return referralCount Number of successful referrals made by this address
     * @return pendingBNB Pending BNB rewards
     * @return pendingYES Pending YES token rewards
     */
    function getReferralInfo(address user) external view returns (
        address referrer,
        uint256 referralCount,
        uint256 pendingBNB,
        uint256 pendingYES
    ) {
        return (
            referrers[user],
            referralCounts[user],
            pendingBNBRewards[user],
            pendingYESRewards[user]
        );
    }
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency withdraw for specific amount (owner only)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    // Internal functions
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Required overrides for multiple inheritance
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}