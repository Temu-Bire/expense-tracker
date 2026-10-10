import React from 'react';
import {
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useColorScheme } from '../../hooks/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = true,
  onPress,
  activeOpacity = 0.7,
}) => {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme];

  const cardStyle: ViewStyle = {
    backgroundColor: theme.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: colorScheme === 'light' ? 1 : 1,
    borderColor: theme.border,
    ...(elevated && colorScheme === 'light' ? SHADOWS.sm : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
