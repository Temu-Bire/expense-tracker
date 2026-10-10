import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import transactionRoutes from './routes/transaction.routes';
import budgetRoutes from './routes/budget.routes';
import { errorHandler, notFoundHandler } from './middleware';

export const createApp = (): Application => {
  const app = express();

  // Security and common middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
      credentials: true,
    })
  );

  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root health endpoint (for load balancers & quick checks)
  app.use('/health', healthRoutes);

  // API sub-routes mounted under configured prefix (default /api)
  const apiPrefix = config.apiPrefix;
  app.use(`${apiPrefix}/health`, healthRoutes);
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/categories`, categoryRoutes);
  app.use(`${apiPrefix}/transactions`, transactionRoutes);
  app.use(`${apiPrefix}/budgets`, budgetRoutes);

  // Catch-all 404 handler
  app.use(notFoundHandler);

  // Global standardized error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
