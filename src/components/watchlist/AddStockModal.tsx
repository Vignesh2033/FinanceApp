import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import {
  POPULAR_STOCKS_DIRECTORY,
  fetchStockInfoFromOnline,
  searchYahooFinance,
  StockSearchResult
} from '../../utils/stockService';
import { WatchlistItem, YahooSearchResult } from '../../types/finance';
import {
  Search,
  Plus,
  TrendingUp,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Coins,
  Zap
} from 'lucide-react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose }) => {
  const { addToWatchlist, watchlist } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'NSE' | 'US' | 'ETF' | 'CRYPTO'>('ALL');
  const [isFetching, setIsFetching] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineSearchResults, setOnlineSearchResults] = useState<YahooSearchResult[]>([]);
  const [livePreview, setLivePreview] = useState<WatchlistItem | null>(null);
  const [targetAlertPrice, setTargetAlertPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Debounced online search on Yahoo Finance
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setOnlineSearchResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const results = await searchYahooFinance(searchQuery.trim());
        setOnlineSearchResults(results);
      } catch {
        setOnlineSearchResults([]);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter local popular directory
  const filteredDirectory = POPULAR_STOCKS_DIRECTORY.filter(item => {
    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'NSE' && (item.exchange === 'NSE' || item.exchange === 'BSE')) ||
      (categoryFilter === 'US' && (item.exchange === 'NASDAQ' || item.exchange === 'NYSE')) ||
      (categoryFilter === 'ETF' && (item.sector.includes('ETF') || item.sector.includes('SGB') || item.sector.includes('Precious Metals'))) ||
      (categoryFilter === 'CRYPTO' && item.exchange === 'CRYPTO');

    const matchesSearch =
      !searchQuery.trim() ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // When stock selected from list or online search, load live quote preview
  const handleSelectSymbol = async (symbol: string) => {
    setSearchQuery(symbol);
    setIsFetching(true);
    try {
      const liveData = await fetchStockInfoFromOnline(symbol);
      setLivePreview(liveData);
      setTargetAlertPrice(String(Math.round(liveData.currentPrice * 0.95)));
    } catch {
      //
    } finally {
      setIsFetching(false);
    }
  };

  // Add custom ticker search lookup on Enter or button
  const handleFetchCustomTicker = async () => {
    if (!searchQuery.trim()) return;
    setIsFetching(true);
    try {
      const liveData = await fetchStockInfoFromOnline(searchQuery.trim());
      setLivePreview(liveData);
      setTargetAlertPrice(String(Math.round(liveData.currentPrice * 0.95)));
    } catch {
      //
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!livePreview) return;

    const itemToAdd: WatchlistItem = {
      ...livePreview,
      alertPrice: targetAlertPrice ? parseFloat(targetAlertPrice) : undefined,
      notes: notes || undefined
    };

    addToWatchlist(itemToAdd);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSearchQuery('');
      setLivePreview(null);
      setTargetAlertPrice('');
      setNotes('');
      setOnlineSearchResults([]);
      onClose();
    }, 1000);
  };

  // Quick 1-click add from list
  const handleQuickAdd = async (symbol: string) => {
    setIsFetching(true);
    try {
      const liveData = await fetchStockInfoFromOnline(symbol);
      addToWatchlist(liveData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Stock to Watchlist"
      subtitle="Live Yahoo Finance real-time quotes, global directory & custom ticker lookup"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Search input with live fetch button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Search Ticker, Company or Index
            </label>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-mono flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3" /> Yahoo Finance Live Autocomplete
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. RELIANCE, TCS, TATAMOTORS, NVDA, AAPL, GOLDBEES, BTC-USD..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (livePreview && e.target.value.toUpperCase() !== livePreview.symbol.toUpperCase()) {
                    setLivePreview(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFetchCustomTicker();
                  }
                }}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {isSearchingOnline && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFetchCustomTicker}
              disabled={isFetching || !searchQuery.trim()}
              className="px-4 h-11 rounded-xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Get Quote</span>
            </button>
          </div>
        </div>

        {/* Live Yahoo Finance Autocomplete Results Dropdown if query active and no preview */}
        {onlineSearchResults.length > 0 && !livePreview && (
          <div className="p-2 rounded-2xl bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 font-mono">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Yahoo Finance Live Matches ({onlineSearchResults.length})
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Click to preview quote</span>
            </div>
            <div className="divide-y divide-emerald-500/10 max-h-48 overflow-y-auto">
              {onlineSearchResults.map((res) => (
                <div
                  key={res.symbol}
                  onClick={() => handleSelectSymbol(res.symbol)}
                  className="p-2 px-3 rounded-xl flex items-center justify-between hover:bg-emerald-500/15 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-gray-900 dark:text-white">
                        {res.symbol}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {res.exchDisp}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {res.typeDisp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">
                      {res.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(res.symbol);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] shadow-2xs"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: '🔥 All Popular' },
            { id: 'NSE', label: '🇮🇳 Indian (NSE)' },
            { id: 'US', label: '🇺🇸 US Tech (NASDAQ)' },
            { id: 'ETF', label: '📈 ETFs & Gold SGB' },
            { id: 'CRYPTO', label: '🪙 Crypto' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 dark:bg-[#18201b] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Quote Preview Card if selected */}
        {livePreview ? (
          <form onSubmit={handleAddStock} className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-emerald-950 dark:text-emerald-100">
                      {livePreview.symbol}
                    </span>
                    <span className="text-xs text-emerald-800/80 dark:text-emerald-300 font-medium">
                      {livePreview.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      {livePreview.exchange}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {livePreview.sector} · <span className="text-gray-500 font-mono">Market Cap: {livePreview.marketCap}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold font-display text-emerald-950 dark:text-emerald-100">
                    {livePreview.currency === 'USD' ? '$' : '₹'}{livePreview.currentPrice.toLocaleString()}
                  </div>
                  <div className={`text-xs font-mono font-bold flex items-center justify-end gap-0.5 ${
                    livePreview.change >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                  }`}>
                    {livePreview.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {livePreview.change >= 0 ? '+' : ''}{livePreview.change.toFixed(2)} ({livePreview.change >= 0 ? '+' : ''}{livePreview.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>

              {/* Day range & 52-week summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-mono">
                <div>
                  <span className="text-gray-400 block text-[10px]">Day High</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{livePreview.currency === 'USD' ? '$' : '₹'}{livePreview.dayHigh}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Day Low</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{livePreview.currency === 'USD' ? '$' : '₹'}{livePreview.dayLow}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">52W High</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{livePreview.currency === 'USD' ? '$' : '₹'}{livePreview.fiftyTwoWeekHigh}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">52W Low</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{livePreview.currency === 'USD' ? '$' : '₹'}{livePreview.fiftyTwoWeekLow}</span>
                </div>
              </div>
            </div>

            {/* Target Alert & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Buy Alert Price (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 950"
                  value={targetAlertPrice}
                  onChange={(e) => setTargetAlertPrice(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Personal Research Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accumulate below 200 EMA, Q4 target"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setLivePreview(null)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer"
              >
                ← Back to List
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFetching}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Added to Watchlist!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Confirm & Add to Watchlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Popular Stock Directory List */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>Instrument ({filteredDirectory.length} available)</span>
              <span>Action / Live Quote</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17] divide-y divide-gray-100 dark:divide-gray-800/80 max-h-[360px] overflow-y-auto shadow-inner">
              {filteredDirectory.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No directory matches found. Enter the ticker above and click <strong>"Get Quote"</strong> to fetch online.
                </div>
              ) : (
                filteredDirectory.map(stock => {
                  const isAlreadyAdded = watchlist.some(
                    w => w.symbol.toUpperCase() === stock.symbol.toUpperCase() ||
                         w.symbol.toUpperCase() === `${stock.symbol}.NS`
                  );

                  return (
                    <div
                      key={stock.symbol}
                      className="p-3 px-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <div
                        onClick={() => handleSelectSymbol(stock.symbol)}
                        className="flex-1 cursor-pointer min-w-0 pr-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs font-mono text-gray-900 dark:text-white">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {stock.exchange}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {stock.name} · <span className="text-[11px] text-gray-400">{stock.sector}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {isAlreadyAdded ? (
                          <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                            Added ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(stock.symbol)}
                            disabled={isFetching}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
