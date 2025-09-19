import { PrismaClient, User, TaskCompletion } from '@prisma/client';
import { prisma } from '../utils/database';
import { blockchainService } from '../utils/blockchain';
import { ServiceResponse, ClaimRequest, ClaimResponse } from '../types';

export class AirdropService {
  private readonly AIRDROP_AMOUNT = '10000000'; // 10,000,000 YES tokens
  private readonly REQUIRED_TASKS = [
    'follow_twitter',
    'join_telegram', 
    'join_discord',
    'retweet_post',
    'invite_friends'
  ];

  // Check if user is eligible for airdrop
  async checkEligibility(userId: string): Promise<ServiceResponse<{
    eligible: boolean;
    completedTasks: string[];
    missingTasks: string[];
    hasClaimed: boolean;
  }>> {
    try {
      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          taskCompletions: {
            where: { completedAt: { not: undefined } }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Check if already claimed
      if (user.hasClaimed) {
        return {
          success: true,
          data: {
            eligible: false,
            completedTasks: [],
            missingTasks: [],
            hasClaimed: true
          }
        };
      }

      // Get completed task IDs
      const completedTaskIds = user.taskCompletions?.map((tc: any) => tc.taskId) || [];
      
      // Get all required tasks
      const requiredTasks = await prisma.task.findMany({
        where: {
          id: { in: this.REQUIRED_TASKS }
        }
      });

      const completedTasks = requiredTasks
        .filter(task => completedTaskIds.includes(task.id))
        .map(task => task.id);

      const missingTasks = this.REQUIRED_TASKS.filter(
        taskId => !completedTaskIds.includes(taskId)
      );

      const eligible = missingTasks.length === 0;

      return {
        success: true,
        data: {
          eligible,
          completedTasks,
          missingTasks,
          hasClaimed: false
        }
      };
    } catch (error) {
      console.error('Check eligibility error:', error);
      return {
        success: false,
        error: 'Failed to check eligibility'
      };
    }
  }

  // Process airdrop claim
  async claimAirdrop(userId: string): Promise<ServiceResponse<any>> {
    try {
      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Get user with lock
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: {
            taskCompletions: {
              where: { completedAt: { not: undefined } }
            }
          }
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Check if already claimed
        if (user.hasClaimed) {
          throw new Error('Airdrop already claimed');
        }

        // Verify eligibility by checking completed tasks count
        const completedTasks = await tx.taskCompletion.count({
          where: {
            userId,
            completedAt: { not: undefined }
          }
        });
        
        if (completedTasks < this.REQUIRED_TASKS.length) {
          throw new Error('User not eligible for airdrop');
        }

        // Mock blockchain interaction for now
        const blockchainResult = {
          success: true,
          data: {
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            amount: this.AIRDROP_AMOUNT
          }
        };

        // Mock always succeeds
        // if (!blockchainResult.success) {
        //   throw new Error(`Blockchain transaction failed: ${blockchainResult.error}`);
        // }

        // Update user claim status
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            hasClaimed: true
          }
        });

        // Create claim history record
        await tx.claimHistory.create({
          data: {
            userId: userId,
            amount: this.AIRDROP_AMOUNT,
            txHash: blockchainResult.data?.txHash || ''
          }
        });

        return {
          user: updatedUser,
          txHash: blockchainResult.data?.txHash,
          amount: this.AIRDROP_AMOUNT
        };
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Claim airdrop error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to claim airdrop'
      };
    }
  }

  // Get claim history for user
  async getClaimHistory(userId: string): Promise<ServiceResponse<any[]>> {
    try {
      const claimHistory = await prisma.claimHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: claimHistory
      };
    } catch (error) {
      console.error('Get claim history error:', error);
      return {
        success: false,
        error: 'Failed to get claim history'
      };
    }
  }

  // Get airdrop statistics
  async getAirdropStats(): Promise<ServiceResponse<{
    totalClaimed: number;
    totalAmount: string;
    uniqueClaimers: number;
    pendingClaims: number;
  }>> {
    try {
      const [claimHistory, totalUsers, claimedUsers] = await Promise.all([
        prisma.claimHistory.findMany(),
        prisma.user.count(),
        prisma.user.count({ where: { hasClaimed: true } })
      ]);

      const totalClaimed = claimHistory.length;
      const totalAmount = claimHistory.reduce((sum, claim) => {
        return sum + parseFloat(claim.amount);
      }, 0).toString();

      return {
        success: true,
        data: {
          totalClaimed,
          totalAmount,
          uniqueClaimers: claimedUsers,
          pendingClaims: totalUsers - claimedUsers
        }
      };
    } catch (error) {
      console.error('Get airdrop stats error:', error);
      return {
        success: false,
        error: 'Failed to get airdrop statistics'
      };
    }
  }

  // Verify transaction on blockchain
  async verifyClaimTransaction(txHash: string): Promise<ServiceResponse<{
    confirmed: boolean;
    blockNumber?: number;
    timestamp?: number;
  }>> {
    try {
      // Mock verification for now
      const verification = {
        success: true,
        data: {
          confirmed: true,
          blockNumber: 12345,
          timestamp: Date.now()
        }
      };
      
      // Verification is always successful in mock
      // if (!verification.success) {
      //   return {
      //     success: false,
      //     error: verification.error || 'Failed to verify transaction'
      //   };
      // }

      return {
        success: true,
        data: verification.data!
      };
    } catch (error) {
      console.error('Verify transaction error:', error);
      return {
        success: false,
        error: 'Failed to verify transaction'
      };
    }
  }

  // Get user's token balance
  async getUserTokenBalance(address: string): Promise<ServiceResponse<{
    balance: string;
    decimals: number;
  }>> {
    try {
      // Mock balance check for now
      const balanceResult = {
        balance: '0',
        decimals: 18
      };

      return {
        success: true,
        data: balanceResult
      };
    } catch (error) {
      console.error('Get token balance error:', error);
      return {
        success: false,
        error: 'Failed to get token balance'
      };
    }
  }

  // Emergency: Pause/Resume airdrop
  async toggleAirdropStatus(paused: boolean): Promise<ServiceResponse<{ paused: boolean }>> {
    try {
      // This would typically update a global setting in the database
      // For now, we'll use environment variable or in-memory flag
      process.env.AIRDROP_PAUSED = paused.toString();
      
      return {
        success: true,
        data: { paused }
      };
    } catch (error) {
      console.error('Toggle airdrop status error:', error);
      return {
        success: false,
        error: 'Failed to toggle airdrop status'
      };
    }
  }

  // Check if airdrop is currently paused
  isAirdropPaused(): boolean {
    return process.env.AIRDROP_PAUSED === 'true';
  }
}

// Export singleton instance
export const airdropService = new AirdropService();