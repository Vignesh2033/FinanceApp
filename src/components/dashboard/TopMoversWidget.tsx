import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Flame, ArrowRight, Zap } from 'lucide-react';

export const TopMoversWidget: React.FC = () => {
  const { profileAssets, watchlist, setActiveTab } = useFinance();

  // Top gaining assets by return %
  const topAssetPerformers = [...profileAssets]
    .filter(a => a.investedValue > 0)
    .sort((a, b) => {
      const gainPctA = (a.currentValue - a.investedValue) / a.investedValue;
      const gainPctB = (b.currentValue - b.investedValue) / b.investedValue;
      return gainPctB - gainPctA;
    })
    .slice(0, 3);

  // Top stock movers from Watchlist
  const topWatchlistMovers = [...watchlist]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 3);

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
              Portfolio Growth Drivers & Movers
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Top performing investments and high-velocity watched securities
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('watchlist')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Watchlist Terminal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Top Portfolio Holdings by Total ROI */}
        <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111614]/60 border border-gray-100 dark:border-gray-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">
            <span>🚀 Top Asset Holdings (Total Gain)</span>
            <span className="text-[10px] text-gray-400">All-Time</span>
          </div>

          <div className="space-y-2">
            {topAssetPerformers.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Add assets with cost basis to see performance rankings</p>
            ) : (
              topAssetPerformers.map(asset => {
                const gain = asset.currentValue - asset.investedValue;
                const gainPct = asset.investedValue > 0 ? (gain / asset.investedValue) * 100 : 0;
                const isPositive = gain >= 0;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setActiveTab('assets')}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161f1a] border border-gray-100 dark:border-gray-800/60 flex items-center justify-between hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {asset.name}
                      </p>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {asset.category} · <PrivacyValue amountInINR={asset.currentValue} compact={true} />
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{gainPct.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        +<PrivacyValue amountInINR={Math.abs(gain)} compact={true} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Top Watchlist Live Movers */}
        <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111614]/60 border border-gray-100 dark:border-gray-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">
            <span>⚡ Active Watchlist Day Movers</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Live</span>
          </div>

          <div className="space-y-2">
            {topWatchlistMovers.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Add stocks to your watchlist to monitor day momentum</p>
            ) : (
              topWatchlistMovers.map(stock => {
                const itemPositive = stock.change >= 0;

                return (
                  <div
                    key={stock.id}
                    onClick={() => setActiveTab('watchlist')}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161f1a] border border-gray-100 dark:border-gray-800/60 flex items-center justify-between hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-display text-gray-900 dark:text-white">
                          {stock.symbol}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                          {stock.exchange}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block">
                        {stock.name}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                        {stock.currency === 'USD' ? '$' : '₹'}{stock.currentPrice.toLocaleString()}
                      </div>
                      <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold ${
                        itemPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}>
                        {itemPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
