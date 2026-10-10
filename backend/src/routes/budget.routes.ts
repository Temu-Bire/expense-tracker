import { Router } from 'express';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budget.controller';
import { validateRequest } from '../middleware/validate';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
} from '../validators/budget.validator';

const router = Router();

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
