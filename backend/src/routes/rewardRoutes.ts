import { Router } from 'express';
import { rewardController } from '../controllers/rewardController';
import { authenticateToken, rateLimit } from '../middleware/auth';

const router = Router();

// Rate limiting configurations
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});

const rewardProcessingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 reward processing requests per minute
  message: {
    success: false,
    error: 'Too many reward processing attempts, please try again later'
  }
});

const distributionRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 distribution requests per 5 minutes
  message: {
    success: false,
    error: 'Too many distribution attempts, please try again later'
  }
});

const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: {
    success: false,
    error: 'Rate limit exceeded, please try again later'
  }
});

// Public routes (no authentication required)

/**
 * @route GET /api/rewards/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', rewardController.healthCheck);

// Protected routes (authentication required)

/**
 * @route POST /api/rewards/process-nft-mint
 * @desc Process referral reward when user mints NFT
 * @access Private
 * @body { nftTokenId: string, transactionHash: string }
 */
router.post('/process-nft-mint', authenticateToken, rewardProcessingRateLimit, rewardController.processNftMintReward);

/**
 * @route POST /api/rewards/process-airdrop-claim
 * @desc Process referral reward when user claims airdrop
 * @access Private
 * @body { airdropAmount: string, transactionHash: string }
 */
router.post('/process-airdrop-claim', authenticateToken, rewardProcessingRateLimit, rewardController.processAirdropClaimReward);

/**
 * @route POST /api/rewards/distribute-token/:rewardId
 * @desc Distribute token reward to user
 * @access Private
 */
router.post('/distribute-token/:rewardId', authenticateToken, distributionRateLimit, rewardController.distributeTokenReward);

/**
 * @route POST /api/rewards/distribute-bnb/:rewardId
 * @desc Distribute BNB reward to user
 * @access Private
 */
router.post('/distribute-bnb/:rewardId', authenticateToken, distributionRateLimit, rewardController.distributeBnbReward);

/**
 * @route GET /api/rewards/pending
 * @desc Get pending rewards for authenticated user
 * @access Private
 */
router.get('/pending', authenticateToken, generalRateLimit, rewardController.getPendingRewards);

/**
 * @route GET /api/rewards/history
 * @desc Get reward history for authenticated user
 * @access Private
 * @query { limit?: number, offset?: number }
 */
router.get('/history', authenticateToken, generalRateLimit, rewardController.getRewardHistory);

/**
 * @route GET /api/rewards/stats
 * @desc Get reward statistics for authenticated user
 * @access Private
 */
router.get('/stats', authenticateToken, generalRateLimit, rewardController.getRewardStats);

/**
 * @route POST /api/rewards/retry/:rewardId
 * @desc Retry failed reward distribution
 * @access Private
 */
router.post('/retry/:rewardId', authenticateToken, distributionRateLimit, rewardController.retryFailedReward);

/**
 * @route GET /api/rewards/:rewardId
 * @desc Get reward details by ID
 * @access Private
 */
router.get('/:rewardId', authenticateToken, strictRateLimit, rewardController.getRewardById);

// Error handling middleware for this router
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Reward routes error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error in reward routes'
  });
});

export default router;