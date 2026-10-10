import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';

const EXPENSES_STORAGE_KEY = '@expense_tracker:expenses_v1';
const PREFERENCES_STORAGE_KEY = '@expense_tracker:preferences_v1';

export interface UserPreferences {
  hideBalance: boolean;
  currency: string;
}

export const storageService = {
  /**
   * Load all transactions from local storage.
   */
  async getExpenses(): Promise<Expense[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      if (!jsonValue) return [];
      const parsed = JSON.parse(jsonValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('[storageService] Error reading expenses:', e);
      return [];
    }
  },

  /**
   * Save the complete list of transactions to local storage.
   */
  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(expenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('[storageService] Error saving expenses:', e);
      throw e;
    }
  },

  /**
   * Clear all stored expenses.
   */
  async clearExpenses(): Promise<void> {
    try {
      await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);
    } catch (e) {
      console.error('[storageService] Error clearing expenses:', e);
      throw e;
    }
  },

  /**
   * Load stored preferences.
   */
  async getPreferences(): Promise<Partial<UserPreferences>> {
    try {
      const jsonValue = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : {};
    } catch (e) {
      console.error('[storageService] Error reading preferences:', e);
      return {};
    }
  },

  /**
   * Save user preferences.
   */
  async savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...prefs };
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[storageService] Error saving preferences:', e);
    }
  },
};
