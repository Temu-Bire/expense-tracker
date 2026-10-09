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
import { haptic } from '../../utils/haptics';
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
  const hideBalance = useExpenseStore((state) => state.hideBalance);

  const isIncome = transaction.type === 'income';
  const categoryMeta = getCategoryById(transaction.category);

  const handlePress = () => {
    haptic.selection();
    onPress?.(transaction);
  };

  const handleLongPress = async () => {
    await haptic.warning();
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await haptic.heavy();
            if (onDelete) {
              onDelete(transaction.id);
            } else {
              await deleteExpense(transaction.id);
            }
          },
        },
      ]
    );
  };

  const formattedAmount = formatCurrency(transaction.amount, {
    showSign: true,
    type: transaction.type,
    masked: hideBalance,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
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
        <Text
          numberOfLines={1}
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {categoryMeta.name} • {formatDate(transaction.date, 'time')}
          {transaction.notes ? ` • ${transaction.notes}` : ''}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.amount,
            {
              color: isIncome ? COLORS.income : theme.textPrimary,
            },
          ]}
        >
          {formattedAmount}
        </Text>
      </View>
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
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
