import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { storageService } from '../services/storage';
import { Expense } from '../types/expense';

interface ExpenseContextType {
  expenses: Expense[];
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updated: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load expenses on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedExpenses = await storageService.getExpenses();
        setExpenses(storedExpenses);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Compute calculated metrics
  const totalIncome = useMemo(() => {
    return expenses
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const netBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Handler functions
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(), // Simple unique ID strategy
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    await storageService.saveExpenses(updated);
  };

  const updateExpense = async (id: string, updatedData: Omit<Expense, 'id'>) => {
    const updated = expenses.map((item) =>
      item.id === id ? { ...updatedData, id } : item
    );
    setExpenses(updated);
    await storageService.saveExpenses(updated);
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter((item) => item.id !== id);
    setExpenses(updated);
    await storageService.saveExpenses(updated);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        netBalance,
        totalIncome,
        totalExpenses,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};