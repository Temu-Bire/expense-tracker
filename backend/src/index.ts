import { createApp } from './app';
import { config } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 Expense Tracker Backend running!`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Port:        ${config.port}`);
  console.log(`🩺 Healthcheck: http://localhost:${config.port}${config.apiPrefix}/health`);
  console.log(`===============================================`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connections closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Force shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
