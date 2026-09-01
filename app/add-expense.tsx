import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { CategoryPicker } from '@/components/expense/CategoryPicker';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useExpenseStore } from '@/store/useExpenseStore';
import { CategoryId, TransactionType } from '@/types/expense';

export default function AddExpenseModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const getExpenseById = useExpenseStore((state) => state.getExpenseById);

  const isEditing = !!params.id;
  const existingTransaction = params.id ? getExpenseById(params.id) : undefined;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<CategoryId>('food');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});

  useEffect(() => {
    if (existingTransaction) {
      setTitle(existingTransaction.title);
      setAmount(existingTransaction.amount.toString());
      setType(existingTransaction.type);
      setCategory(existingTransaction.category);
      setNotes(existingTransaction.notes || '');
    } else {
      setType('expense');
      setCategory('food');
    }
  }, [existingTransaction]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income' && category === 'food') {
      setCategory('salary');
    } else if (newType === 'expense' && category === 'salary') {
      setCategory('food');
    }
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; amount?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    const parsedAmount = parseFloat(amount);
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const parsedAmount = parseFloat(amount);

      if (isEditing && params.id) {
        await updateExpense(params.id, {
          title: title.trim(),
          amount: parsedAmount,
          type,
          category,
          date: existingTransaction?.date || new Date().toISOString(),
          notes: notes.trim() || undefined,
        });
      } else {
        await addExpense({
          title: title.trim(),
          amount: parsedAmount,
          type,
          category,
          date: new Date().toISOString(),
          notes: notes.trim() || undefined,
        });
      }

      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!params.id) return;

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(params.id as string);
            router.back();
          },
        },
      ]
    );
  };

  const typeOptions: {
    label: string;
    value: TransactionType;
    activeColor?: string;
  }[] = [
    { label: 'Expense', value: 'expense', activeColor: COLORS.expense },
    { label: 'Income', value: 'income', activeColor: COLORS.income },
  ];

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Modal Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              { backgroundColor: theme.surfaceSecondary },
            ]}
          >
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Income / Expense Switcher */}
          <SegmentedControl
            options={typeOptions}
            selectedValue={type}
            onChange={handleTypeChange}
          />

          {/* Amount Input */}
          <Input
            label="Amount ($)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(val) => {
              setAmount(val);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            error={errors.amount}
            icon="cash-outline"
            inputStyle={styles.amountInputText}
          />

          {/* Title Input */}
          <Input
            label="Title"
            placeholder="e.g. Grocery store, Salary, Coffee"
            value={title}
            onChangeText={(val) => {
              setTitle(val);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            icon="create-outline"
          />

          {/* Category Picker */}
          <CategoryPicker
            type={type}
            selectedCategory={category}
            onSelectCategory={setCategory}
          />

          {/* Notes Input */}
          <Input
            label="Notes (Optional)"
            placeholder="Add any extra details or tags..."
            value={notes}
            onChangeText={setNotes}
            icon="document-text-outline"
            multiline
            numberOfLines={2}
            inputStyle={styles.notesInput}
          />

          {/* Action Buttons */}
          <Button
            title={isEditing ? 'Save Changes' : 'Add Transaction'}
            onPress={handleSubmit}
            loading={isSubmitting}
            icon={isEditing ? 'checkmark' : 'add'}
            size="lg"
            style={styles.submitButton}
          />

          {isEditing && (
            <Button
              title="Delete Transaction"
              variant="danger"
              onPress={handleDelete}
              icon="trash-outline"
              size="md"
              style={styles.deleteButton}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  amountInputText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  notesInput: {
    minHeight: 48,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  deleteButton: {
    marginBottom: SPACING.lg,
  },
});
