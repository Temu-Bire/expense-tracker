import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type TransactionType = 'income' | 'expense';

export type CategoryId =
  | 'housing'
  | 'transportation'
  | 'food'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'shopping'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  type: TransactionType;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  date: string; // ISO 8601 string format
  type: TransactionType;
  notes?: string;
}

export type ExpenseInput = Omit<Expense, 'id'>;

export interface ExpenseSummary {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: CategoryId;
  name: string;
  total: number;
  percentage: number;
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  count: number;
}

export type TransactionFilter = 'all' | 'income' | 'expense';
