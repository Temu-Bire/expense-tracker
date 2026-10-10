import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from '../controllers/transaction.controller';
import { validateRequest, authenticateToken } from '../middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  transactionIdParamSchema,
} from '../validators/transaction.validator';

const router = Router();

// Protect all transaction endpoints with JWT authentication
router.use(authenticateToken);

router.get('/summary', getTransactionSummary);

router.get(
  '/',
  validateRequest({ query: transactionQuerySchema }),
  getTransactions
);

router.get(
  '/:id',
  validateRequest({ params: transactionIdParamSchema }),
  getTransactionById
);

router.post(
  '/',
  validateRequest({ body: createTransactionSchema }),
  createTransaction
);

router.put(
  '/:id',
  validateRequest({
    params: transactionIdParamSchema,
    body: updateTransactionSchema,
  }),
  updateTransaction
);

router.delete(
  '/:id',
  validateRequest({ params: transactionIdParamSchema }),
  deleteTransaction
);

export default router;
