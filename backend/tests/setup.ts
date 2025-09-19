import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
const prisma = new PrismaClient();

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Clean up test database
  await prisma.taskCompletion.deleteMany();
  await prisma.referralReward.deleteMany();
  await prisma.claimHistory.deleteMany();
  await prisma.user.deleteMany();
});

// Cleanup after all tests
afterAll(async () => {
  // Clean up test database
  await prisma.taskCompletion.deleteMany();
  await prisma.referralReward.deleteMany();
  await prisma.claimHistory.deleteMany();
  await prisma.user.deleteMany();
  
  // Disconnect from database
  await prisma.$disconnect();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data after each test
  await prisma.taskCompletion.deleteMany();
  await prisma.referralReward.deleteMany();
  await prisma.claimHistory.deleteMany();
  await prisma.user.deleteMany();
});

// Export prisma for use in tests
export { prisma };