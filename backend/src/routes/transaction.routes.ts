import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from '../controllers/transaction.controller';
import { validateRequest } from '../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  transactionIdParamSchema,
} from '../validators/transaction.validator';

const router = Router();

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
