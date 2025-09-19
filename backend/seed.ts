import { seedDefaultTasks } from './src/utils/database';

async function runSeed() {
  try {
    console.log('🌱 Starting seed process...');
    await seedDefaultTasks();
    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();