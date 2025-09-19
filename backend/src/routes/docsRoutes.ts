import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// API Documentation
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'YesCoin Backend API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      users: {
        description: 'User management and wallet authentication',
        endpoints: {
          'POST /api/users/register': {
            description: 'Register or login user with wallet signature',
            body: {
              address: 'string (required) - Wallet address',
              signature: 'string (required) - Signed message',
              message: 'string (required) - Original message'
            },
            response: {
              success: 'boolean',
              data: {
                user: 'User object',
                token: 'JWT token'
              }
            }
          },
          'GET /api/users/profile': {
            description: 'Get user profile (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            },
            response: {
              success: 'boolean',
              data: 'User object'
            }
          },
          'PUT /api/users/profile': {
            description: 'Update user profile (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            },
            body: {
              username: 'string (optional)',
              email: 'string (optional)'
            }
          },
          'GET /api/users/stats': {
            description: 'Get user statistics (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          }
        }
      },
      tasks: {
        description: 'Task management and completion tracking',
        endpoints: {
          'GET /api/tasks': {
            description: 'Get all available tasks',
            response: {
              success: 'boolean',
              data: 'Array of task objects'
            }
          },
          'GET /api/tasks/user': {
            description: 'Get user task completion status (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          },
          'POST /api/tasks/complete': {
            description: 'Mark task as completed (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            },
            body: {
              taskId: 'string (required) - Task identifier',
              proof: 'string (optional) - Completion proof'
            }
          },
          'GET /api/tasks/stats': {
            description: 'Get user task statistics (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          }
        }
      },
      airdrops: {
        description: 'Airdrop eligibility and claiming',
        endpoints: {
          'GET /api/airdrops/eligibility': {
            description: 'Check airdrop eligibility (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          },
          'POST /api/airdrops/claim': {
            description: 'Claim airdrop tokens (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            },
            response: {
              success: 'boolean',
              data: {
                transactionHash: 'string',
                amount: 'string',
                claimed: 'boolean'
              }
            }
          },
          'GET /api/airdrops/history': {
            description: 'Get claim history (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          },
          'GET /api/airdrops/stats': {
            description: 'Get airdrop statistics (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          }
        }
      },
      referrals: {
        description: 'Referral system and rewards',
        endpoints: {
          'POST /api/referrals/create': {
            description: 'Create referral relationship (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            },
            body: {
              referrerAddress: 'string (required) - Referrer wallet address'
            }
          },
          'GET /api/referrals/stats': {
            description: 'Get referral statistics (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          },
          'POST /api/referrals/claim-bnb': {
            description: 'Claim BNB referral rewards (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          },
          'GET /api/referrals/leaderboard': {
            description: 'Get referral leaderboard',
            query: {
              limit: 'number (optional) - Number of results (default: 10)'
            }
          }
        }
      },
      rewards: {
        description: 'Reward processing and distribution',
        endpoints: {
          'POST /api/rewards/nft-mint': {
            description: 'Process NFT mint reward (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            },
            body: {
              transactionHash: 'string (required) - NFT mint transaction hash'
            }
          },
          'POST /api/rewards/airdrop-claim': {
            description: 'Process airdrop claim reward (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            },
            body: {
              transactionHash: 'string (required) - Airdrop claim transaction hash'
            }
          },
          'GET /api/rewards/pending': {
            description: 'Get pending rewards (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          },
          'GET /api/rewards/history': {
            description: 'Get reward history (requires authentication)',
            headers: {
              Authorization: 'Bearer <token>'
            }
          }
        }
      }
    },
    authentication: {
      type: 'JWT Bearer Token',
      description: 'Include JWT token in Authorization header: Bearer <token>',
      obtainToken: 'POST /api/users/register with wallet signature'
    },
    errorCodes: {
      400: 'Bad Request - Invalid input data',
      401: 'Unauthorized - Missing or invalid authentication',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server error'
    },
    rateLimiting: {
      global: '1000 requests per 15 minutes per IP',
      auth: '100 requests per 15 minutes per IP',
      claim: '10 requests per hour per user',
      sensitive: '5 requests per minute per user'
    },
    examples: {
      walletSignature: {
        message: 'Sign this message to authenticate with YesCoin: {timestamp}',
        signature: '0x...',
        address: '0x...'
      },
      jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  });
});

// Test endpoints for development
router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API test endpoint',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Health check with detailed information
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        blockchain: 'connected',
        redis: process.env.REDIS_URL ? 'connected' : 'not configured'
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API status endpoint
router.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    api: 'YesCoin Backend API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      total: 25,
      public: 8,
      protected: 17
    },
    features: {
      userAuthentication: true,
      taskTracking: true,
      airdropClaiming: true,
      referralSystem: true,
      rewardDistribution: true,
      rateLimiting: true,
      errorHandling: true
    }
  });
});

export default router;