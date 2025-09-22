import { PrismaClient } from '@prisma/client';
import { blockchainService } from '../utils/blockchain';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

export class RewardService {
  /**
   * Process referral reward when user mints NFT
   */
  async processNftMintReward(userAddress: string, nftTokenId: string, transactionHash: string) {
    try {
      // Find the user who minted the NFT
      const user = await prisma.user.findUnique({
        where: { address: userAddress.toLowerCase() }
      });

      if (!user || !user.referrer) {
        return {
          success: false,
          message: 'User not found or no referrer'
        };
      }

      // Check if reward already processed for this NFT
      const existingReward = await prisma.reward.findFirst({
        where: {
          userId: user.id,
          type: 'NFT_MINT',
          metadata: {
            path: ['nftTokenId'],
            equals: nftTokenId
          }
        }
      });

      if (existingReward) {
        return {
          success: false,
          message: 'Reward already processed for this NFT'
        };
      }

      // Find referrer
      const referrer = await prisma.user.findUnique({
        where: { address: user.referrer.toLowerCase() }
      });

      if (!referrer) {
        return {
          success: false,
          message: 'Referrer not found'
        };
      }

      // Create rewards for referrer
      const rewards = await prisma.$transaction(async (tx) => {
        // 1. Create YES token reward (1,000,000 YES)
        const tokenReward = await tx.reward.create({
          data: {
            userId: referrer.id,
            type: 'REFERRAL_TOKEN',
            amount: '1000000',
            currency: 'YES',
            status: 'PENDING',
            metadata: {
              referredUserId: user.id,
              referredUserAddress: userAddress,
              nftTokenId,
              transactionHash,
              rewardType: 'NFT_MINT_REFERRAL'
            }
          }
        });

        // BNB reward removed - only YES token rewards now

        // 3. Create tracking record
        await tx.reward.create({
          data: {
            userId: user.id,
            type: 'NFT_MINT',
            amount: '1',
            currency: 'NFT',
            status: 'COMPLETED',
            metadata: {
              nftTokenId,
              transactionHash,
              referrerAddress: user.referrer,
              rewardsCreated: [tokenReward.id]
            }
          }
        });

        return { tokenReward };
      });

      // Try to automatically distribute YES tokens
      try {
        await this.distributeTokenReward(rewards.tokenReward.id);
      } catch (error) {
        console.error('Failed to auto-distribute token reward:', error);
        // Continue execution, reward will remain pending
      }

      return {
        success: true,
        message: 'NFT mint rewards processed successfully',
        data: {
          tokenRewardId: rewards.tokenReward.id,
          referrerAddress: referrer.address
        }
      };
    } catch (error) {
      console.error('Error processing NFT mint reward:', error);
      throw new Error('Failed to process NFT mint reward');
    }
  }

