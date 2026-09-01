import { CATEGORIES } from '../constants/categories';
import {
  CategoryBreakdown,
  CategoryId,
  Expense,
  ExpenseSummary,
  TransactionFilter,
  TransactionType,
} from '../types/expense';

/**
 * Calculates high-level summary metrics (income, expenses, net balance, count).
 */
export const calculateSummary = (expenses: Expense[]): ExpenseSummary => {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const item of expenses) {
    if (item.type === 'income') {
      totalIncome += item.amount;
    } else {
      totalExpenses += item.amount;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionCount: expenses.length,
  };
};

/**
 * Groups expenses by category and returns sorted breakdown statistics.
 */
export const calculateCategoryBreakdown = (
  expenses: Expense[],
  type: TransactionType = 'expense'
): CategoryBreakdown[] => {
  const filtered = expenses.filter((item) => item.type === type);
  const totalAmount = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const map = new Map<CategoryId, { total: number; count: number }>();

  for (const item of filtered) {
    const existing = map.get(item.category) || { total: 0, count: 0 };
    map.set(item.category, {
      total: existing.total + item.amount,
      count: existing.count + 1,
    });
  }

  const result: CategoryBreakdown[] = [];

  map.forEach((value, catId) => {
    const meta = CATEGORIES[catId] || CATEGORIES.other;
    const percentage = totalAmount > 0 ? (value.total / totalAmount) * 100 : 0;

    result.push({
      category: catId,
      name: meta.name,
      total: value.total,
      percentage,
      color: meta.color,
      icon: meta.icon,
      count: value.count,
    });
  });

  // Sort by highest spending first
  return result.sort((a, b) => b.total - a.total);
};

/**
 * Sorts expenses in chronological order (default: newest first).
 */
export const sortExpensesByDate = (
  expenses: Expense[],
  ascending: boolean = false
): Expense[] => {
  return [...expenses].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
};

/**
 * Filters transactions based on type and optional search keyword.
 */
export const filterExpenses = (
  expenses: Expense[],
  filter: TransactionFilter = 'all',
  searchQuery?: string
): Expense[] => {
  let list = expenses;

  if (filter !== 'all') {
    list = list.filter((item) => item.type === filter);
  }

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query))
    );
  }

  return sortExpensesByDate(list, false);
};
