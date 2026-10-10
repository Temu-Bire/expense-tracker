import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { config } from '../config/env';

export const getHealth = (_req: Request, res: Response): Response => {
  const healthData = {
    status: 'healthy',
    service: 'expense-tracker-api',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: {
      provider: 'postgresql',
      connected: true,
    },
  };

  return sendSuccess(res, healthData, 200);
};