  /**
   * Process referral reward when user claims airdrop
   */
  async processAirdropClaimReward(userAddress: string, airdropAmount: string, transactionHash: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { address: userAddress.toLowerCase() }
      });

      if (!user || !user.referrer) {
        return {
          success: false,
          message: 'User not found or no referrer'
        };
      }

      // Check if reward already processed for this airdrop claim
      const existingReward = await prisma.reward.findFirst({
        where: {
          userId: user.id,
          type: 'AIRDROP_CLAIM',
          metadata: {
            path: ['transactionHash'],
            equals: transactionHash
          }
        }
      });

      if (existingReward) {
        return {
          success: false,
          message: 'Reward already processed for this airdrop claim'
        };
      }

      const referrer = await prisma.user.findUnique({
        where: { address: user.referrer.toLowerCase() }
      });

      if (!referrer) {
        return {
          success: false,
          message: 'Referrer not found'
        };
      }

      // Create bonus reward for referrer (10% of airdrop amount)
      const bonusAmount = (parseFloat(airdropAmount) * 0.1).toString();

      const rewards = await prisma.$transaction(async (tx) => {
        // Create bonus token reward
        const bonusReward = await tx.reward.create({
          data: {
            userId: referrer.id,
            type: 'REFERRAL_BONUS',
            amount: bonusAmount,
            currency: 'YES',
            status: 'PENDING',
            metadata: {
              referredUserId: user.id,
              referredUserAddress: userAddress,
              airdropAmount,
              transactionHash,
              rewardType: 'AIRDROP_CLAIM_BONUS'
            }
          }
        });

        // Create tracking record
        await tx.reward.create({
          data: {
            userId: user.id,
            type: 'AIRDROP_CLAIM',
            amount: airdropAmount,
            currency: 'YES',
            status: 'COMPLETED',
            metadata: {
              transactionHash,
              referrerAddress: user.referrer,
              bonusRewardId: bonusReward.id
            }
          }
        });

        return { bonusReward };
      });

      // Try to automatically distribute bonus tokens
      try {
        await this.distributeTokenReward(rewards.bonusReward.id);
      } catch (error) {
        console.error('Failed to auto-distribute bonus reward:', error);
      }

      return {
        success: true,
        message: 'Airdrop claim bonus processed successfully',
        data: {
          bonusRewardId: rewards.bonusReward.id,
          bonusAmount,
          referrerAddress: referrer.address
        }
      };
    } catch (error) {
      console.error('Error processing airdrop claim reward:', error);
      throw new Error('Failed to process airdrop claim reward');
    }
  }

  /**
   * Distribute token reward to user
   */
  async distributeTokenReward(rewardId: string) {
    try {
      const reward = await prisma.reward.findUnique({
        where: { id: rewardId },
        include: { user: true }
      });

      if (!reward || reward.status !== 'PENDING' || reward.currency !== 'YES') {
        throw new Error('Invalid reward for token distribution');
      }

      // Convert amount to wei (18 decimals for YES token)
      const amountInWei = ethers.parseEther(reward.amount);

      // Call smart contract to transfer tokens
      const txHash = await blockchainService.distributeAirdrop(
        reward.user.address,
        amountInWei.toString()
      );

      // Update reward status
      await prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: 'COMPLETED',
          distributedAt: new Date(),
          metadata: {
            ...reward.metadata as any,
            distributionTxHash: txHash
          }
        }
      });

      return {
        success: true,
        transactionHash: txHash
      };
    } catch (error) {
      console.error('Error distributing token reward:', error);
      
      // Update reward status to failed
      await prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: 'FAILED',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      });

      throw error;
    }
  }

  /**
   * Distribute BNB reward to user
   */
  async distributeBnbReward(rewardId: string) {
    try {
      const reward = await prisma.reward.findUnique({
        where: { id: rewardId },
        include: { user: true }
      });

      if (!reward || reward.status !== 'PENDING' || reward.currency !== 'BNB') {
        throw new Error('Invalid reward for BNB distribution');
      }

      // Convert amount to wei
      const amountInWei = ethers.parseEther(reward.amount);

      // Send BNB transaction
      const txHash = await blockchainService.sendBnb(
        reward.user.address,
        amountInWei.toString()
      );

      // Update reward status
      await prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: 'COMPLETED',
          distributedAt: new Date(),
          metadata: {
            ...reward.metadata as any,
            distributionTxHash: txHash
          }
        }
      });

      return {
        success: true,
        transactionHash: txHash
      };
    } catch (error) {
      console.error('Error distributing BNB reward:', error);
      
      // Update reward status to failed
      await prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: 'FAILED',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      });

      throw error;
    }
  }

  /**
   * Get pending rewards for user
   */
  async getPendingRewards(userAddress: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { address: userAddress.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const pendingRewards = await prisma.reward.findMany({
        where: {
          userId: user.id,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: pendingRewards
      };
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      throw new Error('Failed to get pending rewards');
    }
  }

  /**
   * Get reward history for user
   */
  async getRewardHistory(userAddress: string, limit: number = 50, offset: number = 0) {
    try {
      const user = await prisma.user.findUnique({
        where: { address: userAddress.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const rewards = await prisma.reward.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      const totalCount = await prisma.reward.count({
        where: { userId: user.id }
      });

      return {
        success: true,
        data: {
          rewards,
          totalCount,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      console.error('Error getting reward history:', error);
      throw new Error('Failed to get reward history');
    }
  }

  /**
   * Get reward statistics
   */
  async getRewardStats(userAddress: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { address: userAddress.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const stats = await prisma.reward.groupBy({
        by: ['type', 'currency', 'status'],
        where: { userId: user.id },
        _sum: { amount: true },
        _count: true
      });

      const formattedStats = {
        totalRewards: 0,
        completedRewards: 0,
        pendingRewards: 0,
        failedRewards: 0,
        tokenRewards: '0',
        bnbRewards: '0',
        byType: {} as Record<string, any>
      };

      stats.forEach(stat => {
        formattedStats.totalRewards += stat._count;
        
        if (stat.status === 'COMPLETED') {
          formattedStats.completedRewards += stat._count;
        } else if (stat.status === 'PENDING') {
          formattedStats.pendingRewards += stat._count;
        } else if (stat.status === 'FAILED') {
          formattedStats.failedRewards += stat._count;
        }

        if (stat.currency === 'YES' && stat.status === 'COMPLETED') {
          formattedStats.tokenRewards = (
            parseFloat(formattedStats.tokenRewards) + parseFloat(stat._sum.amount || '0')
          ).toString();
        }

        if (stat.currency === 'BNB' && stat.status === 'COMPLETED') {
          formattedStats.bnbRewards = (
            parseFloat(formattedStats.bnbRewards) + parseFloat(stat._sum.amount || '0')
          ).toString();
        }

        const key = `${stat.type}_${stat.currency}`;
        if (!formattedStats.byType[key]) {
          formattedStats.byType[key] = {
            type: stat.type,
            currency: stat.currency,
            completed: 0,
            pending: 0,
            failed: 0,
            totalAmount: '0'
          };
        }

        formattedStats.byType[key][stat.status.toLowerCase()] = stat._count;
        if (stat.status === 'COMPLETED') {
          formattedStats.byType[key].totalAmount = (
            parseFloat(formattedStats.byType[key].totalAmount) + parseFloat(stat._sum.amount || '0')
          ).toString();
        }
      });

      return {
        success: true,
        data: formattedStats
      };
    } catch (error) {
      console.error('Error getting reward stats:', error);
      throw new Error('Failed to get reward statistics');
    }
  }

  /**
   * Retry failed reward distribution
   */
  async retryFailedReward(rewardId: string) {
    try {
      const reward = await prisma.reward.findUnique({
        where: { id: rewardId }
      });

      if (!reward || reward.status !== 'FAILED') {
        throw new Error('Invalid reward for retry');
      }

      // Reset reward status to pending
      await prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: 'PENDING',
          metadata: {
            ...reward.metadata as any,
            retryAttempt: ((reward.metadata as any)?.retryAttempt || 0) + 1
          }
        }
      });

      // Attempt distribution based on currency
      if (reward.currency === 'YES') {
        return await this.distributeTokenReward(rewardId);
      } else if (reward.currency === 'BNB') {
        return await this.distributeBnbReward(rewardId);
      } else {
        throw new Error('Unsupported currency for retry');
      }
    } catch (error) {
      console.error('Error retrying failed reward:', error);
      throw new Error('Failed to retry reward distribution');
    }
  }
}

export const rewardService = new RewardService();