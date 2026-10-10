import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must not exceed 100 characters'),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be a positive number')
    .max(1000000000, 'Amount exceeds maximum allowable limit'),
  type: z.enum(['EXPENSE', 'INCOME'], {
    required_error: 'Transaction type is required and must be EXPENSE or INCOME',
  }),
  categoryId: z
    .string({ required_error: 'Category ID is required' })
    .min(1, 'Category ID cannot be empty'),
  date: z
    .string({ required_error: 'Date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Date must be a valid ISO 8601 date string',
    }),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME', 'ALL']).optional(),
  categoryId: z.string().optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'startDate must be a valid ISO date',
    })
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'endDate must be a valid ISO date',
    })
    .optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const transactionIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Transaction ID must be a valid UUID' }),
});
