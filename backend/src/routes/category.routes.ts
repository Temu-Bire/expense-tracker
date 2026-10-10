import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
} from '../controllers/category.controller';
import { validateRequest, authenticateToken, optionalAuth } from '../middleware';
import {
  createCategorySchema,
  categoryIdParamSchema,
} from '../validators/category.validator';

const router = Router();

router.get('/', optionalAuth, getCategories);

router.get(
  '/:id',
  optionalAuth,
  validateRequest({ params: categoryIdParamSchema }),
  getCategoryById
);

router.post(
  '/',
  authenticateToken,
  validateRequest({ body: createCategorySchema }),
  createCategory
);

export default router;
