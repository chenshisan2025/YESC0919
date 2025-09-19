import { Router } from 'express';
import { userController } from '../controllers/userController';
import { 
  authenticateToken, 
  validateWalletAddress, 
  validateSignature,
  rateLimit 
} from '../middleware/auth';

const router = Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes
const generalRateLimit = rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

// Public routes (no authentication required)

/**
 * @route POST /api/users/nonce
 * @desc Generate nonce for wallet signature
 * @access Public
 * @body { address: string }
 */
router.post('/nonce', 
  authRateLimit,
  validateWalletAddress,
  userController.generateNonce.bind(userController)
);

/**
 * @route POST /api/users/register
 * @desc Register new user with wallet signature
 * @access Public
 * @body { address: string, signature: string, message: string, referrer?: string }
 */
router.post('/register',
  authRateLimit,
  validateWalletAddress,
  validateSignature,
  userController.register.bind(userController)
);

/**
 * @route POST /api/users/login
 * @desc Login existing user with wallet signature
 * @access Public
 * @body { address: string, signature: string, message: string }
 */
router.post('/login',
  authRateLimit,
  validateWalletAddress,
  validateSignature,
  userController.login.bind(userController)
);

/**
 * @route GET /api/users/check/:address
 * @desc Check if wallet address is registered
 * @access Public
 * @params { address: string }
 */
router.get('/check/:address',
  generalRateLimit,
  userController.checkAddress.bind(userController)
);

// Protected routes (authentication required)

/**
 * @route GET /api/users/profile
 * @desc Get current user profile
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.get('/profile',
  generalRateLimit,
  authenticateToken,
  userController.getProfile.bind(userController)
);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 * @headers { Authorization: Bearer <token> }
 * @body { email?: string, username?: string }
 */
router.put('/profile',
  generalRateLimit,
  authenticateToken,
  userController.updateProfile.bind(userController)
);

/**
 * @route GET /api/users/stats
 * @desc Get user statistics (tasks completed, referrals, etc.)
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.get('/stats',
  generalRateLimit,
  authenticateToken,
  userController.getStats.bind(userController)
);

/**
 * @route GET /api/users/referral
 * @desc Get referral information and statistics
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.get('/referral',
  generalRateLimit,
  authenticateToken,
  userController.getReferralInfo.bind(userController)
);

// Health check endpoint
/**
 * @route GET /api/users/health
 * @desc Health check for user service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'User service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;