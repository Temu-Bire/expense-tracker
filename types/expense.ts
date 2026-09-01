export type TransactionType = 'income' | 'expense';

export type CategoryId = 
  | 'housing'
  | 'transportation'
  | 'food'
  | 'utilities'
  | 'entertainment'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // Icon identifier (e.g., Lucide or Material icon name)
  color: string; // Hex or theme token reference
  type: TransactionType;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  date: string; // ISO 8601 string format (e.g., '2026-09-01T17:58:12Z')
  type: TransactionType;
  notes?: string;
}