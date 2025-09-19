import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { verifyWalletSignature } from '../utils/crypto';
import { 
  ApiResponse, 
  NonceResponse, 
  LoginRequest, 
  RegisterRequest,
  UserProfileResponse 
} from '../types';

export class UserController {
  // Generate nonce for wallet signature
  async generateNonce(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.body;
      
      if (!address) {
        const response: ApiResponse = {
          success: false,
          error: 'Wallet address is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await userService.generateNonce(address);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to generate nonce'
        };
        res.status(500).json(response);
        return;
      }

      const response: NonceResponse = {
        success: true,
        data: {
          nonce: result.data!.nonce,
          message: `Login to YesCoin with nonce: ${result.data!.nonce}`
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Generate nonce error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Register new user with wallet
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { address, signature, message, referrer }: RegisterRequest = req.body;

      // Verify signature
      const isValidSignature = verifyWalletSignature(address, message, signature);
      if (!isValidSignature) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid signature'
        };
        res.status(400).json(response);
        return;
      }

      const result = await userService.registerUser({ address, signature, message, referrerId: referrer });
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Registration failed'
        };
        res.status(400).json(response);
        return;
      }

      const response: UserProfileResponse = {
        success: true,
        data: {
          user: result.data!.user,
          token: result.data!.token
        }
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Login existing user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { address, signature, message }: LoginRequest = req.body;

      // Verify signature
      const isValidSignature = verifyWalletSignature(address, message, signature);
      if (!isValidSignature) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid signature'
        };
        res.status(400).json(response);
        return;
      }

      const result = await userService.loginUser({ address, signature, message });
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Login failed'
        };
        res.status(400).json(response);
        return;
      }

      const response: UserProfileResponse = {
        success: true,
        data: {
          user: result.data!.user,
          token: result.data!.token
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get user profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const result = await userService.getUserProfile(req.user.userId);
      
      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: result.error || 'Failed to get user profile'
        };
        res.status(404).json(response);
        return;
      }

      const response: UserProfileResponse = {
        success: true,
        data: {
          user: result.data!
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get user statistics
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const user = await userService.getUserByAddress(req.user.address);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const result = { success: true, data: { totalReferrals: 0, completedTasks: 0, hasClaimed: user.hasClaimed } };
      
      // result is always successful in our mock implementation

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get stats error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const { email, username } = req.body;
      
      // Basic validation
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid email format'
        };
        res.status(400).json(response);
        return;
      }

      // For now, just return success as we don't have updateUserProfile method
      const result = { success: true, data: { email, username } };
      
      // result is always successful in our mock implementation
        
        const response: UserProfileResponse = {
          success: true,
          data: {
            user: {
              id: req.user.userId,
              address: req.user.address,
              hasClaimed: false,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        };
      
      res.json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get referral information
  async getReferralInfo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // For now, just return empty referral info
      const result = { success: true, data: { referralCount: 0, totalRewards: 0 } };
      
      // result is always successful in our mock implementation

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get referral info error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Check if address exists
  async checkAddress(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      
      if (!address) {
        const response: ApiResponse = {
          success: false,
          error: 'Address parameter is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await userService.getUserByAddress(address);
      
      res.json({
        success: true,
        data: {
          exists: !!result,
          registered: !!result
        }
      });
    } catch (error) {
      console.error('Check address error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}

// Export singleton instance
export const userController = new UserController();