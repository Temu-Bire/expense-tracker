import { useMemo } from 'react';
import { useExpenseStore } from '../store/useExpenseStore';
import { calculateCategoryBreakdown, calculateSummary, sortExpensesByDate } from '../utils/calculations';

export function useExpenseSummary() {
  const expenses = useExpenseStore((state) => state.expenses);
  const isLoading = useExpenseStore((state) => state.isLoading);

  const summary = useMemo(() => calculateSummary(expenses), [expenses]);

  const expenseBreakdown = useMemo(
    () => calculateCategoryBreakdown(expenses, 'expense'),
    [expenses]
  );

  const incomeBreakdown = useMemo(
    () => calculateCategoryBreakdown(expenses, 'income'),
    [expenses]
  );

  const recentExpenses = useMemo(
    () => sortExpensesByDate(expenses).slice(0, 10),
    [expenses]
  );

  return {
    expenses,
    isLoading,
    summary,
    expenseBreakdown,
    incomeBreakdown,
    recentExpenses,
  };
}
