import { Request, Response } from 'express';
import { referralService } from '../services/referralService';
import { AuthenticatedRequest } from '../types';

export class ReferralController {
  // POST /api/referrals/create - Create referral relationship
  async createReferral(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { referrerAddress } = req.body;

      if (!refereeId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      if (!referrerAddress) {
        res.status(400).json({
          success: false,
          error: 'Referrer address is required'
        });
        return;
      }

      // Get referrer by wallet address
      const referrerResult = await referralService.getReferrerByAddress(referrerAddress);
      if (!referrerResult.success || !referrerResult.data) {
        res.status(404).json({
          success: false,
          error: 'Referrer not found'
        });
        return;
      }

      const referrerId = referrerResult.data.id;
      const result = await referralService.createReferral(referrerId, refereeId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Referral relationship created successfully'
      });
    } catch (error) {
      console.error('Create referral error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/referrals/stats - Get referral statistics
  async getReferralStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const result = await referralService.getReferralStats(userId);

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get referral stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/referrals/pending-rewards - Get pending rewards
  async getPendingRewards(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const result = await referralService.getPendingRewards(userId);

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get pending rewards error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/referrals/claim-bnb/:rewardId - Claim BNB reward (DISABLED)
  // BNB rewards have been removed from the system
  async claimBnbReward(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(404).json({
      success: false,
      error: 'BNB rewards are no longer available. Only YES token rewards are supported.'
    });
  }

  // POST /api/referrals/process-airdrop-reward - Process referral reward for airdrop claim
  async processAirdropReward(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      if (!refereeId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const result = await referralService.processReferralReward(refereeId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: result.data ? 'Referral reward processed successfully' : 'No referrer found'
      });
    } catch (error) {
      console.error('Process airdrop reward error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/referrals/process-nft-reward - Process referral reward for NFT mint
  async processNftReward(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { nftTokenId } = req.body;

      if (!refereeId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      if (!nftTokenId) {
        res.status(400).json({
          success: false,
          error: 'NFT token ID is required'
        });
        return;
      }

      const result = await referralService.processNftMintReward(refereeId, nftTokenId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: result.data ? 'NFT mint reward processed successfully' : 'No referrer found'
      });
    } catch (error) {
      console.error('Process NFT reward error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/referrals/leaderboard - Get referral leaderboard
  async getReferralLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      if (limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit cannot exceed 100'
        });
        return;
      }

      const result = await referralService.getReferralLeaderboard(limit);

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get referral leaderboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/referrals/validate-referrer/:address - Validate referrer address
  async validateReferrer(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;

      if (!address) {
        res.status(400).json({
          success: false,
          error: 'Referrer address is required'
        });
        return;
      }

      const result = await referralService.getReferrerByAddress(address);

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: {
          valid: !!result.data,
          referrer: result.data
        }
      });
    } catch (error) {
      console.error('Validate referrer error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/referrals/health - Health check endpoint
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        message: 'Referral service is healthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Referral health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Referral service is unhealthy'
      });
    }
  }
}

// Export singleton instance
export const referralController = new ReferralController();