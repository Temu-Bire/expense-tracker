import { CategoryId } from '../types/expense';

export const COLORS = {
  // Brand / Accent
  primary: '#2563EB',       // Modern Indigo/Blue
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  // Semantic
  income: '#10B981',        // Emerald Green
  incomeLight: '#D1FAE5',
  expense: '#EF4444',       // Coral Red
  expenseLight: '#FEE2E2',
  warning: '#F59E0B',
  info: '#0EA5E9',

  // Category Color Palette
  categories: {
    housing: '#3B82F6',        // Blue
    transportation: '#F59E0B', // Amber
    food: '#EC4899',           // Pink
    utilities: '#8B5CF6',      // Purple
    entertainment: '#06B6D4',  // Cyan
    healthcare: '#14B8A6',     // Teal
    shopping: '#F97316',       // Orange
    salary: '#10B981',         // Emerald Green
    freelance: '#6366F1',      // Indigo
    investment: '#84CC16',     // Lime
    other: '#6B7280',          // Slate Grey
  } as Record<CategoryId, string>,

  // Light Mode Tokens
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    cardBackground: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  },

  // Dark Mode Tokens
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    surfaceElevated: '#283548',
    border: '#334155',
    borderLight: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    cardBackground: '#1E293B',
    tabBarBackground: '#0F172A',
    tabBarBorder: '#1E293B',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
