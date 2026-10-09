import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Cross-platform haptic feedback helper with graceful degradation for web / unsupported devices.
 */
export const haptic = {
  /**
   * Subtle tick for tab switches, segmented controls, radio buttons, and category chips.
   */
  selection: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore if device does not support haptics
    }
  },

  /**
   * Light impact for normal button taps and interactions.
   */
  light: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
  },

  /**
   * Medium impact for primary actions like saving transactions.
   */
  medium: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  },

  /**
   * Heavy impact for destructive or prominent actions like deletion.
   */
  heavy: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore
    }
  },

  /**
   * Success notification pulse when a transaction is saved or updated.
   */
  success: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  },

  /**
   * Warning or error pulse when validation fails or something goes wrong.
   */
  warning: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }
  },
};
