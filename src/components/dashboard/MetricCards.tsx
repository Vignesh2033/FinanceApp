import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import {
  TrendingUp,
  Landmark,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  Plus
} from 'lucide-react';

interface MetricCardsProps {
  onOpenAddAsset: () => void;
  onOpenAddLiability: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  onOpenAddAsset,
  onOpenAddLiability
}) => {
  const {
    netWorth,
    totalAssetValue,
    totalLiabilityValue,
    profileAssets,
    profileLiabilities,
    savingsRate,
    monthlySavings,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    overallUnrealizedGainPercent,
    setActiveTab
  } = useFinance();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5">
      {/* 1. Net Worth Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-[#141a17] dark:via-[#141a17] dark:to-[#0f1712] border-2 border-emerald-500/40 dark:border-emerald-500/30 p-5 xl:p-6 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
            Net Worth
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#2C6E49] dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3.5">
          <div className="font-display text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            <PrivacyValue amountInINR={netWorth} compact={true} />
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
            <PrivacyValue amountInINR={netWorth} compact={false} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2.5 py-0.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <PrivacyValue isPercent={true} percentValue={overallUnrealizedGainPercent || 18.2} showSign={true} />
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">vs invested cost</span>
        </div>
      </div>

      {/* 2. Total Assets Card */}
      <div
        onClick={() => setActiveTab('assets')}
        className="cursor-pointer group relative overflow-hidden rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/50"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
            Total Assets
          </span>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3.5">
          <div className="font-display text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            <PrivacyValue amountInINR={totalAssetValue} compact={true} />
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
            {profileAssets.length} tracked assets
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            Across 6 asset classes
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenAddAsset(); }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="Add asset"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Total Liabilities Card */}
      <div
        onClick={() => setActiveTab('liabilities')}
        className="cursor-pointer group relative overflow-hidden rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs transition-all hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700/50"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
            Liabilities & Debt
          </span>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3.5">
          <div className="font-display text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            <PrivacyValue amountInINR={totalLiabilityValue} compact={true} />
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
            {profileLiabilities.length} active loans & dues
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            Debt/Asset: {totalAssetValue > 0 ? ((totalLiabilityValue / totalAssetValue) * 100).toFixed(1) : 0}%
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenAddLiability(); }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="Add loan"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Cash Flow & Savings Rate Card */}
      <div
        onClick={() => setActiveTab('cashflow')}
        className="cursor-pointer group relative overflow-hidden rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/50"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
            Monthly Savings Rate
          </span>
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3.5">
          <div className="font-display text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {savingsRate.toFixed(0)}%
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
            +<PrivacyValue amountInINR={monthlySavings} compact={true} /> saved / month
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              In: <PrivacyValue amountInINR={totalMonthlyIncome} compact={true} />
            </span>
            <span>·</span>
            <span className="text-rose-500 dark:text-rose-400 font-bold">
              Out: <PrivacyValue amountInINR={totalMonthlyExpenses} compact={true} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
