import React, { ComponentProps } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useColorScheme } from '../../hooks/useColorScheme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
    };

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = SPACING.xs + 2;
        base.paddingHorizontal = SPACING.md;
        break;
      case 'lg':
        base.paddingVertical = SPACING.lg;
        base.paddingHorizontal = SPACING.xxl;
        break;
      case 'md':
      default:
        base.paddingVertical = SPACING.md;
        base.paddingHorizontal = SPACING.lg;
        break;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base.backgroundColor = theme.surfaceSecondary;
        break;
      case 'danger':
        base.backgroundColor = COLORS.expense;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = theme.border;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'primary':
      default:
        base.backgroundColor = COLORS.primary;
        break;
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return theme.textPrimary;
    }
    if (variant === 'secondary') {
      return theme.textPrimary;
    }
    return '#FFFFFF';
  };

  const textColor = getTextColor();
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={textColor}
              style={{ marginRight: SPACING.sm }}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize:
                  size === 'sm'
                    ? TYPOGRAPHY.fontSize.sm
                    : size === 'lg'
                    ? TYPOGRAPHY.fontSize.lg
                    : TYPOGRAPHY.fontSize.md,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={textColor}
              style={{ marginLeft: SPACING.sm }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
