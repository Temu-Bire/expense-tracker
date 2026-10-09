import { useMemo } from 'react';
import { useExpenseStore } from '../store/useExpenseStore';
import { TimePeriod } from '../types/expense';
import {
  calculateCategoryBreakdown,
  calculateSummary,
  filterByPeriod,
  groupExpensesByDate,
  sortExpensesByDate,
} from '../utils/calculations';

export function useExpenseSummary(customPeriod?: TimePeriod) {
  const allExpenses = useExpenseStore((state) => state.expenses);
  const isLoading = useExpenseStore((state) => state.isLoading);
  const storePeriod = useExpenseStore((state) => state.selectedPeriod);

  const activePeriod = customPeriod ?? storePeriod;

  const expenses = useMemo(
    () => filterByPeriod(allExpenses, activePeriod),
    [allExpenses, activePeriod]
  );

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

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(expenses),
    [expenses]
  );

  return {
    allExpenses,
    expenses,
    isLoading,
    summary,
    expenseBreakdown,
    incomeBreakdown,
    recentExpenses,
    groupedExpenses,
    activePeriod,
  };
}
