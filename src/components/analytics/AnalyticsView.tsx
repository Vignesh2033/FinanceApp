import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { formatCurrency } from '../../utils/formatters';
import {
  PieChart,
  TrendingUp,
  ShieldCheck,
  Landmark,
  ArrowUpRight,
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const {
    netWorth,
    totalAssetValue,
    totalLiabilityValue,
    assetAllocation,
    profileSnapshots,
    currency,
    isPrivacyMode,
    isDarkMode
  } = useFinance();

  // Calculate Diversification Index (0 - 100)
  const maxClassPercentage = assetAllocation.length > 0 ? Math.max(...assetAllocation.map(a => a.percentage)) : 100;
  const diversificationScore = Math.max(20, Math.min(98, Math.round(100 - (maxClassPercentage * 0.7))));

  // Snapshots comparison bar chart data
  const snapshotChartData = profileSnapshots.map(s => ({
    month: s.monthLabel,
    NetWorth: s.netWorth,
    Assets: s.totalAssets,
    Liabilities: s.totalLiabilities
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/10 via-white to-gray-50 dark:from-[#101914] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2C6E49] to-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Wealth Analytics & Health
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Deep dive into asset allocation balance, net worth velocity, and risk metrics
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400 font-mono">
              Diversification Index
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-2">
            {diversificationScore} / 100
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            Spread across {assetAllocation.length} distinct asset classes
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400 font-mono">
              Debt Leverage Factor
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-gray-900 dark:text-white mt-2">
            {totalAssetValue > 0 ? ((totalLiabilityValue / totalAssetValue) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            Liabilities as % of gross assets (Conservative)
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400 font-mono">
              Net Wealth Ratio
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400 mt-2">
            {totalAssetValue > 0 ? ((netWorth / totalAssetValue) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            Portion of assets free and clear of debt
          </p>
        </div>
      </div>

      {/* Snapshot Progression Chart */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
          Assets vs. Liabilities Progression
        </h3>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={snapshotChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#24322c' : '#f0f2ed'} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontFamily: 'monospace' }} />
              <YAxis tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontFamily: 'monospace' }} tickFormatter={(val) => isPrivacyMode ? '••••' : formatCurrency(val, currency, true, false)} />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value), currency, false, isPrivacyMode)} />
              <Legend />
              <Bar dataKey="Assets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="NetWorth" fill={isDarkMode ? '#34d399' : '#2C6E49'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Liabilities" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Distribution Breakdown */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
          Class-by-Class Concentration Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {assetAllocation.map(item => (
            <div key={item.category} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#111614]/50 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {item.category}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: item.color }}>
                  {item.percentage}%
                </span>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white font-display mt-1.5">
                <PrivacyValue amountInINR={item.value} />
              </div>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                {item.count} items held
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
