import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';

const EXPENSES_STORAGE_KEY = '@expense_tracker:expenses';

export const storageService = {
  /**
   * Load all transactions from local storage.
   */
  async getExpenses(): Promise<Expense[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error fetching expenses from storage', e);
      return [];
    }
  },

  /**
   * Save the full list of expenses to local storage.
   */
  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(expenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving expenses to storage', e);
    }
  },

  /**
   * Clear all stored expenses.
   */
  async clearExpenses(): Promise<void> {
    try {
      await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing expenses from storage', e);
    }
  },
};