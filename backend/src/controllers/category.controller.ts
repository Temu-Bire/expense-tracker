import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ConflictError } from '../errors';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.query;
    const userId = (req.headers['x-user-id'] as string) || undefined;

    const whereClause: Record<string, unknown> = {
      OR: [{ isDefault: true }, ...(userId ? [{ userId }] : [])],
    };

    if (type && (type === 'EXPENSE' || type === 'INCOME')) {
      whereClause.type = type;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!category) {
      throw new NotFoundError(`Category not found with ID or slug: ${id}`);
    }

    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, icon, color, type, slug } = req.body;
    const userId = (req.headers['x-user-id'] as string) || undefined;

    if (slug) {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        throw new ConflictError(`Category with slug '${slug}' already exists`);
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        type,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        isDefault: false,
        userId,
      },
    });

    sendSuccess(res, category, 201);
  } catch (error) {
    next(error);
  }
};
