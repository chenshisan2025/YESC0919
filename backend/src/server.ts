import app from './app';
import { checkDatabaseConnection } from './utils/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'BSC_RPC_URL',
  'PRIVATE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Optional environment variables with warnings
const optionalEnvVars = [
  'TOKEN_CONTRACT_ADDRESS',
  'AIRDROP_CONTRACT_ADDRESS',
  'NFT_CONTRACT_ADDRESS'
];

const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar]);

if (missingOptionalVars.length > 0) {
  console.warn('⚠️  Missing optional environment variables:');
  missingOptionalVars.forEach(envVar => {
    console.warn(`   - ${envVar}`);
  });
  console.warn('\nSome features may not work properly without these variables.');
}

async function startServer() {
  try {
    console.log('🚀 Starting YesCoin Backend Server...');
    
    // Connect to database
    console.log('📊 Connecting to database...');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    console.log('✅ Database connected successfully');
    
    // Start the server
    const server = app.listen(PORT, HOST, () => {
      console.log('\n🎉 YesCoin Backend Server is running!');
      console.log(`📍 Server URL: http://${HOST}:${PORT}`);
      console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
      console.log(`📚 API Documentation: http://${HOST}:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log('\n📋 Available API Endpoints:');
      console.log(`   - Users: http://${HOST}:${PORT}/api/users`);
      console.log(`   - Airdrops: http://${HOST}:${PORT}/api/airdrops`);
      console.log(`   - Tasks: http://${HOST}:${PORT}/api/tasks`);
      console.log(`   - Referrals: http://${HOST}:${PORT}/api/referrals`);
      console.log(`   - Rewards: http://${HOST}:${PORT}/api/rewards`);
      console.log('\n🔧 Ready to accept connections!');
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('Please try a different port or stop the existing process');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📴 Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        console.log('👋 YesCoin Backend Server stopped');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Startup error:', error);
  process.exit(1);
});