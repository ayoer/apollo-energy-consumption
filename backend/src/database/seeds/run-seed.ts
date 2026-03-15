import 'reflect-metadata';
import { AppDataSource } from '../../config/database';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected');

    await AppDataSource.runMigrations();
    console.log('✅ Migrations and seeds completed successfully');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
