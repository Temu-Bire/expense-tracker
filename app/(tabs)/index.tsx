import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { SummaryCard } from '@/components/expense/SummaryCard';
import { TransactionItem } from '@/components/expense/TransactionItem';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useExpenseStore } from '@/store/useExpenseStore';
import { Expense, TimePeriod, TransactionFilter } from '@/types/expense';
import { filterExpenses, groupExpensesByDate } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { haptic } from '@/utils/haptics';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  const expenses = useExpenseStore((state) => state.expenses);
  const isLoading = useExpenseStore((state) => state.isLoading);
  const error = useExpenseStore((state) => state.error);
  const init = useExpenseStore((state) => state.init);
  const loadSampleData = useExpenseStore((state) => state.loadSampleData);
  const selectedPeriod = useExpenseStore((state) => state.selectedPeriod);
  const setSelectedPeriod = useExpenseStore((state) => state.setSelectedPeriod);

  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredTransactions = useMemo(() => {
    return filterExpenses(expenses, filter, searchQuery, selectedPeriod);
  }, [expenses, filter, searchQuery, selectedPeriod]);

  const groupedSections = useMemo(() => {
    return groupExpensesByDate(filteredTransactions);
  }, [filteredTransactions]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await haptic.light();
    await init();
    setIsRefreshing(false);
  };

  const handleAddExpense = () => {
    haptic.medium();
    router.push('/add-expense');
  };

  const handleEditExpense = (transaction: Expense) => {
    router.push({
      pathname: '/add-expense',
      params: { id: transaction.id },
    });
  };

  const handleLoadDemo = async () => {
    await haptic.success();
    await loadSampleData();
  };

  if (isLoading && expenses.length === 0) {
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

  const typeFilterOptions: { label: string; value: TransactionFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Income', value: 'income' },
  ];

  const periodOptions: { label: string; value: TimePeriod }[] = [
    { label: 'All Time', value: 'all' },
    { label: 'This Month', value: 'month' },
    { label: 'Past 7 Days', value: 'week' },
  ];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={handleEditExpense}
          />
        )}
        renderSectionHeader={({ section: { title, subtotal } }) => (
          <View
            style={[
              styles.dateHeaderContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <Text
              style={[styles.dateHeaderTitle, { color: theme.textSecondary }]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.dateHeaderSubtotal,
                { color: subtotal >= 0 ? COLORS.income : theme.textSecondary },
              ]}
            >
              {subtotal !== 0 && formatCurrency(subtotal, { showSign: true })}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Screen Header */}
            <Header
              title="Overview"
              subtitle="Track your daily financial activities"
              rightAction={
                <Button
                  title="Add"
                  icon="add"
                  size="sm"
                  onPress={handleAddExpense}
                />
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
                  onPress={onRefresh}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.errorBannerRetry, { color: COLORS.primary }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Total Balance / Summary Card */}
            <SummaryCard />

            {/* Time Period Filter */}
            <SegmentedControl
              options={periodOptions}
              selectedValue={selectedPeriod}
              onChange={setSelectedPeriod}
              style={styles.periodSegment}
            />

            {/* Search Input */}
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={theme.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search by title, category, note..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.textPrimary }]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    haptic.light();
                    setSearchQuery('');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Type Filter Chips (All / Expenses / Income) */}
            <SegmentedControl
              options={typeFilterOptions}
              selectedValue={filter}
              onChange={setFilter}
              style={styles.typeSegment}
            />

            {/* Section Heading */}
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.textPrimary }]}
              >
                {filter === 'all'
                  ? 'Transactions'
                  : filter === 'expense'
                  ? 'Expenses'
                  : 'Income'}
              </Text>
              <Text style={[styles.sectionCount, { color: theme.textSecondary }]}>
                {filteredTransactions.length}{' '}
                {filteredTransactions.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={
              searchQuery
                ? 'No matching transactions'
                : expenses.length === 0
                ? 'Welcome to Expense Tracker!'
                : `No ${filter} transactions in this period`
            }
            message={
              searchQuery
                ? 'Try a different search query or clear your keyword.'
                : expenses.length === 0
                ? 'Get started by creating your first transaction, or load demo data to explore features.'
                : 'Try changing the time period or reset filters above.'
            }
            icon={searchQuery ? 'search-outline' : 'wallet-outline'}
            actionTitle={
              searchQuery
                ? 'Clear Search'
                : expenses.length === 0
                ? '+ Add Transaction'
                : 'Reset All Filters'
            }
            onActionPress={
              searchQuery
                ? () => setSearchQuery('')
                : expenses.length === 0
                ? handleAddExpense
                : () => {
                    setFilter('all');
                    setSelectedPeriod('all');
                  }
            }
            secondaryActionTitle={
              expenses.length === 0
                ? 'Load Demo Data'
                : '+ Add Transaction'
            }
            onSecondaryActionPress={
              expenses.length === 0 ? handleLoadDemo : handleAddExpense
            }
          />
        }
      />
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
  typeSegment: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  sectionCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dateHeaderTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateHeaderSubtotal: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
