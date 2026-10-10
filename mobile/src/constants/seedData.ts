import { Expense } from '../types/expense';

/**
 * Realistic starter transactions to demonstrate analytics, category breakdown, and grouping.
 */
export const SAMPLE_TRANSACTIONS: Omit<Expense, 'id'>[] = [
  {
    title: 'Monthly Salary',
    amount: 3850,
    type: 'income',
    category: 'salary',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    notes: 'Direct deposit',
  },
  {
    title: 'Whole Foods Groceries',
    amount: 142.5,
    type: 'expense',
    category: 'food',
    date: new Date().toISOString(), // Today
    notes: 'Weekly fresh produce & essentials',
  },
  {
    title: 'Apartment Rent',
    amount: 1200,
    type: 'expense',
    category: 'housing',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    notes: 'October rent',
  },
  {
    title: 'Freelance Design Sprint',
    amount: 650,
    type: 'income',
    category: 'freelance',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    notes: 'Landing page redesign client milestone',
  },
  {
    title: 'Electric & Internet Utility',
    amount: 115.3,
    type: 'expense',
    category: 'utilities',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    notes: 'Fiber internet & electricity',
  },
  {
    title: 'Uber rides',
    amount: 34.2,
    type: 'expense',
    category: 'transportation',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
    notes: 'Airport commute',
  },
  {
    title: 'Cinema & Dinner',
    amount: 68.0,
    type: 'expense',
    category: 'entertainment',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
    notes: 'Weekend movie with friends',
  },
  {
    title: 'Pharmacy Vitamins',
    amount: 29.99,
    type: 'expense',
    category: 'healthcare',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    notes: 'Daily vitamins & health supplements',
  },
  {
    title: 'New Running Shoes',
    amount: 110.0,
    type: 'expense',
    category: 'shopping',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
    notes: 'Nike athletic shoes sale',
  },
  {
    title: 'Dividend Payout',
    amount: 88.5,
    type: 'income',
    category: 'investment',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    notes: 'Quarterly index fund dividend',
  },
];
