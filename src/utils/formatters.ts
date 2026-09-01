import { TransactionType } from '../types/expense';

/**
 * Formats a numeric value as a currency string (e.g. $1,250.00).
 */
export const formatCurrency = (
  amount: number,
  options?: {
    showSign?: boolean;
    type?: TransactionType;
  }
): string => {
  const absValue = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);

  if (options?.showSign) {
    if (options.type === 'income') {
      return `+${formatted}`;
    }
    if (options.type === 'expense') {
      return `-${formatted}`;
    }
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }

  return formatted;
};

/**
 * Formats an ISO 8601 date string into human-readable format.
 */
export const formatDate = (
  dateString: string,
  variant: 'short' | 'medium' | 'full' | 'time' = 'medium'
): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    switch (variant) {
      case 'short':
        return date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
        });
      case 'medium':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'full':
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'time':
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
    }
  } catch {
    return dateString;
  }
};

/**
 * Formats a fraction/percentage with one decimal place (e.g. 34.5%).
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total <= 0 || isNaN(value) || isNaN(total)) {
    return '0%';
  }
  const pct = (value / total) * 100;
  return `${pct.toFixed(pct % 1 === 0 ? 0 : 1)}%`;
};
