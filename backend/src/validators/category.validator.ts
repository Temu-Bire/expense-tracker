import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .trim()
    .min(1, 'Category name cannot be empty')
    .max(50, 'Category name must not exceed 50 characters'),
  icon: z
    .string({ required_error: 'Icon identifier is required' })
    .trim()
    .min(1, 'Icon identifier cannot be empty'),
  color: z
    .string({ required_error: 'Hex color code is required' })
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex color code (e.g., #FF5722)'),
  type: z.enum(['EXPENSE', 'INCOME'], {
    required_error: 'Category type must be EXPENSE or INCOME',
  }),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]+$/, 'Slug must be URL-safe').optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
});
