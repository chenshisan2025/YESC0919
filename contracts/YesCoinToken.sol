// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title YesCoin Token (YES)
 * @dev ERC-20 token contract for YesCoin project
 * Features:
 * - Standard ERC-20 functionality
 * - Ownable for administrative control
 * - Pausable for emergency stops
 * - Fixed total supply of 1 billion tokens
 */
contract YesCoinToken is ERC20, Ownable, Pausable {
    // Total supply: 1 billion YES tokens (18 decimals)
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @dev Constructor that mints the total supply to the deployer
     */
    constructor() ERC20("YesCoin", "YES") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
        emit TokensMinted(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "YesCoin: mint to zero address");
        require(amount > 0, "YesCoin: mint amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        require(amount > 0, "YesCoin: burn amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "YesCoin: insufficient balance to burn");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from specified account (requires allowance)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external {
        require(amount > 0, "YesCoin: burn amount must be greater than 0");
        require(from != address(0), "YesCoin: burn from zero address");
        
        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "YesCoin: burn amount exceeds allowance");
        
        _approve(from, msg.sender, currentAllowance - amount);
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens
     * @param from Address tokens are transferred from
     * @param to Address tokens are transferred to
     * @param value Amount of tokens being transferred
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        super._update(from, to, value);
    }
    
    /**
     * @dev Get contract information
     * @return tokenName Token name
     * @return tokenSymbol Token symbol
     * @return tokenDecimals Token decimals
     * @return tokenTotalSupply Total token supply
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply
    ) {
        return (name(), symbol(), decimals(), totalSupply());
    }
}