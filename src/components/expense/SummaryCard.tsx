import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useExpenseSummary } from '../../hooks/useExpenseSummary';
import { formatCurrency } from '../../utils/formatters';

export const SummaryCard: React.FC = () => {
  const { summary } = useExpenseSummary();
  const { netBalance, totalIncome, totalExpenses, transactionCount } = summary;

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <Text style={styles.label}>TOTAL BALANCE</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {transactionCount} {transactionCount === 1 ? 'tx' : 'txs'}
          </Text>
        </View>
      </View>

      {/* Main Balance Display */}
      <Text
        style={[
          styles.balanceAmount,
          { color: netBalance >= 0 ? '#FFFFFF' : '#FCA5A5' },
        ]}
      >
        {formatCurrency(netBalance)}
      </Text>

      {/* Income & Expense Split */}
      <View style={styles.statsRow}>
        {/* Income Stat */}
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.iconDot, { backgroundColor: COLORS.income }]}>
              <Ionicons name="arrow-down" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <Text style={[styles.statValue, { color: '#6EE7B7' }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Expense Stat */}
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.iconDot, { backgroundColor: COLORS.expense }]}>
              <Ionicons name="arrow-up" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <Text style={[styles.statValue, { color: '#FCA5A5' }]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  countText: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xl,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  statBox: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#1E293B',
    marginHorizontal: SPACING.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconDot: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
