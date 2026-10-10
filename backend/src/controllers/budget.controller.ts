import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, UnauthorizedError } from '../errors';
import { Prisma } from '@prisma/client';

export const getBudgets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId || (req.headers['x-user-id'] as string) || undefined;

    const budgets = await prisma.budget.findMany({
      where: userId ? { userId } : {},
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, budgets);
  } catch (error) {
    next(error);
  }
};

export const getBudgetById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId || (req.headers['x-user-id'] as string) || undefined;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new NotFoundError(`Budget with ID '${id}' not found`);
    }

    sendSuccess(res, budget);
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, amount, period, startDate, endDate, categoryId } = req.body;
    let userId = req.user?.userId || (req.headers['x-user-id'] as string);

    if (!userId) {
      throw new UnauthorizedError('Authentication token required');
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        amount: new Prisma.Decimal(amount),
        period,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        categoryId: categoryId || undefined,
        userId,
      },
      include: {
        category: true,
      },
    });

    sendSuccess(res, budget, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId || (req.headers['x-user-id'] as string) || undefined;
    const { name, amount, period, startDate, endDate, categoryId } = req.body;

    const existing = await prisma.budget.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
    });

    if (!existing) {
      throw new NotFoundError(`Budget with ID '${id}' not found`);
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(amount !== undefined ? { amount: new Prisma.Decimal(amount) } : {}),
        ...(period ? { period } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
      },
      include: {
        category: true,
      },
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId || (req.headers['x-user-id'] as string) || undefined;

    const existing = await prisma.budget.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
    });

    if (!existing) {
      throw new NotFoundError(`Budget with ID '${id}' not found`);
    }

    await prisma.budget.delete({ where: { id } });

    sendSuccess(res, { deleted: true, id });
  } catch (error) {
    next(error);
  }
};
