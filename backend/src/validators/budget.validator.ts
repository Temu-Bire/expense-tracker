import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().trim().max(100).optional(),
  amount: z
    .number({ required_error: 'Budget amount is required' })
    .positive('Budget amount must be greater than 0'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'], {
    required_error: 'Budget period must be WEEKLY, MONTHLY, YEARLY, or CUSTOM',
  }),
  startDate: z
    .string({ required_error: 'Start date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'startDate must be a valid ISO date',
    }),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'endDate must be a valid ISO date',
    })
    .optional(),
  categoryId: z.string().optional().nullable(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const budgetIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Budget ID must be a valid UUID' }),
});
