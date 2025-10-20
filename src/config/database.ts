import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.ts';

// Singleton pattern for Prisma Client
class Database {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
      });

      // Note: Cleanup will be handled by the main app shutdown handlers
    }

    return Database.instance;
  }

  public static async connect(): Promise<void> {
    try {
      await Database.getInstance().$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    await Database.getInstance().$disconnect();
    logger.info('Database disconnected');
  }
}

export const prisma = Database.getInstance();
export default Database;
