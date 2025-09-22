import { PrismaClient, User, Referral, ReferralReward } from '@prisma/client';
import { prisma } from '../utils/database';
import { ServiceResponse, ReferralStats, ReferralRewardData } from '../types';
import { blockchainService } from '../utils/blockchain';

export class ReferralService {
  // Create referral relationship
  async createReferral(referrerId: string, refereeId: string): Promise<ServiceResponse<Referral>> {
    try {
      // Check if referrer exists
      const referrer = await prisma.user.findUnique({
        where: { id: referrerId }
      });

      if (!referrer) {
        return {
          success: false,
          error: 'Referrer not found'
        };
      }

      // Check if referee exists
      const referee = await prisma.user.findUnique({
        where: { id: refereeId }
      });

      if (!referee) {
        return {
          success: false,
          error: 'Referee not found'
        };
      }

      // Check if referral relationship already exists
      const existingReferral = await prisma.referral.findFirst({
        where: {
          referrerId,
          refereeId
        }
      });

      if (existingReferral) {
        return {
          success: false,
          error: 'Referral relationship already exists'
        };
      }

      // Check if referee already has a referrer
      const existingReferrer = await prisma.referral.findFirst({
        where: {
          refereeId
        }
      });

      if (existingReferrer) {
        return {
          success: false,
          error: 'User already has a referrer'
        };
      }

      // Prevent self-referral
      if (referrerId === refereeId) {
        return {
          success: false,
          error: 'Cannot refer yourself'
        };
      }

      // Create referral relationship
      const referral = await prisma.referral.create({
        data: {
          referrerId,
          refereeId,
          createdAt: new Date()
        }
      });

      // Update referee's referrer field
      await prisma.user.update({
        where: { id: refereeId },
        data: { referrer: referrerId }
      });

      return {
        success: true,
        data: referral
      };
    } catch (error) {
      console.error('Create referral error:', error);
      return {
        success: false,
        error: 'Failed to create referral relationship'
      };
    }
  }

