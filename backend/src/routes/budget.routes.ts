import { Router } from 'express';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budget.controller';
import { validateRequest, authenticateToken } from '../middleware';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
} from '../validators/budget.validator';

const router = Router();

// Protect all budget endpoints with JWT authentication
router.use(authenticateToken);

router.get('/', getBudgets);

router.get(
  '/:id',
  validateRequest({ params: budgetIdParamSchema }),
  getBudgetById
);

router.post(
  '/',
  validateRequest({ body: createBudgetSchema }),
  createBudget
);

router.put(
  '/:id',
  validateRequest({
    params: budgetIdParamSchema,
    body: updateBudgetSchema,
  }),
  updateBudget
);

router.delete(
  '/:id',
  validateRequest({ params: budgetIdParamSchema }),
  deleteBudget
);

export default router;
