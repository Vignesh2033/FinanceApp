import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Camera, Calendar } from 'lucide-react';

interface NetWorthChartProps {
  onOpenSnapshotModal: () => void;
}

type Timeframe = '6M' | '1Y' | '3Y' | 'ALL';

export const NetWorthChart: React.FC<NetWorthChartProps> = ({ onOpenSnapshotModal }) => {
  const { profileSnapshots, netWorth, totalAssetValue, totalLiabilityValue, currency, isPrivacyMode, isDarkMode } = useFinance();
  const [timeframe, setTimeframe] = useState<Timeframe>('ALL');

  // Build chart dataset from snapshots + current live net worth
  const chartData = useMemo(() => {
    const sorted = [...profileSnapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Check if the current month is already the last item
    const currentMonthLabel = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const formatted = sorted.map(s => ({
      date: s.date,
      month: s.monthLabel,
      netWorth: s.netWorth,
      assets: s.totalAssets,
      liabilities: s.totalLiabilities
    }));

    if (formatted.length === 0 || formatted[formatted.length - 1].month !== currentMonthLabel) {
      formatted.push({
        date: new Date().toISOString().split('T')[0],
        month: currentMonthLabel + ' (Now)',
        netWorth: netWorth,
        assets: totalAssetValue,
        liabilities: totalLiabilityValue
      });
    }

    if (timeframe === '6M') {
      return formatted.slice(-6);
    } else if (timeframe === '1Y') {
      return formatted.slice(-12);
    } else if (timeframe === '3Y') {
      return formatted.slice(-36);
    }
    return formatted;
  }, [profileSnapshots, netWorth, totalAssetValue, totalLiabilityValue, timeframe]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#161e1a] p-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-semibold text-gray-800 dark:text-gray-200 font-mono border-b border-gray-100 dark:border-gray-800 pb-1">
            {data.month}
          </p>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Net Worth:</span>
            <span>{formatCurrency(data.netWorth, currency, false, isPrivacyMode)}</span>
          </div>
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span>Assets:</span>
            <span>{formatCurrency(data.assets, currency, false, isPrivacyMode)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-500">
            <span>Liabilities:</span>
            <span>{formatCurrency(data.liabilities, currency, false, isPrivacyMode)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
            Net Worth Growth
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Historical progression and asset compounding trajectory
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Timeframe selector */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl text-xs font-mono">
            {(['6M', '1Y', '3Y', 'ALL'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white dark:bg-[#1b2420] text-[#2C6E49] dark:text-emerald-400 font-bold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Record Snapshot CTA */}
          <button
            onClick={onOpenSnapshotModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2C6E49] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-1.5 rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Record Snapshot</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] sm:h-[340px] xl:h-[360px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDarkMode ? '#34d399' : '#2C6E49'} stopOpacity={0.35} />
                <stop offset="95%" stopColor={isDarkMode ? '#34d399' : '#2C6E49'} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkMode ? '#24322c' : '#f0f2ed'}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontFamily: 'monospace' }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => isPrivacyMode ? '••••' : formatCurrency(val, currency, true, false)}
              tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontFamily: 'monospace' }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="assets"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#assetsGradient)"
            />

            <Area
              type="monotone"
              dataKey="netWorth"
              stroke={isDarkMode ? '#34d399' : '#2C6E49'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#netWorthGradient)"
              activeDot={{ r: 6, fill: isDarkMode ? '#34d399' : '#2C6E49', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1 rounded-full bg-[#2C6E49] dark:bg-emerald-400" />
          <span>Net Worth</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1 rounded-full bg-blue-500" />
          <span>Total Assets</span>
        </div>
      </div>
    </div>
  );
};
