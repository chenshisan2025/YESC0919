import { PrismaClient } from '@prisma/client';
import { ApiError } from '../types';

// Global Prisma client instance
let prisma: PrismaClient;

// Initialize Prisma client with proper configuration
export function initializePrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });

    // Handle graceful shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });

    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }

  return prisma;
}

// Get Prisma client instance
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    return initializePrisma();
  }
  return prisma;
}

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Transaction wrapper with error handling
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient();
  
  try {
    return await client.$transaction(async (tx) => {
      return await callback(tx as PrismaClient);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw new ApiError({
      code: 'TRANSACTION_FAILED',
      message: 'Database transaction failed',
      details: error
    });
  }
}

// Seed default tasks
export async function seedDefaultTasks(): Promise<void> {
  const client = getPrismaClient();
  
  const defaultTasks = [
    {
      name: 'follow_twitter',
      title: 'Follow YesCoin on Twitter',
      description: 'Follow our official Twitter account @YesCoin',
      points: 100,
    },
    {
      name: 'join_telegram',
      title: 'Join Telegram Community',
      description: 'Join our Telegram community for updates',
      points: 100,
    },
    {
      name: 'like_post',
      title: 'Like Announcement Post',
      description: 'Like our latest announcement post',
      points: 50,
    },
    {
      name: 'share_post',
      title: 'Share on Social Media',
      description: 'Share YesCoin with your friends',
      points: 150,
    },
    {
      name: 'visit_website',
      title: 'Visit Official Website',
      description: 'Visit and explore our official website',
      points: 25,
    },
  ];

  try {
    for (const task of defaultTasks) {
      await client.task.upsert({
        where: { name: task.name },
        update: {
          title: task.title,
          description: task.description,
          points: task.points,
          isActive: true,
        },
        create: task,
      });
    }
    console.log('Default tasks seeded successfully');
  } catch (error) {
    console.error('Failed to seed default tasks:', error);
    throw error;
  }
}

// Export the client for direct use
export { prisma };
export default getPrismaClient;