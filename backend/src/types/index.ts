import { Request } from 'express';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface UserProfile {
  id: string;
  address: string;
  hasClaimed: boolean;
  referrerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  address: string;
  signature: string;
  message: string;
  referrerId?: string;
}

export interface LoginRequest {
  address: string;
  signature: string;
  message: string;
}

export interface RegisterRequest {
  address: string;
  signature: string;
  message: string;
  referrer?: string;
}

export interface NonceResponse {
  success: boolean;
  data: {
    nonce: string;
    message: string;
  };
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: UserProfile;
    token?: string;
  };
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalRewards: string;
  claimedRewards: string;
  pendingRewards: string;
  referralCount: number;
  hasClaimedAirdrop: boolean;
}

// Task Types
export interface TaskInfo {
  id: string;
  name: string;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  completed?: boolean;
  completedAt?: Date;
}

export interface CompleteTaskRequest {
  taskId: string;
  proof?: string; // Optional proof of completion
}

// Claim Types
export interface ClaimRequest {
  address: string;
}

export interface ClaimResponse {
  success: boolean;
  txHash?: string;
  amount: string;
  message: string;
}

// Service Response Types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Referral Types
export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalTokenRewards: number;
  totalBnbRewards: number;
  pendingTokenRewards: number;
  pendingBnbRewards: number;
  referrals: {
    id: string;
    refereeId: string;
    refereeAddress: string;
    createdAt: Date;
    hasClaimedAirdrop: boolean;
    rewardEarned: boolean;
  }[];
}

export interface ReferralRewardData {
  id: string;
  referralId: string;
  referrerId: string;
  type: 'AIRDROP_CLAIM' | 'NFT_MINT';
  tokenAmount: number;
  bnbAmount: number;
  claimed: boolean;
  txHash?: string;
  createdAt: Date;
}

// Reward Types
export interface RewardInfo {
  id: string;
  rewardType: 'BNB' | 'YES_TOKEN';
  amount: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  txHash?: string;
  createdAt: Date;
}

// Auth Types
export interface AuthPayload {
  id: string;
  userId: string;
  address: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface TaskCompletionRequest {
  taskId: string;
  proof?: string;
  verificationData?: any;
}

// Smart Contract Types
export interface ContractConfig {
  tokenAddress: string;
  airdropAddress: string;
  nftAddress: string;
  rpcUrl: string;
  chainId: number;
}

// Database Types
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public code: string;
  public details?: any;

  constructor(options: { code: string; message: string; details?: any }) {
    super(options.message);
    this.code = options.code;
    this.details = options.details;
    this.name = 'ApiError';
  }
}

// Constants
export const AIRDROP_AMOUNT = '10000000000000000000000000'; // 10M tokens in wei
export const REFERRAL_REWARD_BNB = '5000000000000000'; // 0.005 BNB in wei
export const REFERRAL_REWARD_YES = '1000000000000000000000000'; // 1M tokens in wei

// Task Names (enum-like constants)
export const TASK_NAMES = {
  FOLLOW_TWITTER: 'follow_twitter',
  JOIN_TELEGRAM: 'join_telegram',
  LIKE_POST: 'like_post',
  SHARE_POST: 'share_post',
  VISIT_WEBSITE: 'visit_website',
} as const;

export type TaskName = typeof TASK_NAMES[keyof typeof TASK_NAMES];