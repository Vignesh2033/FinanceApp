import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PrivacyValueProps {
  amountInINR?: number;
  compact?: boolean;
  className?: string;
  isPercent?: boolean;
  percentValue?: number;
  showSign?: boolean;
}

export const PrivacyValue: React.FC<PrivacyValueProps> = ({
  amountInINR = 0,
  compact = false,
  className = '',
  isPercent = false,
  percentValue = 0,
  showSign = false
}) => {
  const { currency, isPrivacyMode } = useFinance();

  if (isPercent) {
    return (
      <span className={`tabular-nums ${className}`}>
        {formatPercentage(percentValue, showSign)}
      </span>
    );
  }

  const formatted = formatCurrency(amountInINR, currency, compact, isPrivacyMode);

  return (
    <span className={`tabular-nums transition-all duration-150 ${className}`}>
      {formatted}
    </span>
  );
};
