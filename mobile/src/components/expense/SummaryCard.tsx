import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useExpenseSummary } from '../../hooks/useExpenseSummary';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

export const SummaryCard: React.FC = () => {
  const colorScheme = useColorScheme();

  const hideBalance = useExpenseStore((state) => state.hideBalance);
  const toggleHideBalance = useExpenseStore((state) => state.toggleHideBalance);

  const { summary } = useExpenseSummary();
  const { netBalance, totalIncome, totalExpenses, transactionCount, savingsRate } = summary;

  const handleTogglePrivacy = async () => {
    await haptic.light();
    await toggleHideBalance();
  };

  const isLight = colorScheme === 'light';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isLight ? '#1E293B' : '#0F172A',
          borderColor: isLight ? '#334155' : '#1E293B',
        },
      ]}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>TOTAL BALANCE</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleTogglePrivacy}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={hideBalance ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerBadges}>
          {savingsRate > 0 && !hideBalance && (
            <View style={styles.savingsBadge}>
              <Ionicons name="trending-up" size={12} color="#10B981" />
              <Text style={styles.savingsText}>
                {savingsRate.toFixed(0)}% saved
              </Text>
            </View>
          )}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {transactionCount} {transactionCount === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Balance Display */}
      <View style={styles.balanceRow}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.balanceAmount,
            { color: netBalance >= 0 ? '#FFFFFF' : '#FCA5A5' },
          ]}
        >
          {formatCurrency(netBalance, { masked: hideBalance })}
        </Text>
        {netBalance >= 0 ? (
          <View style={[styles.trendPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Text style={[styles.trendPillText, { color: '#34D399' }]}>Surplus</Text>
          </View>
        ) : (
          <View style={[styles.trendPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Text style={[styles.trendPillText, { color: '#F87171' }]}>Deficit</Text>
          </View>
        )}
      </View>

      {/* Income & Expense Split */}
      <View style={styles.statsRow}>
        {/* Income Stat */}
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.iconDot, { backgroundColor: COLORS.income }]}>
              <Ionicons name="arrow-down" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Total Income</Text>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.statValue, { color: '#6EE7B7' }]}
          >
            {formatCurrency(totalIncome, { masked: hideBalance })}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Expense Stat */}
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.iconDot, { backgroundColor: COLORS.expense }]}>
              <Ionicons name="arrow-up" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Total Expenses</Text>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.statValue, { color: '#FCA5A5' }]}
          >
            {formatCurrency(totalExpenses, { masked: hideBalance })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 1,
  },
  eyeButton: {
    marginLeft: SPACING.xs + 2,
    padding: 2,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  savingsText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  countText: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: -0.5,
  },
  trendPill: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  trendPillText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBox: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
