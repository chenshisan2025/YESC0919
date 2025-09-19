import { PrismaClient, User } from '@prisma/client';
import { getPrismaClient } from '../utils/database';
import {
  generateNonce,
  verifyWalletAuth,
  generateJWT,
  normalizeAddress,
  WalletAuthResult
} from '../utils/crypto';
import {
  CreateUserRequest,
  LoginRequest,
  UserProfile,
  ApiResponse,
  AuthPayload
} from '../types';

class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  // Generate nonce for wallet signature
  async generateNonce(address: string): Promise<ApiResponse<{ nonce: string }>> {
    try {
      const normalizedAddress = normalizeAddress(address);
      const nonce = generateNonce();

      // Update or create user with new nonce
      await this.prisma.user.upsert({
        where: { address: normalizedAddress },
        update: { nonce },
        create: {
          address: normalizedAddress,
          nonce,
        },
      });

      return {
        success: true,
        data: { nonce },
        message: 'Nonce generated successfully'
      };
    } catch (error) {
      console.error('Error generating nonce:', error);
      return {
        success: false,
        error: 'Failed to generate nonce'
      };
    }
  }

  // Register new user with wallet signature
  async registerUser(request: CreateUserRequest): Promise<ApiResponse<{ user: UserProfile; token: string }>> {
    try {
      const { address, signature, message, referrerId } = request;

      // Verify wallet signature
      const authResult: WalletAuthResult = verifyWalletAuth(address, message, signature);
      if (!authResult.isValid) {
        return {
          success: false,
          error: authResult.error || 'Invalid wallet signature'
        };
      }

      const normalizedAddress = authResult.address!;

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { address: normalizedAddress }
      });

      if (existingUser) {
        return {
          success: false,
          error: 'User already exists. Please use login instead.'
        };
      }

      // Validate referrer if provided
      let referrer = null;
      if (referrerId) {
        referrer = await this.prisma.user.findUnique({
          where: { id: referrerId }
        });
        if (!referrer) {
          return {
            success: false,
            error: 'Invalid referrer ID'
          };
        }
      }

      // Create new user
      const newUser = await this.prisma.user.create({
        data: {
          address: normalizedAddress,
          nonce: generateNonce(), // Generate new nonce for security
          referrerId: referrer?.id,
        },
      });

      // Generate JWT token
      const authPayload: AuthPayload = {
        id: newUser.id,
        userId: newUser.id,
        address: newUser.address
      };
      const token = generateJWT(authPayload);

      const userProfile: UserProfile = {
        id: newUser.id,
        address: newUser.address,
        hasClaimed: newUser.hasClaimed,
        referrerId: newUser.referrerId,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };

      return {
        success: true,
        data: { user: userProfile, token },
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        error: 'Failed to register user'
      };
    }
  }

  // Login existing user with wallet signature
  async loginUser(request: LoginRequest): Promise<ApiResponse<{ user: UserProfile; token: string }>> {
    try {
      const { address, signature, message } = request;

      // Verify wallet signature
      const authResult: WalletAuthResult = verifyWalletAuth(address, message, signature);
      if (!authResult.isValid) {
        return {
          success: false,
          error: authResult.error || 'Invalid wallet signature'
        };
      }

      const normalizedAddress = authResult.address!;

      // Find existing user
      const user = await this.prisma.user.findUnique({
        where: { address: normalizedAddress }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found. Please register first.'
        };
      }

      // Update user's nonce for security
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { nonce: generateNonce() }
      });

      // Generate JWT token
      const authPayload: AuthPayload = {
        id: updatedUser.id,
        userId: updatedUser.id,
        address: updatedUser.address
      };
      const token = generateJWT(authPayload);

      const userProfile: UserProfile = {
        id: updatedUser.id,
        address: updatedUser.address,
        hasClaimed: updatedUser.hasClaimed,
        referrerId: updatedUser.referrerId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      return {
        success: true,
        data: { user: userProfile, token },
        message: 'User logged in successfully'
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      return {
        success: false,
        error: 'Failed to login user'
      };
    }
  }

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const userProfile: UserProfile = {
        id: user.id,
        address: user.address,
        hasClaimed: user.hasClaimed,
        referrerId: user.referrerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return {
        success: true,
        data: userProfile
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        error: 'Failed to get user profile'
      };
    }
  }

  // Get user by wallet address
  async getUserByAddress(address: string): Promise<User | null> {
    try {
      const normalizedAddress = normalizeAddress(address);
      return await this.prisma.user.findUnique({
        where: { address: normalizedAddress }
      });
    } catch (error) {
      console.error('Error getting user by address:', error);
      return null;
    }
  }

  // Update user claim status
  async updateClaimStatus(userId: string, hasClaimed: boolean): Promise<ApiResponse<UserProfile>> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { hasClaimed }
      });

      const userProfile: UserProfile = {
        id: updatedUser.id,
        address: updatedUser.address,
        hasClaimed: updatedUser.hasClaimed,
        referrerId: updatedUser.referrerId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      return {
        success: true,
        data: userProfile,
        message: 'Claim status updated successfully'
      };
    } catch (error) {
      console.error('Error updating claim status:', error);
      return {
        success: false,
        error: 'Failed to update claim status'
      };
    }
  }

  // Get user's referral count
  async getReferralCount(userId: string): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: { referrerId: userId }
      });
    } catch (error) {
      console.error('Error getting referral count:', error);
      return 0;
    }
  }

  // Check if user exists by address
  async userExists(address: string): Promise<boolean> {
    try {
      const normalizedAddress = normalizeAddress(address);
      const user = await this.prisma.user.findUnique({
        where: { address: normalizedAddress }
      });
      return user !== null;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }
}

export const userService = new UserService();
export default userService;