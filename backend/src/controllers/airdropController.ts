import { Request, Response } from 'express';
import { airdropService } from '../services/airdropService';
import { ApiResponse, ClaimResponse } from '../types';

export class AirdropController {
  // Check airdrop eligibility
  async checkEligibility(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const result = await airdropService.checkEligibility(req.user.userId);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to check eligibility'
        };
        res.status(500).json(response);
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Check eligibility error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Claim airdrop
  async claimAirdrop(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Check if airdrop is paused
      if (airdropService.isAirdropPaused()) {
        const response: ApiResponse = {
          success: false,
          error: 'Airdrop is currently paused. Please try again later.'
        };
        res.status(503).json(response);
        return;
      }

      const result = await airdropService.claimAirdrop(req.user.userId);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to claim airdrop'
        };
        
        // Determine appropriate status code based on error
        let statusCode = 500;
        if (result.error?.includes('already claimed')) {
          statusCode = 400;
        } else if (result.error?.includes('not eligible')) {
          statusCode = 403;
        } else if (result.error?.includes('not found')) {
          statusCode = 404;
        }
        
        res.status(statusCode).json(response);
        return;
      }

      const response: ClaimResponse = {
        success: true,
        txHash: result.data!.txHash || '',
        amount: result.data!.amount,
        message: 'Airdrop claimed successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Claim airdrop error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get claim history
  async getClaimHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const result = await airdropService.getClaimHistory(req.user.userId);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to get claim history'
        };
        res.status(500).json(response);
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get claim history error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get airdrop statistics (public endpoint)
  async getAirdropStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await airdropService.getAirdropStats();
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to get airdrop statistics'
        };
        res.status(500).json(response);
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get airdrop stats error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Verify claim transaction
  async verifyTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { txHash } = req.params;
      
      if (!txHash) {
        const response: ApiResponse = {
          success: false,
          error: 'Transaction hash is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await airdropService.verifyClaimTransaction(txHash);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to verify transaction'
        };
        res.status(500).json(response);
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Verify transaction error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get user token balance
  async getTokenBalance(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Get user address from database
      const userResult = await airdropService.checkEligibility(req.user.userId);
      if (!userResult.success) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      // Get user address (we need to modify this to get actual address)
      const { address } = req.query;
      if (!address || typeof address !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Wallet address is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await airdropService.getUserTokenBalance(address);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to get token balance'
        };
        res.status(500).json(response);
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get token balance error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Admin: Toggle airdrop status
  async toggleAirdropStatus(req: Request, res: Response): Promise<void> {
    try {
      // This would typically require admin authentication
      // For now, we'll use a simple API key check
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_API_KEY) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized: Admin access required'
        };
        res.status(403).json(response);
        return;
      }

      const { paused } = req.body;
      
      if (typeof paused !== 'boolean') {
        const response: ApiResponse = {
          success: false,
          error: 'Paused status must be a boolean'
        };
        res.status(400).json(response);
        return;
      }

      const result = await airdropService.toggleAirdropStatus(paused);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to toggle airdrop status'
        };
        res.status(500).json(response);
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: `Airdrop ${paused ? 'paused' : 'resumed'} successfully`
      });
    } catch (error) {
      console.error('Toggle airdrop status error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get airdrop status
  async getAirdropStatus(req: Request, res: Response): Promise<void> {
    try {
      const isPaused = airdropService.isAirdropPaused();
      
      res.json({
        success: true,
        data: {
          paused: isPaused,
          status: isPaused ? 'paused' : 'active'
        }
      });
    } catch (error) {
      console.error('Get airdrop status error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}

// Export singleton instance
export const airdropController = new AirdropController();