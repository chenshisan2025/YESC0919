import { Request, Response } from 'express';
import { rewardService } from '../services/rewardService';
import { AuthenticatedRequest } from '../types';

export class RewardController {
  /**
   * Process NFT mint reward
   */
  async processNftMintReward(req: AuthenticatedRequest, res: Response) {
    try {
      const { nftTokenId, transactionHash } = req.body;
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!nftTokenId || !transactionHash) {
        return res.status(400).json({
          success: false,
          error: 'NFT token ID and transaction hash are required'
        });
      }

      // Validate transaction hash format
      if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction hash format'
        });
      }

      const result = await rewardService.processNftMintReward(
        userAddress,
        nftTokenId,
        transactionHash
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in processNftMintReward:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process NFT mint reward'
      });
    }
  }

  /**
   * Process airdrop claim reward
   */
  async processAirdropClaimReward(req: AuthenticatedRequest, res: Response) {
    try {
      const { airdropAmount, transactionHash } = req.body;
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!airdropAmount || !transactionHash) {
        return res.status(400).json({
          success: false,
          error: 'Airdrop amount and transaction hash are required'
        });
      }

      // Validate airdrop amount
      const amount = parseFloat(airdropAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid airdrop amount'
        });
      }

      // Validate transaction hash format
      if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction hash format'
        });
      }

      const result = await rewardService.processAirdropClaimReward(
        userAddress,
        airdropAmount,
        transactionHash
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in processAirdropClaimReward:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process airdrop claim reward'
      });
    }
  }

  /**
   * Distribute token reward
   */
  async distributeTokenReward(req: AuthenticatedRequest, res: Response) {
    try {
      const { rewardId } = req.params;
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!rewardId) {
        return res.status(400).json({
          success: false,
          error: 'Reward ID is required'
        });
      }

      const result = await rewardService.distributeTokenReward(rewardId);

      res.status(200).json({
        success: true,
        message: 'Token reward distributed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in distributeTokenReward:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to distribute token reward'
      });
    }
  }

  /**
   * Distribute BNB reward
   */
  async distributeBnbReward(req: AuthenticatedRequest, res: Response) {
    try {
      const { rewardId } = req.params;
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!rewardId) {
        return res.status(400).json({
          success: false,
          error: 'Reward ID is required'
        });
      }

      const result = await rewardService.distributeBnbReward(rewardId);

      res.status(200).json({
        success: true,
        message: 'BNB reward distributed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in distributeBnbReward:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to distribute BNB reward'
      });
    }
  }

  /**
   * Get pending rewards for authenticated user
   */
  async getPendingRewards(req: AuthenticatedRequest, res: Response) {
    try {
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const result = await rewardService.getPendingRewards(userAddress);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPendingRewards:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pending rewards'
      });
    }
  }

  /**
   * Get reward history for authenticated user
   */
  async getRewardHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userAddress = req.user?.address;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Validate pagination parameters
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
      }

      if (offset < 0) {
        return res.status(400).json({
          success: false,
          error: 'Offset must be non-negative'
        });
      }

      const result = await rewardService.getRewardHistory(userAddress, limit, offset);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getRewardHistory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reward history'
      });
    }
  }

  /**
   * Get reward statistics for authenticated user
   */
  async getRewardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const result = await rewardService.getRewardStats(userAddress);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getRewardStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reward statistics'
      });
    }
  }

  /**
   * Retry failed reward distribution
   */
  async retryFailedReward(req: AuthenticatedRequest, res: Response) {
    try {
      const { rewardId } = req.params;
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!rewardId) {
        return res.status(400).json({
          success: false,
          error: 'Reward ID is required'
        });
      }

      const result = await rewardService.retryFailedReward(rewardId);

      res.status(200).json({
        success: true,
        message: 'Reward retry completed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in retryFailedReward:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retry reward distribution'
      });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response) {
    try {
      res.status(200).json({
        success: true,
        message: 'Reward service is healthy',
        timestamp: new Date().toISOString(),
        service: 'reward-controller'
      });
    } catch (error) {
      console.error('Error in reward health check:', error);
      res.status(500).json({
        success: false,
        error: 'Reward service health check failed'
      });
    }
  }

  /**
   * Get reward by ID (for admin/debugging)
   */
  async getRewardById(req: AuthenticatedRequest, res: Response) {
    try {
      const { rewardId } = req.params;
      const userAddress = req.user?.address;

      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!rewardId) {
        return res.status(400).json({
          success: false,
          error: 'Reward ID is required'
        });
      }

      // Note: In a production environment, you might want to add additional
      // authorization checks to ensure users can only access their own rewards
      
      const result = await rewardService.getPendingRewards(userAddress);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: 'Reward not found'
        });
      }

      const reward = (result.data as any[]).find(r => r.id === rewardId);
      
      if (!reward) {
        return res.status(404).json({
          success: false,
          error: 'Reward not found or not accessible'
        });
      }

      res.status(200).json({
        success: true,
        data: reward
      });
    } catch (error) {
      console.error('Error in getRewardById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reward details'
      });
    }
  }
}

export const rewardController = new RewardController();