import { CurrencyCode } from '../types/finance';
import { CURRENCY_CONFIGS } from '../data/initialData';

/**
 * Formats a currency amount into localized representation (e.g., ₹2.08 Cr or $250.4K)
 */
export function formatCurrency(
  amountInINR: number,
  currencyCode: CurrencyCode = 'INR',
  compact: boolean = false,
  isMasked: boolean = false
): string {
  if (isMasked) {
    const symbol = CURRENCY_CONFIGS[currencyCode]?.symbol || '₹';
    return `${symbol} ••••••`;
  }

  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.INR;
  // Convert INR amount to selected currency
  const convertedAmount = currencyCode === 'INR' ? amountInINR : amountInINR / config.rateToINR;
  const symbol = config.symbol;

  if (compact) {
    if (currencyCode === 'INR') {
      const abs = Math.abs(convertedAmount);
      if (abs >= 10000000) {
        // Crores
        return `${convertedAmount < 0 ? '-' : ''}${symbol}${(abs / 10000000).toFixed(2)} Cr`;
      } else if (abs >= 100000) {
        // Lakhs
        return `${convertedAmount < 0 ? '-' : ''}${symbol}${(abs / 100000).toFixed(1)} L`;
      } else if (abs >= 1000) {
        // Thousands
        return `${convertedAmount < 0 ? '-' : ''}${symbol}${(abs / 1000).toFixed(1)} K`;
      }
      return `${convertedAmount < 0 ? '-' : ''}${symbol}${Math.round(abs).toLocaleString('en-IN')}`;
    } else {
      // Western compact notation
      const abs = Math.abs(convertedAmount);
      if (abs >= 1000000) {
        return `${convertedAmount < 0 ? '-' : ''}${symbol}${(abs / 1000000).toFixed(2)}M`;
      } else if (abs >= 1000) {
        return `${convertedAmount < 0 ? '-' : ''}${symbol}${(abs / 1000).toFixed(1)}K`;
      }
      return `${convertedAmount < 0 ? '-' : ''}${symbol}${Math.round(abs).toLocaleString()}`;
    }
  }

  // Full detailed number
  if (currencyCode === 'INR') {
    return `${convertedAmount < 0 ? '-' : ''}${symbol}${Math.abs(Math.round(convertedAmount)).toLocaleString('en-IN')}`;
  } else {
    return `${convertedAmount < 0 ? '-' : ''}${symbol}${Math.abs(Math.round(convertedAmount)).toLocaleString('en-US')}`;
  }
}

/**
 * Formats a percentage with optional +/- sign and color indicator
 */
export function formatPercentage(value: number, includeSign: boolean = true): string {
  const rounded = Number(value.toFixed(1));
  if (includeSign) {
    const prefix = rounded > 0 ? '+' : '';
    return `${prefix}${rounded}%`;
  }
  return `${rounded}%`;
}

/**
 * Formats standard ISO date strings into readable format (e.g., 15 Feb 2026)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
