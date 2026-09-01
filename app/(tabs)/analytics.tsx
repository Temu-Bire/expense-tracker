import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
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
import { TransactionType } from '@/types/expense';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

export default function AnalyticsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const { summary, expenseBreakdown, incomeBreakdown, expenses } =
    useExpenseSummary();

  const currentBreakdown =
    activeType === 'expense' ? expenseBreakdown : incomeBreakdown;
  const currentTotal =
    activeType === 'expense' ? summary.totalExpenses : summary.totalIncome;

  const typeOptions: {
    label: string;
    value: TransactionType;
    activeColor?: string;
  }[] = [
    { label: 'Expenses Breakdown', value: 'expense', activeColor: COLORS.expense },
    { label: 'Income Breakdown', value: 'income', activeColor: COLORS.income },
  ];

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
        />

        {expenses.length === 0 ? (
          <EmptyState
            title="No Data for Analytics"
            message="Add some transactions first to see your spending analytics and category breakdowns."
            icon="pie-chart-outline"
            actionTitle="+ Add Transaction"
            onActionPress={() => router.push('/add-expense')}
          />
        ) : (
          <>
            {/* Financial Health Summary Card */}
            <Card style={styles.summaryOverviewCard}>
              <Text
                style={[styles.overviewTitle, { color: theme.textSecondary }]}
              >
                FINANCIAL RATIO
              </Text>
              <View style={styles.ratioRow}>
                <View style={styles.ratioItem}>
                  <Text
                    style={[styles.ratioValue, { color: COLORS.income }]}
                  >
                    {formatCurrency(summary.totalIncome)}
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
                    {formatCurrency(summary.totalExpenses)}
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
                {formatCurrency(currentTotal)}
              </Text>
            </View>

            {/* Breakdown List */}
            {currentBreakdown.length === 0 ? (
              <EmptyState
                title={`No ${activeType} transactions`}
                message={`There are no ${activeType} transactions recorded yet.`}
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
                        {formatCurrency(item.total)}
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  summaryOverviewCard: {
    marginBottom: SPACING.lg,
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
