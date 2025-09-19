import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample wallet addresses for testing
const SAMPLE_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1',
  '0x8ba1f109551bD432803012645Hac136c5c8b4d8b2',
  '0x9ca2f209661cE543814026756Iac246d6d9c5d8b3',
  '0xAdb3f309771dF654825037867Jac357e7eAe6d8b4',
  '0xBec4f409881eG765836048978Kac468f8fBf7d8b5'
];

// Sample tasks for the airdrop
const SAMPLE_TASKS = [
  {
    id: 'follow_twitter',
    title: 'Follow YesCoin on Twitter',
    description: 'Follow our official Twitter account @YesCoinOfficial',
    type: 'social',
    points: 100,
    isRequired: true,
    verificationUrl: 'https://twitter.com/YesCoinOfficial',
    instructions: 'Click the link and follow our Twitter account, then click verify'
  },
  {
    id: 'join_telegram',
    title: 'Join YesCoin Telegram',
    description: 'Join our official Telegram community',
    type: 'social',
    points: 100,
    isRequired: true,
    verificationUrl: 'https://t.me/YesCoinOfficial',
    instructions: 'Join our Telegram group and stay for community updates'
  },
  {
    id: 'retweet_announcement',
    title: 'Retweet Announcement',
    description: 'Retweet our latest airdrop announcement',
    type: 'social',
    points: 50,
    isRequired: true,
    verificationUrl: 'https://twitter.com/YesCoinOfficial/status/123456789',
    instructions: 'Retweet our pinned announcement tweet'
  },
  {
    id: 'discord_join',
    title: 'Join Discord Server',
    description: 'Join our Discord community server',
    type: 'social',
    points: 75,
    isRequired: false,
    verificationUrl: 'https://discord.gg/yescoin',
    instructions: 'Join our Discord server and introduce yourself'
  },
  {
    id: 'youtube_subscribe',
    title: 'Subscribe to YouTube',
    description: 'Subscribe to our YouTube channel',
    type: 'social',
    points: 50,
    isRequired: false,
    verificationUrl: 'https://youtube.com/@YesCoin',
    instructions: 'Subscribe to our YouTube channel for updates'
  },
  {
    id: 'medium_follow',
    title: 'Follow on Medium',
    description: 'Follow our Medium publication',
    type: 'social',
    points: 25,
    isRequired: false,
    verificationUrl: 'https://medium.com/@yescoin',
    instructions: 'Follow our Medium for technical articles'
  },
  {
    id: 'wallet_connect',
    title: 'Connect Wallet',
    description: 'Connect your BSC wallet to the platform',
    type: 'technical',
    points: 200,
    isRequired: true,
    verificationUrl: null,
    instructions: 'Connect your Binance Smart Chain wallet'
  },
  {
    id: 'hold_bnb',
    title: 'Hold 0.01 BNB',
    description: 'Hold at least 0.01 BNB in your wallet',
    type: 'technical',
    points: 150,
    isRequired: false,
    verificationUrl: null,
    instructions: 'Maintain at least 0.01 BNB balance in your connected wallet'
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      
      await prisma.taskCompletion.deleteMany();
      await prisma.referral.deleteMany();
      await prisma.user.deleteMany();
      await prisma.task.deleteMany();
      
      console.log('✅ Existing data cleared');
    }

    // Create sample tasks
    console.log('📋 Creating sample tasks...');
    
    for (const taskData of SAMPLE_TASKS) {
      await prisma.task.upsert({
        where: { id: taskData.id },
        update: taskData,
        create: taskData
      });
    }
    
    console.log(`✅ Created ${SAMPLE_TASKS.length} tasks`);

    // Create sample users
    console.log('👥 Creating sample users...');
    
    const users = [];
    for (let i = 0; i < SAMPLE_ADDRESSES.length; i++) {
      const address = SAMPLE_ADDRESSES[i];
      const user = await prisma.user.upsert({
        where: { address },
        update: {},
        create: {
          address,
          username: `user_${i + 1}`,
          email: `user${i + 1}@example.com`,
          hasClaimed: i === 0, // First user has already claimed
          referrer: i > 0 ? SAMPLE_ADDRESSES[0] : null, // Others referred by first user
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Stagger creation dates
        }
      });
      users.push(user);
    }
    
    console.log(`✅ Created ${users.length} users`);

    // Create sample task completions
    console.log('✅ Creating sample task completions...');
    
    let completionCount = 0;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const tasksToComplete = SAMPLE_TASKS.slice(0, Math.floor(Math.random() * SAMPLE_TASKS.length) + 1);
      
      for (const task of tasksToComplete) {
        await prisma.taskCompletion.upsert({
          where: {
            userId_taskId: {
              userId: user.id,
              taskId: task.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            taskId: task.id,
            completedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
            verified: Math.random() > 0.2, // 80% verified
            proof: `proof_${user.id}_${task.id}`
          }
        });
        completionCount++;
      }
    }
    
    console.log(`✅ Created ${completionCount} task completions`);

    // Create sample referrals
    console.log('🔗 Creating sample referrals...');
    
    let referralCount = 0;
    for (let i = 1; i < users.length; i++) {
      const referral = await prisma.referral.upsert({
        where: {
          refereeId_referrerId: {
            refereeId: users[i].id,
            referrerId: users[0].id // All referred by first user
          }
        },
        update: {},
        create: {
          refereeId: users[i].id,
          referrerId: users[0].id,
          tokenRewardClaimed: i % 2 === 0, // 50% claimed
          bnbRewardClaimed: i % 3 === 0, // 33% claimed
          createdAt: new Date(Date.now() - ((i - 1) * 24 * 60 * 60 * 1000))
        }
      });
      referralCount++;
    }
    
    console.log(`✅ Created ${referralCount} referrals`);

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   Tasks: ${SAMPLE_TASKS.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Task Completions: ${completionCount}`);
    console.log(`   Referrals: ${referralCount}`);
    
    // Display sample data for testing
    console.log('\n🧪 Sample Data for Testing:');
    console.log('   Sample wallet addresses:');
    SAMPLE_ADDRESSES.forEach((address, index) => {
      console.log(`     ${index + 1}. ${address}`);
    });
    
    console.log('\n   Required tasks for airdrop eligibility:');
    SAMPLE_TASKS.filter(task => task.isRequired).forEach(task => {
      console.log(`     - ${task.title} (${task.points} points)`);
    });
    
    console.log('\n   API endpoints to test:');
    console.log('     - POST /api/users/register (with wallet signature)');
    console.log('     - GET /api/tasks (get all tasks)');
    console.log('     - GET /api/tasks/user (get user task status)');
    console.log('     - POST /api/tasks/complete (complete a task)');
    console.log('     - GET /api/airdrops/eligibility (check eligibility)');
    console.log('     - POST /api/airdrops/claim (claim airdrop)');
    console.log('     - GET /api/referrals/stats (referral statistics)');
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });