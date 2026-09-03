import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { formatCurrency } from '../../utils/formatters';
import { PieChart as PieIcon, ArrowRight } from 'lucide-react';

export const AssetAllocation: React.FC = () => {
  const { assetAllocation, totalAssetValue, currency, isPrivacyMode, setActiveTab } = useFinance();

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#161e1a] p-2.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.category}</span>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300 font-mono">
            {formatCurrency(data.value, currency, false, isPrivacyMode)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#2C6E49] dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                Asset Allocation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Diversification across {assetAllocation.length} asset classes
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('assets')}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Donut Chart and List */}
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] xl:grid-cols-1 2xl:grid-cols-[160px_1fr] gap-4 items-center">
          {/* Donut Chart */}
          <div className="h-[160px] w-[160px] mx-auto relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={assetAllocation}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-mono text-gray-400">Total</span>
              <span className="text-xs font-bold font-display text-gray-800 dark:text-gray-200">
                <PrivacyValue amountInINR={totalAssetValue} compact={true} />
              </span>
            </div>
          </div>

          {/* Breakdown progress list */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {assetAllocation.map(item => (
              <div key={item.category} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 truncate font-medium">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-400">({item.count})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="text-gray-900 dark:text-white font-semibold">
                      <PrivacyValue amountInINR={item.value} compact={true} />
                    </span>
                    <span className="text-gray-400 text-[11px] w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(3, item.percentage)}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Recommended Equity/Debt: 60:40</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Balanced Portfolio</span>
      </div>
    </div>
  );
};
