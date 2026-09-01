import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useExpenses } from '../context/ExpenseContext';
import { Expense } from '../types/expense';

interface TransactionItemProps {
  transaction: Expense;
  onEdit?: (transaction: Expense) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit }) => {
  const { deleteExpense } = useExpenses();
  const isIncome = transaction.type === 'income';
  const categoryColor = COLORS.categories[transaction.category] || COLORS.categories.other;

  const handleLongPress = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(transaction.id),
        },
      ]
    );
  };

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const formattedAmount = `${isIncome ? '+' : '-'}$${transaction.amount.toFixed(2)}`;

  return (
    <TouchableOpacity
      onPress={() => onEdit?.(transaction)}
      onLongPress={handleLongPress}
      className="flex-row items-center justify-between p-4 mb-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <View
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900 dark:text-slate-100" numberOfLines={1}>
            {transaction.title}
          </Text>
          <Text className="text-xs text-slate-500 capitalize">
            {transaction.category} • {formattedDate}
          </Text>
        </View>
      </View>

      <Text
        className={`text-base font-bold ${
          isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {formattedAmount}
      </Text>
    </TouchableOpacity>
  );
};