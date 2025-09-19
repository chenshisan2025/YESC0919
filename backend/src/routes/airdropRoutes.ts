import { Router } from 'express';
import { airdropController } from '../controllers/airdropController';
import { 
  authenticateToken, 
  checkClaimStatus,
  rateLimit 
} from '../middleware/auth';

const router = Router();

// Rate limiting
const claimRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes for claim
const generalRateLimit = rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
const adminRateLimit = rateLimit(20, 15 * 60 * 1000); // 20 requests per 15 minutes for admin

// Public routes

/**
 * @route GET /api/airdrop/stats
 * @desc Get airdrop statistics (total claimed, etc.)
 * @access Public
 */
router.get('/stats',
  generalRateLimit,
  airdropController.getAirdropStats.bind(airdropController)
);

/**
 * @route GET /api/airdrop/status
 * @desc Get airdrop status (active/paused)
 * @access Public
 */
router.get('/status',
  generalRateLimit,
  airdropController.getAirdropStatus.bind(airdropController)
);

/**
 * @route GET /api/airdrop/verify/:txHash
 * @desc Verify a claim transaction on blockchain
 * @access Public
 * @params { txHash: string }
 */
router.get('/verify/:txHash',
  generalRateLimit,
  airdropController.verifyTransaction.bind(airdropController)
);

// Protected routes (authentication required)

/**
 * @route GET /api/airdrop/eligibility
 * @desc Check if user is eligible for airdrop
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.get('/eligibility',
  generalRateLimit,
  authenticateToken,
  airdropController.checkEligibility.bind(airdropController)
);

/**
 * @route POST /api/airdrop/claim
 * @desc Claim airdrop tokens
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.post('/claim',
  claimRateLimit,
  authenticateToken,
  checkClaimStatus, // Middleware to check if user already claimed
  airdropController.claimAirdrop.bind(airdropController)
);

/**
 * @route GET /api/airdrop/history
 * @desc Get user's claim history
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.get('/history',
  generalRateLimit,
  authenticateToken,
  airdropController.getClaimHistory.bind(airdropController)
);

/**
 * @route GET /api/airdrop/balance
 * @desc Get user's token balance
 * @access Private
 * @headers { Authorization: Bearer <token> }
 * @query { address: string }
 */
router.get('/balance',
  generalRateLimit,
  authenticateToken,
  airdropController.getTokenBalance.bind(airdropController)
);

// Admin routes (require admin authentication)

/**
 * @route POST /api/airdrop/admin/toggle
 * @desc Toggle airdrop status (pause/resume)
 * @access Admin
 * @headers { x-admin-key: string }
 * @body { paused: boolean }
 */
router.post('/admin/toggle',
  adminRateLimit,
  airdropController.toggleAirdropStatus.bind(airdropController)
);

// Health check endpoint
/**
 * @route GET /api/airdrop/health
 * @desc Health check for airdrop service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Airdrop service is healthy',
    timestamp: new Date().toISOString(),
    paused: process.env.AIRDROP_PAUSED === 'true'
  });
});

export default router;