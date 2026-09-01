import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoriesByType } from '../../constants/categories';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from '../../hooks/useColorScheme';
import { CategoryId, TransactionType } from '../../types/expense';

interface CategoryPickerProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  type: TransactionType;
  error?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategory,
  onSelectCategory,
  type,
  error,
}) => {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];
  const categories = getCategoriesByType(type);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        Category
      </Text>
      <View style={styles.grid}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(cat.id)}
              style={[
                styles.item,
                {
                  backgroundColor: isSelected
                    ? `${cat.color}25`
                    : theme.surfaceSecondary,
                  borderColor: isSelected ? cat.color : theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isSelected
                      ? cat.color
                      : `${cat.color}20`,
                  },
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={18}
                  color={isSelected ? '#FFFFFF' : cat.color}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.name,
                  {
                    color: isSelected ? cat.color : theme.textPrimary,
                    fontWeight: isSelected
                      ? TYPOGRAPHY.fontWeight.bold
                      : TYPOGRAPHY.fontWeight.medium,
                  },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  errorText: {
    color: COLORS.expense,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
