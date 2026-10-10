import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryById } from '../../constants/categories';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { CategoryId } from '../../types/expense';

interface CategoryBadgeProps {
  category: CategoryId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showLabel = false,
  style,
}) => {
  const meta = getCategoryById(category);

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { containerSize: 28, iconSize: 14 };
      case 'lg':
        return { containerSize: 48, iconSize: 24 };
      case 'md':
      default:
        return { containerSize: 38, iconSize: 18 };
    }
  };

  const { containerSize, iconSize } = getDimensions();

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            backgroundColor: `${meta.color}20`,
          },
        ]}
      >
        <Ionicons name={meta.icon} size={iconSize} color={meta.color} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: meta.color }]}>{meta.name}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
