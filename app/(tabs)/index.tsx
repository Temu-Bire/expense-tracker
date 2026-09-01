import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import { SummaryCard } from '@/components/expense/SummaryCard';
import { TransactionItem } from '@/components/expense/TransactionItem';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useExpenseStore } from '@/store/useExpenseStore';
import { Expense, TransactionFilter } from '@/types/expense';
import { filterExpenses } from '@/utils/calculations';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  const expenses = useExpenseStore((state) => state.expenses);
  const isLoading = useExpenseStore((state) => state.isLoading);
  const init = useExpenseStore((state) => state.init);

  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredTransactions = useMemo(() => {
    return filterExpenses(expenses, filter, searchQuery);
  }, [expenses, filter, searchQuery]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await init();
    setIsRefreshing(false);
  };

  const handleAddExpense = () => {
    router.push('/add-expense');
  };

  const handleEditExpense = (transaction: Expense) => {
    router.push({
      pathname: '/add-expense',
      params: { id: transaction.id },
    });
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

  const filterOptions: { label: string; value: TransactionFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Income', value: 'income' },
  ];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={handleEditExpense}
          />
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
              subtitle="Track your daily expenses & income"
              rightAction={
                <Button
                  title="Add"
                  icon="add"
                  size="sm"
                  onPress={handleAddExpense}
                />
              }
            />

            {/* Total Balance / Summary Card */}
            <SummaryCard />

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
                placeholder="Search transactions..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.textPrimary }]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              {filterOptions.map((opt) => {
                const isSelected = filter === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => setFilter(opt.value)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected
                          ? COLORS.primary
                          : theme.surfaceSecondary,
                        borderColor: isSelected
                          ? COLORS.primary
                          : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textSecondary,
                          fontWeight: isSelected
                            ? TYPOGRAPHY.fontWeight.bold
                            : TYPOGRAPHY.fontWeight.medium,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.textPrimary }]}
              >
                {filter === 'all'
                  ? 'Recent Transactions'
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
                : filter !== 'all'
                ? `No ${filter} transactions recorded`
                : 'No transactions yet'
            }
            message={
              searchQuery
                ? 'Try a different search query or clear the filter.'
                : 'Start tracking your financial health by adding your first transaction!'
            }
            icon={searchQuery ? 'search-outline' : 'receipt-outline'}
            actionTitle={searchQuery ? 'Clear Search' : '+ Add Transaction'}
            onActionPress={
              searchQuery ? () => setSearchQuery('') : handleAddExpense
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
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
  sectionCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
