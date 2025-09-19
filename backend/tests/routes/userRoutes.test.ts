import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';
import jwt from 'jsonwebtoken';

describe('User Routes', () => {
  const testAddress = '0x1234567890123456789012345678901234567890';
  const testSignature = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12';
  const testMessage = 'Login to YesCoin';

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          address: testAddress,
          message: testMessage,
          signature: testSignature
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.address).toBe(testAddress);
      expect(response.body.data.token).toBeDefined();
    });

    it('should register user with referrer', async () => {
      const referrerAddress = '0x9876543210987654321098765432109876543210';
      
      // Create referrer first
      await request(app)
        .post('/api/users/register')
        .send({
          address: referrerAddress,
          message: testMessage,
          signature: testSignature
        });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          address: testAddress,
          message: testMessage,
          signature: testSignature,
          referrer: referrerAddress
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.referrer).toBe(referrerAddress);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          address: testAddress
          // missing message and signature
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid address format', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          address: 'invalid-address',
          message: testMessage,
          signature: testSignature
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await prisma.user.create({
        data: {
          address: testAddress,
          hasClaimed: false
        }
      });
    });

    it('should login existing user successfully', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          address: testAddress,
          message: testMessage,
          signature: testSignature
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.address).toBe(testAddress);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          address: '0xnonexistent1234567890123456789012345678',
          message: testMessage,
          signature: testSignature
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create user and generate token
      await prisma.user.create({
        data: {
          address: testAddress,
          hasClaimed: false
        }
      });

      authToken = jwt.sign(
        { address: testAddress },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '24h' }
      );
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(testAddress);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/stats', () => {
    let authToken: string;

    beforeEach(async () => {
      await prisma.user.create({
        data: {
          address: testAddress,
          hasClaimed: false
        }
      });

      authToken = jwt.sign(
        { address: testAddress },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '24h' }
      );
    });

    it('should get user statistics successfully', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalReferrals');
      expect(response.body.data).toHaveProperty('completedTasks');
      expect(response.body.data).toHaveProperty('hasClaimed');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on registration', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app)
            .post('/api/users/register')
            .send({
              address: `0x123456789012345678901234567890123456789${i}`,
              message: testMessage,
              signature: testSignature
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // Should have at least one rate limited response
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});