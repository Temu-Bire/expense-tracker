import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, BadRequestError } from '../errors';
import { Prisma } from '@prisma/client';

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.headers['x-user-id'] as string) || undefined;
    const { type, categoryId, startDate, endDate, search, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const where: Prisma.TransactionWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (type && type !== 'ALL') {
      where.type = type as 'EXPENSE' | 'INCOME';
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    if (search) {
      const searchTerm = String(search).trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              icon: true,
              color: true,
              type: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    sendSuccess(res, transactions, 200, {
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundError(`Transaction with ID '${id}' not found`);
    }

    sendSuccess(res, transaction);
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, amount, type, categoryId, date, notes } = req.body;
    let userId = req.headers['x-user-id'] as string;

    // If no userId header provided, check or use default user
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        const createdUser = await prisma.user.create({
          data: {
            email: 'default@expensetracker.local',
            passwordHash: 'not-for-login',
            firstName: 'Default',
            lastName: 'User',
          },
        });
        userId = createdUser.id;
      }
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestError(`Category with ID '${categoryId}' does not exist`);
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: new Prisma.Decimal(amount),
        type,
        date: new Date(date),
        notes,
        userId,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    sendSuccess(res, transaction, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, amount, type, categoryId, date, notes } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Transaction with ID '${id}' not found`);
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        throw new BadRequestError(`Category with ID '${categoryId}' does not exist`);
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(amount !== undefined ? { amount: new Prisma.Decimal(amount) } : {}),
        ...(type ? { type } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(date ? { date: new Date(date) } : {}),
        ...(notes !== undefined ? { notes } : {}),
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

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Transaction with ID '${id}' not found`);
    }

    await prisma.transaction.delete({ where: { id } });

    sendSuccess(res, { deleted: true, id });
  } catch (error) {
    next(error);
  }
};

export const getTransactionSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.headers['x-user-id'] as string) || undefined;
    const { startDate, endDate } = req.query;

    const where: Prisma.TransactionWhereInput = {};
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        amount: true,
        type: true,
      },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const tx of transactions) {
      const numAmount = Number(tx.amount);
      if (tx.type === 'INCOME') {
        totalIncome += numAmount;
      } else {
        totalExpenses += numAmount;
      }
    }

    const netBalance = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

    const summary = {
      netBalance: Number(netBalance.toFixed(2)),
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      transactionCount: transactions.length,
      savingsRate,
    };

    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};
