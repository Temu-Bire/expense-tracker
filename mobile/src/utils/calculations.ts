import { CATEGORIES } from '../constants/categories';
import {
  CategoryBreakdown,
  CategoryId,
  Expense,
  ExpenseSummary,
  GroupedExpenseSection,
  TimePeriod,
  TransactionFilter,
  TransactionType,
} from '../types/expense';

/**
 * Rounds monetary values to two decimal places, avoiding floating point precision drift.
 */
export const roundMoney = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates high-level summary metrics (income, expenses, net balance, transaction count, savings rate).
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

  totalIncome = roundMoney(totalIncome);
  totalExpenses = roundMoney(totalExpenses);
  const netBalance = roundMoney(totalIncome - totalExpenses);

  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round(((netBalance / totalIncome) * 100) * 10) / 10))
      : 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    transactionCount: expenses.length,
    savingsRate,
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
    const roundedCategoryTotal = roundMoney(value.total);
    const percentage =
      totalAmount > 0
        ? Math.round((roundedCategoryTotal / totalAmount) * 1000) / 10
        : 0;

    result.push({
      category: catId,
      name: meta.name,
      total: roundedCategoryTotal,
      percentage,
      color: meta.color,
      icon: meta.icon,
      count: value.count,
    });
  });

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
 * Filters transactions by a time window ('all' | 'month' | 'week').
 */
export const filterByPeriod = (
  expenses: Expense[],
  period: TimePeriod
): Expense[] => {
  if (period === 'all') return expenses;

  const now = new Date();

  if (period === 'month') {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return expenses.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }

  if (period === 'week') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return expenses.filter((item) => new Date(item.date) >= sevenDaysAgo);
  }

  return expenses;
};

/**
 * Filters transactions based on type, optional search keyword, and optional time period.
 */
export const filterExpenses = (
  expenses: Expense[],
  filter: TransactionFilter = 'all',
  searchQuery?: string,
  period: TimePeriod = 'all'
): Expense[] => {
  let list = filterByPeriod(expenses, period);

  if (filter !== 'all') {
    list = list.filter((item) => item.type === filter);
  }

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    list = list.filter((item) => {
      const meta = CATEGORIES[item.category];
      const categoryName = meta ? meta.name.toLowerCase() : '';
      const amountStr = item.amount.toString();

      return (
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        categoryName.includes(query) ||
        amountStr.includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    });
  }

  return sortExpensesByDate(list, false);
};

/**
 * Groups a list of expenses by calendar date for structured SectionList display.
 */
export const groupExpensesByDate = (
  expenses: Expense[]
): GroupedExpenseSection[] => {
  const sorted = sortExpensesByDate(expenses, false);
  const groups: { [key: string]: { label: string; items: Expense[] } } = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const item of sorted) {
    const itemDate = new Date(item.date);
    const itemDateOnly = new Date(itemDate);
    itemDateOnly.setHours(0, 0, 0, 0);

    const key = itemDateOnly.toISOString().split('T')[0];

    if (!groups[key]) {
      let label = itemDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year:
          itemDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });

      if (itemDateOnly.getTime() === today.getTime()) {
        label = 'Today';
      } else if (itemDateOnly.getTime() === yesterday.getTime()) {
        label = 'Yesterday';
      }

      groups[key] = { label, items: [] };
    }

    groups[key].items.push(item);
  }

  return Object.keys(groups).map((key) => {
    const { label, items } = groups[key];
    const subtotal = roundMoney(
      items.reduce((sum, item) => {
        return item.type === 'expense' ? sum - item.amount : sum + item.amount;
      }, 0)
    );

    return {
      title: label,
      subtotal,
      data: items,
    };
  });
};
