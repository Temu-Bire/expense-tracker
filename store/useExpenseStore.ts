import { create } from 'zustand';
import { storageService } from '../services/storage';
import { Expense } from '../types/expense';

interface ExpenseStore {
  expenses: Expense[];
  isLoading: boolean;
  
  // Actions
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Selectors/Getters
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetBalance: () => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  isLoading: false,

  fetchExpenses: async () => {
    set({ isLoading: true });
    const expenses = await storageService.getExpenses();
    set({ expenses, isLoading: false });
  },

  addExpense: async (expenseData) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    const updated = [newExpense, ...get().expenses];
    set({ expenses: updated });
    await storageService.saveExpenses(updated);
  },

  updateExpense: async (id, updatedData) => {
    const updated = get().expenses.map((item) =>
      item.id === id ? { ...updatedData, id } : item
    );
    set({ expenses: updated });
    await storageService.saveExpenses(updated);
  },

  deleteExpense: async (id) => {
    const updated = get().expenses.filter((item) => item.id !== id);
    set({ expenses: updated });
    await storageService.saveExpenses(updated);
  },

  getTotalIncome: () => {
    return get().expenses
      .filter((e) => e.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  },

  getTotalExpenses: () => {
    return get().expenses
      .filter((e) => e.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  },

  getNetBalance: () => {
    return get().getTotalIncome() - get().getTotalExpenses();
  },
}));