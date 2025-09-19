import crypto from 'crypto';
import { ethers } from 'ethers';
import * as jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

// Generate random nonce for wallet signature
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Verify wallet signature
export function verifyWalletSignature(
  address: string,
  message: string,
  signature: string
): boolean {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Generate message for wallet signing
export function generateSignMessage(nonce: string, address: string): string {
  return `Welcome to YesCoin!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
}

// Generate JWT token
export function generateJWT(payload: AuthPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const options: jwt.SignOptions = {
    expiresIn: '7d',
    issuer: 'yescoin-api',
    audience: 'yescoin-app',
  };

  return jwt.sign(payload, secret, options);
}

// Verify JWT token
export function verifyJWT(token: string): AuthPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'yescoin-api',
      audience: 'yescoin-app',
    }) as AuthPayload;

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Extract JWT from Authorization header
export function extractJWTFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Validate Ethereum address format
export function isValidEthereumAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

// Normalize Ethereum address (checksum)
export function normalizeAddress(address: string): string {
  try {
    return ethers.getAddress(address); // Returns checksummed address
  } catch {
    throw new Error('Invalid Ethereum address');
  }
}

// Hash sensitive data
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate secure random string
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Validate signature timestamp (prevent replay attacks)
export function isSignatureTimestampValid(
  message: string,
  maxAgeMinutes: number = 10
): boolean {
  try {
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) {
      return false;
    }

    const timestamp = parseInt(timestampMatch[1]);
    const now = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

    return (now - timestamp) <= maxAge;
  } catch {
    return false;
  }
}

// Create wallet connection message
export function createWalletMessage(address: string, nonce: string): string {
  return generateSignMessage(nonce, address);
}

// Verify complete wallet authentication
export interface WalletAuthResult {
  isValid: boolean;
  address?: string;
  error?: string;
}

export function verifyWalletAuth(
  address: string,
  message: string,
  signature: string
): WalletAuthResult {
  // Validate address format
  if (!isValidEthereumAddress(address)) {
    return {
      isValid: false,
      error: 'Invalid Ethereum address format'
    };
  }

  // Validate signature timestamp
  if (!isSignatureTimestampValid(message)) {
    return {
      isValid: false,
      error: 'Signature timestamp is too old or invalid'
    };
  }

  // Verify signature
  if (!verifyWalletSignature(address, message, signature)) {
    return {
      isValid: false,
      error: 'Invalid signature'
    };
  }

  return {
    isValid: true,
    address: normalizeAddress(address)
  };
}