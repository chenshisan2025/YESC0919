// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title YesCoin Airdrop Contract
 * @dev Airdrop distribution contract for YES tokens
 * Features:
 * - Merkle tree whitelist verification
 * - Backend signature verification
 * - One-time claim per address (10,000,000 YES tokens)
 * - Admin controls for managing airdrop
 * - Emergency pause functionality
 */
contract YesCoinAirdrop is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    // YES token contract
    IERC20 public immutable yesToken;
    
    // Airdrop amount per claim (10,000,000 YES tokens)
    uint256 public constant AIRDROP_AMOUNT = 10_000_000 * 10**18;
    
    // Merkle root for whitelist verification
    bytes32 public merkleRoot;
    
    // Backend signer address for signature verification
    address public backendSigner;
    
    // Mapping to track claimed addresses
    mapping(address => bool) public hasClaimed;
    
    // Mapping for manual whitelist (backup method)
    mapping(address => bool) public isWhitelisted;
    
    // Statistics
    uint256 public totalClaimed;
    uint256 public totalClaimants;
    
    // Events
    event AirdropClaimed(address indexed claimer, uint256 amount, string method);
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);
    event BackendSignerUpdated(address oldSigner, address newSigner);
    event WhitelistUpdated(address indexed user, bool status);
    event TokensWithdrawn(address indexed to, uint256 amount);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _yesToken YES token contract address
     * @param _merkleRoot Initial Merkle root
     * @param _backendSigner Backend signer address
     */
    constructor(
        address _yesToken,
        bytes32 _merkleRoot,
        address _backendSigner
    ) Ownable(msg.sender) {
        require(_yesToken != address(0), "YesCoinAirdrop: token address cannot be zero");
        require(_backendSigner != address(0), "YesCoinAirdrop: signer address cannot be zero");
        
        yesToken = IERC20(_yesToken);
        merkleRoot = _merkleRoot;
        backendSigner = _backendSigner;
    }
    
    /**
     * @dev Claim airdrop using Merkle proof
     * @param merkleProof Merkle proof for the claimer
     */
    function claimWithMerkleProof(bytes32[] calldata merkleProof) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        address claimer = msg.sender;
        require(!hasClaimed[claimer], "YesCoinAirdrop: already claimed");
        require(merkleRoot != bytes32(0), "YesCoinAirdrop: Merkle root not set");
        
        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(claimer));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "YesCoinAirdrop: invalid Merkle proof"
        );
        
        _processClaim(claimer, "merkle");
    }
    
    /**
     * @dev Claim airdrop using backend signature
     * @param signature Backend signature proving task completion
     * @param nonce Unique nonce to prevent replay attacks
     */
    function claimWithSignature(
        bytes calldata signature,
        uint256 nonce
    ) external nonReentrant whenNotPaused {
        address claimer = msg.sender;
        require(!hasClaimed[claimer], "YesCoinAirdrop: already claimed");
        require(backendSigner != address(0), "YesCoinAirdrop: backend signer not set");
        
        // Create message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "YesCoinAirdrop",
                claimer,
                AIRDROP_AMOUNT,
                nonce,
                block.chainid
            )
        );
        
        // Verify signature
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(
            recoveredSigner == backendSigner,
            "YesCoinAirdrop: invalid signature"
        );
        
        _processClaim(claimer, "signature");
    }
    
    /**
     * @dev Claim airdrop using manual whitelist
     */
    function claimWithWhitelist() external nonReentrant whenNotPaused {
        address claimer = msg.sender;
        require(!hasClaimed[claimer], "YesCoinAirdrop: already claimed");
        require(isWhitelisted[claimer], "YesCoinAirdrop: not whitelisted");
        
        _processClaim(claimer, "whitelist");
    }
    
    /**
     * @dev Internal function to process claim
     * @param claimer Address of the claimer
     * @param method Claim method used
     */
    function _processClaim(address claimer, string memory method) internal {
        // Mark as claimed
        hasClaimed[claimer] = true;
        
        // Update statistics
        totalClaimed += AIRDROP_AMOUNT;
        totalClaimants += 1;
        
        // Transfer tokens
        require(
            yesToken.balanceOf(address(this)) >= AIRDROP_AMOUNT,
            "YesCoinAirdrop: insufficient token balance"
        );
        
        yesToken.safeTransfer(claimer, AIRDROP_AMOUNT);
        
        emit AirdropClaimed(claimer, AIRDROP_AMOUNT, method);
    }
    
    /**
     * @dev Update Merkle root (only owner)
     * @param _newMerkleRoot New Merkle root
     */
    function updateMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        bytes32 oldRoot = merkleRoot;
        merkleRoot = _newMerkleRoot;
        emit MerkleRootUpdated(oldRoot, _newMerkleRoot);
    }
    
    /**
     * @dev Update backend signer (only owner)
     * @param _newSigner New backend signer address
     */
    function updateBackendSigner(address _newSigner) external onlyOwner {
        require(_newSigner != address(0), "YesCoinAirdrop: signer cannot be zero address");
        address oldSigner = backendSigner;
        backendSigner = _newSigner;
        emit BackendSignerUpdated(oldSigner, _newSigner);
    }
    
    /**
     * @dev Add/remove addresses from manual whitelist (only owner)
     * @param users Array of user addresses
     * @param status Whitelist status (true = add, false = remove)
     */
    function updateWhitelist(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "YesCoinAirdrop: user cannot be zero address");
            isWhitelisted[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }
    
    /**
     * @dev Withdraw remaining tokens (only owner)
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "YesCoinAirdrop: recipient cannot be zero address");
        require(amount > 0, "YesCoinAirdrop: amount must be greater than 0");
        require(
            yesToken.balanceOf(address(this)) >= amount,
            "YesCoinAirdrop: insufficient balance"
        );
        
        yesToken.safeTransfer(to, amount);
        emit TokensWithdrawn(to, amount);
    }
    
    /**
     * @dev Emergency withdraw all tokens (only owner)
     * @param to Recipient address
     */
    function emergencyWithdraw(address to) external onlyOwner {
        require(to != address(0), "YesCoinAirdrop: recipient cannot be zero address");
        
        uint256 balance = yesToken.balanceOf(address(this));
        require(balance > 0, "YesCoinAirdrop: no tokens to withdraw");
        
        yesToken.safeTransfer(to, balance);
        emit EmergencyWithdraw(to, balance);
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Check if address is eligible for claim
     * @param user Address to check
     * @param merkleProof Merkle proof (optional)
     * @return eligible True if eligible
     * @return method Available claim method
     */
    function checkEligibility(
        address user,
        bytes32[] calldata merkleProof
    ) external view returns (bool eligible, string memory method) {
        if (hasClaimed[user]) {
            return (false, "already_claimed");
        }
        
        // Check whitelist
        if (isWhitelisted[user]) {
            return (true, "whitelist");
        }
        
        // Check Merkle proof
        if (merkleRoot != bytes32(0) && merkleProof.length > 0) {
            bytes32 leaf = keccak256(abi.encodePacked(user));
            if (MerkleProof.verify(merkleProof, merkleRoot, leaf)) {
                return (true, "merkle");
            }
        }
        
        return (false, "not_eligible");
    }
    
    /**
     * @dev Get airdrop statistics
     * @return tokenBalance Current token balance
     * @return totalClaimed_ Total tokens claimed
     * @return totalClaimants_ Total number of claimants
     * @return remainingTokens Remaining tokens for distribution
     */
    function getAirdropStats() external view returns (
        uint256 tokenBalance,
        uint256 totalClaimed_,
        uint256 totalClaimants_,
        uint256 remainingTokens
    ) {
        tokenBalance = yesToken.balanceOf(address(this));
        totalClaimed_ = totalClaimed;
        totalClaimants_ = totalClaimants;
        remainingTokens = tokenBalance;
    }
}