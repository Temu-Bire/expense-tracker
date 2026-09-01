import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCategoryById } from '../../constants/categories';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useExpenseStore } from '../../store/useExpenseStore';
import { Expense } from '../../types/expense';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryBadge } from './CategoryBadge';

interface TransactionItemProps {
  transaction: Expense;
  onPress?: (transaction: Expense) => void;
  onDelete?: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onDelete,
}) => {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);

  const isIncome = transaction.type === 'income';
  const categoryMeta = getCategoryById(transaction.category);

  const handleLongPress = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(transaction.id);
            } else {
              deleteExpense(transaction.id);
            }
          },
        },
      ]
    );
  };

  const formattedAmount = formatCurrency(transaction.amount, {
    showSign: true,
    type: transaction.type,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(transaction)}
      onLongPress={handleLongPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Category Icon Badge */}
      <CategoryBadge category={transaction.category} size="md" />

      {/* Main Details */}
      <View style={styles.details}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: theme.textPrimary }]}
        >
          {transaction.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {categoryMeta.name} • {formatDate(transaction.date, 'short')}
          {transaction.notes ? ` • ${transaction.notes}` : ''}
        </Text>
      </View>

      {/* Amount */}
      <Text
        style={[
          styles.amount,
          {
            color: isIncome ? COLORS.income : theme.textPrimary,
          },
        ]}
      >
        {formattedAmount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  details: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  amount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
