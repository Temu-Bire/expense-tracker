import { create } from 'zustand';
import { storageService } from '../services/storage';
import { Expense, ExpenseInput } from '../types/expense';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  init: () => Promise<void>;
  addExpense: (expenseData: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, expenseData: ExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  init: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });
    try {
      const storedExpenses = await storageService.getExpenses();
      set({
        expenses: storedExpenses,
        isLoading: false,
        isInitialized: true,
      });
    } catch (e) {
      console.error('[useExpenseStore] Failed to initialize expenses:', e);
      set({
        isLoading: false,
        isInitialized: true,
        error: 'Failed to load stored transactions',
      });
    }
  },

  addExpense: async (expenseData: ExpenseInput): Promise<Expense> => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      date: expenseData.date || new Date().toISOString(),
    };

    const updated = [newExpense, ...get().expenses];
    set({ expenses: updated });

    try {
      await storageService.saveExpenses(updated);
    } catch (e) {
      console.error('[useExpenseStore] Failed to persist new expense:', e);
    }

    return newExpense;
  },

  updateExpense: async (id: string, expenseData: ExpenseInput): Promise<void> => {
    const updated = get().expenses.map((item) =>
      item.id === id
        ? {
            ...expenseData,
            id,
            date: expenseData.date || item.date,
          }
        : item
    );

    set({ expenses: updated });

    try {
      await storageService.saveExpenses(updated);
    } catch (e) {
      console.error('[useExpenseStore] Failed to persist updated expense:', e);
    }
  },

  deleteExpense: async (id: string): Promise<void> => {
    const updated = get().expenses.filter((item) => item.id !== id);
    set({ expenses: updated });

    try {
      await storageService.saveExpenses(updated);
    } catch (e) {
      console.error('[useExpenseStore] Failed to persist deletion:', e);
    }
  },

  clearAll: async (): Promise<void> => {
    set({ expenses: [] });
    try {
      await storageService.clearExpenses();
    } catch (e) {
      console.error('[useExpenseStore] Failed to clear expenses:', e);
    }
  },

  getExpenseById: (id: string): Expense | undefined => {
    return get().expenses.find((item) => item.id === id);
  },
}));
