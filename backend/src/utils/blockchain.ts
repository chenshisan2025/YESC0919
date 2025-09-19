import { ethers } from 'ethers';
import { ContractConfig } from '../types';

// ERC-20 Token ABI (minimal)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// Airdrop Contract ABI (custom)
const AIRDROP_ABI = [
  'function claimAirdrop(address recipient, uint256 amount, bytes32[] calldata merkleProof) external',
  'function hasClaimed(address user) view returns (bool)',
  'function isClaimable(address user) view returns (bool)',
  'function remainingTokens() view returns (uint256)',
  'event AirdropClaimed(address indexed user, uint256 amount)',
];

// NFT Contract ABI (minimal)
const NFT_ABI = [
  'function mint(address to) external payable',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private config: ContractConfig;

  constructor() {
    this.config = {
      tokenAddress: process.env.YES_TOKEN_ADDRESS || '',
      airdropAddress: process.env.AIRDROP_CONTRACT_ADDRESS || '',
      nftAddress: process.env.NFT_CONTRACT_ADDRESS || '',
      rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
      chainId: parseInt(process.env.CHAIN_ID || '56'),
    };

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

    // Initialize wallet (for server transactions)
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('SERVER_PRIVATE_KEY environment variable is required');
    }
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  // Get token contract instance
  private getTokenContract(): ethers.Contract {
    return new ethers.Contract(this.config.tokenAddress, ERC20_ABI, this.wallet);
  }

  // Get airdrop contract instance
  private getAirdropContract(): ethers.Contract {
    return new ethers.Contract(this.config.airdropAddress, AIRDROP_ABI, this.wallet);
  }

  // Get NFT contract instance
  private getNFTContract(): ethers.Contract {
    return new ethers.Contract(this.config.nftAddress, NFT_ABI, this.wallet);
  }

  // Check if user has already claimed airdrop
  async hasUserClaimed(userAddress: string): Promise<boolean> {
    try {
      const airdropContract = this.getAirdropContract();
      return await airdropContract.hasClaimed(userAddress);
    } catch (error) {
      console.error('Error checking claim status:', error);
      throw new Error('Failed to check claim status');
    }
  }

  // Check if user is eligible to claim
  async isUserClaimable(userAddress: string): Promise<boolean> {
    try {
      const airdropContract = this.getAirdropContract();
      return await airdropContract.isClaimable(userAddress);
    } catch (error) {
      console.error('Error checking claimable status:', error);
      throw new Error('Failed to check claimable status');
    }
  }

  // Execute airdrop claim
  async executeAirdropClaim(
    userAddress: string,
    amount: string,
    merkleProof: string[] = []
  ): Promise<string> {
    try {
      const airdropContract = this.getAirdropContract();
      
      // Estimate gas
      const gasEstimate = await airdropContract.claimAirdrop.estimateGas(
        userAddress,
        amount,
        merkleProof
      );

      // Execute transaction with 20% gas buffer
      const tx = await airdropContract.claimAirdrop(
        userAddress,
        amount,
        merkleProof,
        {
          gasLimit: gasEstimate * 120n / 100n,
        }
      );

      console.log(`Airdrop claim transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Airdrop claim confirmed in block: ${receipt.blockNumber}`);
      
      return tx.hash;
    } catch (error) {
      console.error('Error executing airdrop claim:', error);
      throw new Error('Failed to execute airdrop claim');
    }
  }

  // Send BNB reward to referrer
  async sendBNBReward(recipientAddress: string, amount: string): Promise<string> {
    try {
      const tx = await this.wallet.sendTransaction({
        to: recipientAddress,
        value: amount,
      });

      console.log(`BNB reward transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`BNB reward confirmed in block: ${receipt?.blockNumber}`);
      
      return tx.hash;
    } catch (error) {
      console.error('Error sending BNB reward:', error);
      throw new Error('Failed to send BNB reward');
    }
  }

  // Send YES token reward
  async sendTokenReward(recipientAddress: string, amount: string): Promise<string> {
    try {
      const tokenContract = this.getTokenContract();
      
      // Estimate gas
      const gasEstimate = await tokenContract.transfer.estimateGas(
        recipientAddress,
        amount
      );

      // Execute transaction
      const tx = await tokenContract.transfer(
        recipientAddress,
        amount,
        {
          gasLimit: gasEstimate * 120n / 100n,
        }
      );

      console.log(`Token reward transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Token reward confirmed in block: ${receipt.blockNumber}`);
      
      return tx.hash;
    } catch (error) {
      console.error('Error sending token reward:', error);
      throw new Error('Failed to send token reward');
    }
  }

  /**
   * Get user's token balance
   */
  async getTokenBalance(userAddress: string): Promise<string> {
    try {
      const tokenContract = this.getTokenContract();
      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }

  /**
   * Send BNB to user address
   */
  async sendBnb(toAddress: string, amountInWei: string): Promise<string> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }

      // Validate address
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Create transaction
      const tx = {
        to: toAddress,
        value: amountInWei,
        gasLimit: 21000, // Standard gas limit for BNB transfer
      };

      // Send transaction
      const txResponse = await this.wallet.sendTransaction(tx);
      
      // Wait for confirmation
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      console.log(`BNB sent successfully: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      console.error('Error sending BNB:', error);
      throw new Error('Failed to send BNB');
    }
  }

  /**
   * Get BNB balance of an address
   */
  async getBnbBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting BNB balance:', error);
      throw new Error('Failed to get BNB balance');
    }
  }

  // Check if address has minted NFT
  async hasUserMintedNFT(userAddress: string): Promise<boolean> {
    try {
      const nftContract = this.getNFTContract();
      const balance = await nftContract.balanceOf(userAddress);
      return balance > 0;
    } catch (error) {
      console.error('Error checking NFT balance:', error);
      return false;
    }
  }

  // Listen for NFT mint events
  async listenForNFTMints(callback: (from: string, to: string, tokenId: string) => void): Promise<void> {
    try {
      const nftContract = this.getNFTContract();
      
      nftContract.on('Transfer', (from, to, tokenId) => {
        // Only process mint events (from zero address)
        if (from === ethers.ZeroAddress) {
          console.log(`NFT minted: ${to} received token ${tokenId}`);
          callback(from, to, tokenId.toString());
        }
      });

      console.log('Started listening for NFT mint events');
    } catch (error) {
      console.error('Error setting up NFT event listener:', error);
      throw new Error('Failed to setup NFT event listener');
    }
  }

  // Get current gas price
  async getCurrentGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice?.toString() || '0';
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw new Error('Failed to get gas price');
    }
  }

  // Validate transaction hash
  async validateTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt !== null && receipt.status === 1;
    } catch (error) {
      console.error('Error validating transaction:', error);
      return false;
    }
  }

  // Get network info
  getNetworkInfo(): ContractConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;