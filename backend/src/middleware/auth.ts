import { Request, Response, NextFunction } from 'express';
import { verifyJWT, extractJWTFromHeader } from '../utils/crypto';
import { AuthPayload, ApiResponse } from '../types';
import { userService } from '../services/userService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Authentication middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractJWTFromHeader(authHeader);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Access token is required'
      };
      res.status(401).json(response);
      return;
    }

    // Verify JWT token
    const decoded = verifyJWT(token);
    if (!decoded) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired token'
      };
      res.status(401).json(response);
      return;
    }

    // Verify user still exists
    const userProfile = await userService.getUserProfile(decoded.userId);
    if (!userProfile.success) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      res.status(401).json(response);
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Authentication failed'
    };
    res.status(500).json(response);
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractJWTFromHeader(authHeader);

    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) {
        // Verify user still exists
        const userProfile = await userService.getUserProfile(decoded.userId);
        if (userProfile.success) {
          req.user = decoded;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue without authentication
    next();
  }
};

// Middleware to check if user has claimed airdrop
export const checkClaimStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }

    const userProfile = await userService.getUserProfile(req.user.userId);
    if (!userProfile.success || !userProfile.data) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      res.status(404).json(response);
      return;
    }

    if (userProfile.data.hasClaimed) {
      const response: ApiResponse = {
        success: false,
        error: 'Airdrop already claimed'
      };
      res.status(400).json(response);
      return;
    }

    next();
  } catch (error) {
    console.error('Claim status check error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to check claim status'
    };
    res.status(500).json(response);
  }
};

// Rate limiting middleware (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    const userLimit = rateLimitMap.get(identifier);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new limit
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }
    
    if (userLimit.count >= maxRequests) {
      const response: ApiResponse = {
        success: false,
        error: 'Too many requests. Please try again later.'
      };
      res.status(429).json(response);
      return;
    }
    
    userLimit.count++;
    next();
  };
};

// Wallet address validation middleware
export const validateWalletAddress = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { address } = req.body;
  
  if (!address || typeof address !== 'string') {
    const response: ApiResponse = {
      success: false,
      error: 'Valid wallet address is required'
    };
    res.status(400).json(response);
    return;
  }
  
  // Basic Ethereum address format validation
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid wallet address format'
    };
    res.status(400).json(response);
    return;
  }
  
  next();
};

// Request validation middleware
export const validateSignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { signature, message } = req.body;
  
  if (!signature || typeof signature !== 'string') {
    const response: ApiResponse = {
      success: false,
      error: 'Signature is required'
    };
    res.status(400).json(response);
    return;
  }
  
  if (!message || typeof message !== 'string') {
    const response: ApiResponse = {
      success: false,
      error: 'Message is required'
    };
    res.status(400).json(response);
    return;
  }
  
  next();
};

// CORS middleware
export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

// Error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled error:', error);
  
  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Unknown error occurred'
  };
  
  res.status(500).json(response);
};