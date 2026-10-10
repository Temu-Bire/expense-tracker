import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
} from '../controllers/category.controller';
import { validateRequest } from '../middleware/validate';
import {
  createCategorySchema,
  categoryIdParamSchema,
} from '../validators/category.validator';

const router = Router();

router.get('/', getCategories);

router.get(
  '/:id',
  validateRequest({ params: categoryIdParamSchema }),
  getCategoryById
);

router.post(
  '/',
  validateRequest({ body: createCategorySchema }),
  createCategory
);

export default router;
