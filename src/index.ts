import { PrismaClient } from '@prisma/client';
import { startServer } from './app';
import { SUCCESS_MESSAGES } from '@/constants/messages';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log(SUCCESS_MESSAGES.DATABASE_CONNECTED);
    
    // Start the server
    startServer();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

main();

