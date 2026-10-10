import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-key-32-chars-long-minimum',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
