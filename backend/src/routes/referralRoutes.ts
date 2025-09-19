import { Router } from 'express';
import { referralController } from '../controllers/referralController';
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

const referralCreationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 referral creations per hour
  message: {
    success: false,
    error: 'Too many referral creation attempts, please try again later'
  }
});

const rewardClaimRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 reward claims per minute
  message: {
    success: false,
    error: 'Too many reward claim attempts, please try again later'
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
 * @route GET /api/referrals/validate-referrer/:address
 * @desc Validate referrer address
 * @access Public
 */
router.get('/validate-referrer/:address', generalRateLimit, referralController.validateReferrer);

/**
 * @route GET /api/referrals/leaderboard
 * @desc Get referral leaderboard
 * @access Public
 */
router.get('/leaderboard', generalRateLimit, referralController.getReferralLeaderboard);

/**
 * @route GET /api/referrals/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', referralController.healthCheck);

// Protected routes (authentication required)

/**
 * @route POST /api/referrals/create
 * @desc Create referral relationship
 * @access Private
 */
router.post('/create', authenticateToken, referralCreationRateLimit, referralController.createReferral);

/**
 * @route GET /api/referrals/stats
 * @desc Get referral statistics for authenticated user
 * @access Private
 */
router.get('/stats', authenticateToken, generalRateLimit, referralController.getReferralStats);

/**
 * @route GET /api/referrals/pending-rewards
 * @desc Get pending rewards for authenticated user
 * @access Private
 */
router.get('/pending-rewards', authenticateToken, generalRateLimit, referralController.getPendingRewards);

/**
 * @route POST /api/referrals/claim-bnb/:rewardId
 * @desc Claim BNB reward
 * @access Private
 */
router.post('/claim-bnb/:rewardId', authenticateToken, rewardClaimRateLimit, referralController.claimBnbReward);

/**
 * @route POST /api/referrals/process-airdrop-reward
 * @desc Process referral reward when user claims airdrop
 * @access Private
 */
router.post('/process-airdrop-reward', authenticateToken, strictRateLimit, referralController.processAirdropReward);

/**
 * @route POST /api/referrals/process-nft-reward
 * @desc Process referral reward when user mints NFT
 * @access Private
 */
router.post('/process-nft-reward', authenticateToken, strictRateLimit, referralController.processNftReward);

// Error handling middleware for this router
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Referral routes error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error in referral routes'
  });
});

export default router;