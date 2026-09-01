import React from 'react';
import { Text, View } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';

export const SummaryCard: React.FC = () => {
  const { netBalance, totalIncome, totalExpenses } = useExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <View className="bg-slate-900 p-6 rounded-2xl shadow-lg mb-6">
      <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
        Total Net Balance
      </Text>
      <Text className={`text-3xl font-bold mb-6 ${netBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
        {formatCurrency(netBalance)}
      </Text>

      <View className="flex-row justify-between pt-4 border-t border-slate-800">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-slate-400 text-xs">Income</Text>
          </View>
          <Text className="text-emerald-400 text-lg font-semibold">
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        <View className="flex-1 ml-2">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-slate-400 text-xs">Expenses</Text>
          </View>
          <Text className="text-red-400 text-lg font-semibold">
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
      </View>
    </View>
  );
};