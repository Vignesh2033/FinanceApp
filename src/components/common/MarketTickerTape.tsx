import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';

export const MarketTickerTape: React.FC = () => {
  const { marketIndices, refreshMarketIndices, isRefreshingQuotes, lastQuotesSyncedAt } = useFinance();

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950/20 via-gray-900/10 to-emerald-950/20 dark:from-[#0d1410] dark:via-[#131b16] dark:to-[#0d1410] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left Status Badge */}
        <div className="flex items-center gap-2 shrink-0 px-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-900 dark:text-emerald-400 uppercase tracking-wider font-mono">
              Yahoo Finance
            </span>
            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
              · {lastQuotesSyncedAt ? `Synced ${lastQuotesSyncedAt}` : 'Live Feeds'}
            </span>
          </div>
        </div>

        {/* Indices Horizontal Strip */}
        <div className="flex-1 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {marketIndices.map((idx) => {
              const isPositive = idx.change >= 0;
              const isUSD = idx.currency === 'USD';

              return (
                <div
                  key={idx.symbol}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#18221b]/80 border border-gray-200/60 dark:border-gray-800/60 hover:border-emerald-500/40 transition-all shadow-2xs"
                >
                  <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 font-mono">
                    {idx.name}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">
                    {isUSD ? '$' : '₹'}{idx.price > 0 ? idx.price.toLocaleString() : '---'}
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-mono font-bold ${
                      isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sync Action */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 px-1">
          <button
            type="button"
            onClick={() => refreshMarketIndices()}
            disabled={isRefreshingQuotes}
            title="Sync latest quotes from Yahoo Finance"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300/60 dark:border-emerald-800/60 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingQuotes ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
        </div>
      </div>
    </div>
  );
};
