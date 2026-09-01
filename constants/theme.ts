import { CategoryId } from '../types/expense';

export const COLORS = {
  // Transaction Indicators
  income: '#10B981',     // Green
  expense: '#EF4444',    // Red

  // Category Color Palette
  categories: {
    housing: '#3B82F6',        // Blue
    transportation: '#F59E0B', // Amber
    food: '#EC4899',           // Pink
    utilities: '#8B5CF6',      // Purple
    entertainment: '#06B6D4',  // Cyan
    salary: '#10B981',         // Emerald Green
    freelance: '#14B8A6',      // Teal
    investment: '#6366F1',     // Indigo
    other: '#6B7280',          // Slate Grey
  } as Record<CategoryId, string>,

  // Light Mode Tokens
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },

  // Dark Mode Tokens
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    border: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;