  // Get referral statistics for a user
  async getReferralStats(userId: string): Promise<ServiceResponse<ReferralStats>> {
    try {
      const [referrals, totalRewards, pendingRewards] = await Promise.all([
        // Get all users referred by this user
        prisma.referral.findMany({
          where: { referrerId: userId },
          include: {
            referee: {
              select: {
                id: true,
                walletAddress: true,
                createdAt: true,
                hasClaimed: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        // Get total rewards earned
        prisma.referralReward.aggregate({
          where: {
            referrerId: userId,
            claimed: true
          },
          _sum: {
            tokenAmount: true,
            bnbAmount: true
          }
        }),
        // Get pending rewards
        prisma.referralReward.aggregate({
          where: {
            referrerId: userId,
            claimed: false
          },
          _sum: {
            tokenAmount: true,
            bnbAmount: true
          }
        })
      ]);

      const stats: ReferralStats = {
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter(r => r.referee.hasClaimed).length,
        totalTokenRewards: totalRewards._sum.tokenAmount || 0,
        totalBnbRewards: totalRewards._sum.bnbAmount || 0,
        pendingTokenRewards: pendingRewards._sum.tokenAmount || 0,
        pendingBnbRewards: pendingRewards._sum.bnbAmount || 0,
        referrals: referrals.map(r => ({
          id: r.id,
          refereeId: r.refereeId,
          refereeAddress: r.referee.walletAddress,
          createdAt: r.createdAt,
          hasClaimedAirdrop: r.referee.hasClaimed,
          rewardEarned: r.rewardEarned
        }))
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Get referral stats error:', error);
      return {
        success: false,
        error: 'Failed to get referral statistics'
      };
    }
  }

  // Process referral reward when referee claims airdrop
  async processReferralReward(refereeId: string): Promise<ServiceResponse<ReferralReward | null>> {
    try {
      // Find the referral relationship
      const referral = await prisma.referral.findFirst({
        where: { refereeId },
        include: {
          referrer: true,
          referee: true
        }
      });

      if (!referral) {
        // No referrer, no reward to process
        return {
          success: true,
          data: null
        };
      }

      // Check if reward already processed
      const existingReward = await prisma.referralReward.findFirst({
        where: {
          referralId: referral.id,
          type: 'AIRDROP_CLAIM'
        }
      });

      if (existingReward) {
        return {
          success: false,
          error: 'Referral reward already processed'
        };
      }

      // Create referral reward record
      const reward = await prisma.referralReward.create({
        data: {
          referralId: referral.id,
          referrerId: referral.referrerId,
          type: 'AIRDROP_CLAIM',
          tokenAmount: 1000000, // 1,000,000 YES tokens
          bnbAmount: 0.005, // 0.005 BNB
          claimed: false,
          createdAt: new Date()
        }
      });

      // Mark referral as reward earned
      await prisma.referral.update({
        where: { id: referral.id },
        data: { rewardEarned: true }
      });

      // Auto-claim token reward (add to user's claimable amount)
      await this.claimTokenReward(reward.id);

      return {
        success: true,
        data: reward
      };
    } catch (error) {
      console.error('Process referral reward error:', error);
      return {
        success: false,
        error: 'Failed to process referral reward'
      };
    }
  }

  // Process referral reward when referee mints NFT
  async processNftMintReward(refereeId: string, nftTokenId: string): Promise<ServiceResponse<ReferralReward | null>> {
    try {
      // Find the referral relationship
      const referral = await prisma.referral.findFirst({
        where: { refereeId },
        include: {
          referrer: true,
          referee: true
        }
      });

      if (!referral) {
        return {
          success: true,
          data: null
        };
      }

      // Check if NFT mint reward already processed
      const existingReward = await prisma.referralReward.findFirst({
        where: {
          referralId: referral.id,
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
          error: 'NFT mint reward already processed'
        };
      }

      // Create NFT mint reward record
      const reward = await prisma.referralReward.create({
        data: {
          referralId: referral.id,
          referrerId: referral.referrerId,
          type: 'NFT_MINT',
          tokenAmount: 1000000, // 1,000,000 YES tokens
          bnbAmount: 0.005, // 0.005 BNB
          claimed: false,
          metadata: {
            nftTokenId,
            refereeAddress: referral.referee.walletAddress
          },
          createdAt: new Date()
        }
      });

      // Auto-claim token reward
      await this.claimTokenReward(reward.id);

      return {
        success: true,
        data: reward
      };
    } catch (error) {
      console.error('Process NFT mint reward error:', error);
      return {
        success: false,
        error: 'Failed to process NFT mint reward'
      };
    }
  }

  // Claim token reward (add to user's claimable amount)
  async claimTokenReward(rewardId: string): Promise<ServiceResponse<boolean>> {
    try {
      const reward = await prisma.referralReward.findUnique({
        where: { id: rewardId },
        include: {
          referrer: true
        }
      });

      if (!reward) {
        return {
          success: false,
          error: 'Reward not found'
        };
      }

      if (reward.claimed) {
        return {
          success: false,
          error: 'Reward already claimed'
        };
      }

      // Update user's claimable token amount
      await prisma.user.update({
        where: { id: reward.referrerId },
        data: {
          claimableTokens: {
            increment: reward.tokenAmount
          }
        }
      });

      // Mark reward as claimed
      await prisma.referralReward.update({
        where: { id: rewardId },
        data: {
          claimed: true,
          claimedAt: new Date()
        }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Claim token reward error:', error);
      return {
        success: false,
        error: 'Failed to claim token reward'
      };
    }
  }

  // Claim BNB reward (DISABLED - BNB rewards removed)
  async claimBnbReward(rewardId: string): Promise<ServiceResponse<string>> {
    return {
      success: false,
      error: 'BNB rewards are no longer available. Only YES token rewards are supported.'
    };
  }

  // Get pending rewards for a user
  async getPendingRewards(userId: string): Promise<ServiceResponse<ReferralReward[]>> {
    try {
      const pendingRewards = await prisma.referralReward.findMany({
        where: {
          referrerId: userId,
          OR: [
            { claimed: false },
            { bnbClaimed: false }
          ]
        },
        include: {
          referral: {
            include: {
              referee: {
                select: {
                  walletAddress: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: pendingRewards
      };
    } catch (error) {
      console.error('Get pending rewards error:', error);
      return {
        success: false,
        error: 'Failed to get pending rewards'
      };
    }
  }

  // Get referral by referrer address (for frontend referral links)
  async getReferrerByAddress(walletAddress: string): Promise<ServiceResponse<User | null>> {
    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress },
        select: {
          id: true,
          walletAddress: true,
          createdAt: true
        }
      });

      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Get referrer by address error:', error);
      return {
        success: false,
        error: 'Failed to get referrer'
      };
    }
  }

  // Get referral leaderboard
  async getReferralLeaderboard(limit: number = 10): Promise<ServiceResponse<{
    userId: string;
    walletAddress: string;
    totalReferrals: number;
    activeReferrals: number;
    totalRewards: number;
  }[]>> {
    try {
      const leaderboard = await prisma.referral.groupBy({
        by: ['referrerId'],
        _count: {
          refereeId: true
        },
        orderBy: {
          _count: {
            refereeId: 'desc'
          }
        },
        take: limit
      });

      const leaderboardWithDetails = await Promise.all(
        leaderboard.map(async (entry) => {
          const [user, activeReferrals, totalRewards] = await Promise.all([
            prisma.user.findUnique({
              where: { id: entry.referrerId },
              select: { walletAddress: true }
            }),
            prisma.referral.count({
              where: {
                referrerId: entry.referrerId,
                rewardEarned: true
              }
            }),
            prisma.referralReward.aggregate({
              where: {
                referrerId: entry.referrerId,
                claimed: true
              },
              _sum: {
                tokenAmount: true
              }
            })
          ]);

          return {
            userId: entry.referrerId,
            walletAddress: user?.walletAddress || '',
            totalReferrals: entry._count.refereeId,
            activeReferrals,
            totalRewards: totalRewards._sum.tokenAmount || 0
          };
        })
      );

      return {
        success: true,
        data: leaderboardWithDetails
      };
    } catch (error) {
      console.error('Get referral leaderboard error:', error);
      return {
        success: false,
        error: 'Failed to get referral leaderboard'
      };
    }
  }
}

// Export singleton instance
export const referralService = new ReferralService();