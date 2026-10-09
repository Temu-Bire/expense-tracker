import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useExpenseSummary } from '@/hooks/useExpenseSummary';
import { useExpenseStore } from '@/store/useExpenseStore';
import { TimePeriod, TransactionType } from '@/types/expense';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { haptic } from '@/utils/haptics';

export default function AnalyticsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  const isLoading = useExpenseStore((state) => state.isLoading);
  const error = useExpenseStore((state) => state.error);
  const init = useExpenseStore((state) => state.init);
  const clearAll = useExpenseStore((state) => state.clearAll);
  const loadSampleData = useExpenseStore((state) => state.loadSampleData);
  const hideBalance = useExpenseStore((state) => state.hideBalance);
  const storePeriod = useExpenseStore((state) => state.selectedPeriod);
  const setSelectedPeriod = useExpenseStore((state) => state.setSelectedPeriod);

  const [activeType, setActiveType] = useState<TransactionType>('expense');

  const { summary, expenseBreakdown, incomeBreakdown, expenses, allExpenses } =
    useExpenseSummary(storePeriod);

  const currentBreakdown =
    activeType === 'expense' ? expenseBreakdown : incomeBreakdown;
  const currentTotal =
    activeType === 'expense' ? summary.totalExpenses : summary.totalIncome;

  const topCategory = currentBreakdown.length > 0 ? currentBreakdown[0] : null;
  const averagePerTransaction =
    summary.transactionCount > 0
      ? currentTotal / Math.max(1, currentBreakdown.reduce((acc, c) => acc + c.count, 0))
      : 0;

  const typeOptions: {
    label: string;
    value: TransactionType;
    activeColor?: string;
  }[] = [
    { label: 'Expenses Breakdown', value: 'expense', activeColor: COLORS.expense },
    { label: 'Income Breakdown', value: 'income', activeColor: COLORS.income },
  ];

  const periodOptions: { label: string; value: TimePeriod }[] = [
    { label: 'All Time', value: 'all' },
    { label: 'This Month', value: 'month' },
    { label: 'Past 7 Days', value: 'week' },
  ];

  const handleClearAll = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to permanently clear all transactions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await haptic.heavy();
            await clearAll();
          },
        },
      ]
    );
  };

  const handleLoadDemo = async () => {
    await haptic.success();
    await loadSampleData();
  };

  if (isLoading && allExpenses.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Analytics"
          subtitle="Visualize and understand your spending patterns"
          rightAction={
            allExpenses.length > 0 ? (
              <TouchableOpacity
                onPress={handleClearAll}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[
                  styles.resetButton,
                  { backgroundColor: theme.surfaceSecondary },
                ]}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.expense} />
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* Error Banner */}
        {error && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: COLORS.expense,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={COLORS.expense}
              style={{ marginRight: SPACING.xs + 2 }}
            />
            <Text
              style={[styles.errorBannerText, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => init()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.errorBannerRetry, { color: COLORS.primary }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Time Period Filter */}
        <SegmentedControl
          options={periodOptions}
          selectedValue={storePeriod}
          onChange={setSelectedPeriod}
          style={styles.periodSegment}
        />

        {expenses.length === 0 ? (
          <EmptyState
            title={
              allExpenses.length === 0
                ? 'No Data for Analytics'
                : 'No Transactions in Period'
            }
            message={
              allExpenses.length === 0
                ? 'Add your first transaction or load sample data to explore spending analytics.'
                : 'No transactions found in this time period. Try switching to "All Time".'
            }
            icon="pie-chart-outline"
            actionTitle={
              allExpenses.length === 0 ? '+ Add Transaction' : 'Show All Time'
            }
            onActionPress={() => {
              haptic.medium();
              if (allExpenses.length === 0) {
                router.push('/add-expense');
              } else {
                setSelectedPeriod('all');
              }
            }}
            secondaryActionTitle={
              allExpenses.length === 0
                ? 'Load Demo Data'
                : '+ Add Transaction'
            }
            onSecondaryActionPress={
              allExpenses.length === 0
                ? handleLoadDemo
                : () => router.push('/add-expense')
            }
          />
        ) : (
          <>
            {/* Financial Ratio / Health Overview Card */}
            <Card style={styles.summaryOverviewCard}>
              <Text
                style={[styles.overviewTitle, { color: theme.textSecondary }]}
              >
                FINANCIAL RATIO & FLOW
              </Text>
              <View style={styles.ratioRow}>
                <View style={styles.ratioItem}>
                  <Text
                    style={[styles.ratioValue, { color: COLORS.income }]}
                  >
                    {formatCurrency(summary.totalIncome, { masked: hideBalance })}
                  </Text>
                  <Text
                    style={[styles.ratioLabel, { color: theme.textSecondary }]}
                  >
                    Total Inflow
                  </Text>
                </View>
                <View
                  style={[styles.ratioDivider, { backgroundColor: theme.border }]}
                />
                <View style={styles.ratioItem}>
                  <Text
                    style={[styles.ratioValue, { color: COLORS.expense }]}
                  >
                    {formatCurrency(summary.totalExpenses, { masked: hideBalance })}
                  </Text>
                  <Text
                    style={[styles.ratioLabel, { color: theme.textSecondary }]}
                  >
                    Total Outflow
                  </Text>
                </View>
              </View>

              {/* Progress Bar of Expense vs Income */}
              {summary.totalIncome > 0 && (
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barTrack,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor:
                            summary.totalExpenses <= summary.totalIncome
                              ? COLORS.income
                              : COLORS.expense,
                          width: `${Math.min(
                            100,
                            (summary.totalExpenses / summary.totalIncome) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.barCaption, { color: theme.textSecondary }]}
                  >
                    {summary.totalIncome > 0
                      ? `${formatPercentage(
                          summary.totalExpenses,
                          summary.totalIncome
                        )} of income spent`
                      : '0% spent'}
                  </Text>
                </View>
              )}
            </Card>

            {/* Quick Insights Cards Row */}
            {topCategory && (
              <View style={styles.insightsRow}>
                <View
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>
                    Top Category
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.insightValue, { color: topCategory.color }]}
                  >
                    {topCategory.name}
                  </Text>
                  <Text style={[styles.insightSub, { color: theme.textSecondary }]}>
                    {topCategory.percentage.toFixed(0)}% of total
                  </Text>
                </View>

                <View
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>
                    Average Entry
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.insightValue, { color: theme.textPrimary }]}
                  >
                    {formatCurrency(averagePerTransaction, { masked: hideBalance })}
                  </Text>
                  <Text style={[styles.insightSub, { color: theme.textSecondary }]}>
                    per transaction
                  </Text>
                </View>
              </View>
            )}

            {/* Segmented Control for Breakdown Type */}
            <SegmentedControl
              options={typeOptions}
              selectedValue={activeType}
              onChange={setActiveType}
            />

            {/* Category Breakdown Header */}
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.textPrimary }]}
              >
                {activeType === 'expense'
                  ? 'Expenses by Category'
                  : 'Income Sources'}
              </Text>
              <Text
                style={[
                  styles.sectionTotal,
                  {
                    color:
                      activeType === 'expense'
                        ? COLORS.expense
                        : COLORS.income,
                  },
                ]}
              >
                {formatCurrency(currentTotal, { masked: hideBalance })}
              </Text>
            </View>

            {/* Breakdown List */}
            {currentBreakdown.length === 0 ? (
              <EmptyState
                title={`No ${activeType} transactions`}
                message={`There are no ${activeType} transactions recorded in this period.`}
                icon="receipt-outline"
              />
            ) : (
              currentBreakdown.map((item) => (
                <Card key={item.category} style={styles.categoryCard}>
                  {/* Category Row Top */}
                  <View style={styles.catHeaderRow}>
                    <View style={styles.catLeft}>
                      <View
                        style={[
                          styles.catIconCircle,
                          { backgroundColor: `${item.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={item.color}
                        />
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.catName,
                            { color: theme.textPrimary },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={[
                            styles.catCount,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {item.count} {item.count === 1 ? 'entry' : 'entries'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.catRight}>
                      <Text
                        style={[
                          styles.catAmount,
                          { color: theme.textPrimary },
                        ]}
                      >
                        {formatCurrency(item.total, { masked: hideBalance })}
                      </Text>
                      <Text
                        style={[
                          styles.catPercentage,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar for Category Share */}
                  <View
                    style={[
                      styles.categoryBarTrack,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          backgroundColor: item.color,
                          width: `${Math.max(2, item.percentage)}%`,
                        },
                      ]}
                    />
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  errorBannerRetry: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  periodSegment: {
    marginBottom: SPACING.md,
  },
  resetButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  summaryOverviewCard: {
    marginBottom: SPACING.md,
  },
  overviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  ratioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  ratioItem: {
    flex: 1,
    alignItems: 'center',
  },
  ratioDivider: {
    width: 1,
    height: 40,
  },
  ratioValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 2,
  },
  ratioLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  barContainer: {
    marginTop: SPACING.xs,
  },
  barTrack: {
    height: 8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  barCaption: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
  insightsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  insightCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  insightLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 2,
  },
  insightSub: {
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  sectionTotal: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  categoryCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  catHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  catName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  catCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: 2,
  },
  catRight: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  catPercentage: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: 2,
  },
  categoryBarTrack: {
    height: 6,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});
