import { prisma } from './config/database.ts';

async function testConnection() {
  try {
    // Try to query users table
    const users = await prisma.user.findMany();
    console.log('✅ Database connection successful');
    console.log(`Found ${users.length} users`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();