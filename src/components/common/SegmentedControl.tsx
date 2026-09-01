import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from '../../hooks/useColorScheme';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T; activeColor?: string }[];
  selectedValue: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surfaceSecondary },
        style,
      ]}
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        const activeBg = option.activeColor || COLORS.primary;

        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.8}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              isSelected && {
                backgroundColor: activeBg,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? '#FFFFFF' : theme.textSecondary,
                  fontWeight: isSelected
                    ? TYPOGRAPHY.fontWeight.bold
                    : TYPOGRAPHY.fontWeight.medium,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.xs,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});
