import { Category, CategoryId, TransactionType } from '../types/expense';
import { COLORS } from './theme';

export const CATEGORIES: Record<CategoryId, Category> = {
  // Expense Categories
  housing: {
    id: 'housing',
    name: 'Housing',
    icon: 'home-outline',
    color: COLORS.categories.housing,
    type: 'expense',
  },
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'restaurant-outline',
    color: COLORS.categories.food,
    type: 'expense',
  },
  transportation: {
    id: 'transportation',
    name: 'Transportation',
    icon: 'car-outline',
    color: COLORS.categories.transportation,
    type: 'expense',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities & Bills',
    icon: 'flash-outline',
    color: COLORS.categories.utilities,
    type: 'expense',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'film-outline',
    color: COLORS.categories.entertainment,
    type: 'expense',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'medkit-outline',
    color: COLORS.categories.healthcare,
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'cart-outline',
    color: COLORS.categories.shopping,
    type: 'expense',
  },

  // Income Categories
  salary: {
    id: 'salary',
    name: 'Salary',
    icon: 'cash-outline',
    color: COLORS.categories.salary,
    type: 'income',
  },
  freelance: {
    id: 'freelance',
    name: 'Freelance',
    icon: 'briefcase-outline',
    color: COLORS.categories.freelance,
    type: 'income',
  },
  investment: {
    id: 'investment',
    name: 'Investment',
    icon: 'trending-up-outline',
    color: COLORS.categories.investment,
    type: 'income',
  },

  // Shared / General
  other: {
    id: 'other',
    name: 'Other',
    icon: 'ellipsis-horizontal-outline',
    color: COLORS.categories.other,
    type: 'expense',
  },
};

export const EXPENSE_CATEGORIES = Object.values(CATEGORIES).filter(
  (c) => c.type === 'expense' || c.id === 'other'
);

export const INCOME_CATEGORIES = Object.values(CATEGORIES).filter(
  (c) => c.type === 'income' || c.id === 'other'
);

export const getCategoriesByType = (type: TransactionType): Category[] => {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

export const getCategoryById = (id: CategoryId): Category => {
  return CATEGORIES[id] || CATEGORIES.other;
};
