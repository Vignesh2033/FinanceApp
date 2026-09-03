import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { WatchlistItem, WatchlistPeer, ShareholdingQuarter } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { getSectorPeers, getShareholdingTrend, calculateVolumeMultiple } from '../../utils/stockService';
import { fetchYahooHistoricalChart } from '../../utils/yahooFinance';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Clock,
  ExternalLink,
  Target,
  Bell,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  Sparkles,
  Calculator,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: WatchlistItem | null;
  onOpenBuyModal: (stock: WatchlistItem) => void;
}

type DetailTab = 'overview' | 'fundamentals' | 'shareholding' | 'peers' | 'sip';

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  isOpen,
  onClose,
  stock,
  onOpenBuyModal
}) => {
  const { currency, isPrivacyMode } = useFinance();
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1M');
  const [liveChartData, setLiveChartData] = useState<{ prices: number[]; dates: string[] } | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // SIP Calculator State inside Modal
  const [sipMonthlyAmount, setSipMonthlyAmount] = useState<number>(10000);
  const [sipYears, setSipYears] = useState<number>(3);

  // Fetch real-time multi-timeframe candles from Yahoo Finance
  useEffect(() => {
    if (!stock?.symbol || !isOpen) return;

    let isMounted = true;
    setIsLoadingChart(true);

    fetchYahooHistoricalChart(stock.symbol, selectedTimeframe)
      .then(res => {
        if (isMounted) {
          if (res && res.prices.length > 0) {
            setLiveChartData(res);
          } else {
            setLiveChartData(null);
          }
        }
      })
      .catch(() => {
        if (isMounted) setLiveChartData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingChart(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stock?.symbol, selectedTimeframe, isOpen]);

  if (!stock) return null;

  const isPositive = stock.change >= 0;

  // Chart data from Yahoo Finance live historical candles or fallback timeframe prices
  const fallbackPrices = stock.timeframes?.[selectedTimeframe] || stock.sparkline || [stock.currentPrice * 0.95, stock.currentPrice];
  const chartPrices = liveChartData?.prices || fallbackPrices;
  const chartDates = liveChartData?.dates || [];

  const chartData = chartPrices.map((val, idx) => ({
    time: chartDates[idx] || `P${idx + 1}`,
    price: val
  }));

  // 52-Week Range Progress
  const range52 = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
  const currentPos = range52 > 0 ? ((stock.currentPrice - stock.fiftyTwoWeekLow) / range52) * 100 : 50;

  // SIP Calculation
  const totalMonths = sipYears * 12;
  const totalSipInvested = sipMonthlyAmount * totalMonths;
  const estCagr = stock.exchange === 'CRYPTO' ? 25 : stock.roe && stock.roe > 20 ? 16 : 13;
  const monthlyRate = estCagr / 100 / 12;
  const futureSipValue = sipMonthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  const estimatedWealthGain = futureSipValue - totalSipInvested;

  // Guarantee Peers and Shareholding Trend
  const peersList: WatchlistPeer[] = stock.peers && stock.peers.length > 0
    ? stock.peers
    : getSectorPeers(stock.symbol, stock.sector);

  const shareholdingTrendData: ShareholdingQuarter[] = stock.shareholdingTrend && stock.shareholdingTrend.length > 0
    ? stock.shareholdingTrend
    : getShareholdingTrend(
        stock.promoterHolding ?? 50.3,
        stock.fiiHolding ?? 22.4,
        stock.diiHolding ?? 16.8,
        stock.publicHolding ?? 10.5,
        stock.promoterPledge ?? 0.0
      );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${stock.symbol} · ${stock.name}`}
      subtitle={`${stock.exchange} · ${stock.sector}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Top Price Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#111614]/70 border border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {stock.currency === 'USD' ? '$' : '₹'}{stock.currentPrice.toLocaleString()}
              </span>
              <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                isPositive
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
              }`}>
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              Day Range: {stock.currency === 'USD' ? '$' : '₹'}{stock.dayLow} – {stock.currency === 'USD' ? '$' : '₹'}{stock.dayHigh}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenBuyModal(stock);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Convert to Portfolio Holding</span>
            </button>
          </div>
        </div>

        {/* Interactive Multi-Timeframe Chart */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Price Action & Momentum
              </span>
              {isLoadingChart ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" /> Fetching Yahoo Candles...
                </span>
              ) : liveChartData ? (
                <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-300/40">
                  🟢 Yahoo Live Candles ({chartData.length} pts)
                </span>
              ) : null}
            </div>

            {/* Timeframe selector pills */}
            <div className="flex items-center bg-gray-100 dark:bg-[#18201b] p-0.5 rounded-lg text-[11px] font-mono">
              {(['1D', '1W', '1M', '1Y', '5Y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-[#2C6E49] text-white font-bold shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[200px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 rounded-lg bg-gray-900 text-white text-xs font-mono shadow-lg">
                          {stock.currency === 'USD' ? '$' : '₹'}{payload[0].value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth={2.5}
                  fill="url(#detailGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Technicals & Momentum', icon: Zap },
            { id: 'fundamentals', label: 'Financial Health & Valuation', icon: BarChart3 },
            { id: 'shareholding', label: 'Ownership & Trends', icon: Users },
            { id: 'peers', label: `Sector Peers (${peersList.length})`, icon: Activity },
            { id: 'sip', label: 'SIP Simulator', icon: Calculator }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#2C6E49] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Technicals & Momentum */}
        {activeDetailTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">RSI (14-Day)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                    {stock.rsi || 54.2}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                    (stock.rsi || 54.2) > 70 ? 'bg-rose-100 text-rose-800' : (stock.rsi || 54.2) < 35 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {(stock.rsi || 54.2) > 70 ? 'Overbought' : (stock.rsi || 54.2) < 35 ? 'Oversold / Dip' : 'Neutral'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">50-Day Moving Avg</span>
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5 block">
                  {stock.currency === 'USD' ? '$' : '₹'}{stock.dma50 || Math.round(stock.currentPrice * 0.97)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">200-Day Moving Avg</span>
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5 block">
                  {stock.currency === 'USD' ? '$' : '₹'}{stock.dma200 || Math.round(stock.currentPrice * 0.92)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Volume Shockers</span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  ⚡ {stock.volumeMultiple ?? calculateVolumeMultiple(stock.symbol, stock.changePercent)}x Avg Vol
                </span>
              </div>
            </div>

            {/* 52-Week Range Meter */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#141a17]">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-gray-500">52W Low: {stock.currency === 'USD' ? '$' : '₹'}{stock.fiftyTwoWeekLow}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">52-Week Range Indicator</span>
                <span className="text-gray-500">52W High: {stock.currency === 'USD' ? '$' : '₹'}{stock.fiftyTwoWeekHigh}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#2C6E49] rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, currentPos))}%` }}
                />
              </div>
            </div>

            {/* Overview description & Upcoming results */}
            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-[#121815]/70 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">
                  Company Overview & Earnings Calendar
                </h4>
                {stock.upcomingEarningsDate && (
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    📅 Next Earnings: {stock.upcomingEarningsDate}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                {stock.description}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Financial Health & Valuation */}
        {activeDetailTab === 'fundamentals' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">P/E Ratio</span>
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5 block">
                  {stock.peRatio ? `${stock.peRatio}x` : 'N/A'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Industry Avg: ~25.0x</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Price to Book (P/B)</span>
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5 block">
                  {stock.pbRatio ? `${stock.pbRatio}x` : '3.2x'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Book value multiple</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Return on Equity (ROE)</span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {stock.roe ? `${stock.roe}%` : '18.4%'}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">High capital efficiency</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">ROCE %</span>
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5 block">
                  {stock.roce ? `${stock.roce}%` : '16.5%'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Operating return</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Debt-to-Equity</span>
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5 block">
                  {stock.debtToEquity !== undefined ? `${stock.debtToEquity}x` : '0.25x'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Solvent balance sheet</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block">Free Cash Flow</span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {stock.freeCashFlow || '₹14,500 Cr'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Annual Cash Generation</span>
              </div>
            </div>

            {/* Quarterly Growth Summary */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 shadow-xs">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-3">
                Quarterly YoY Earnings Momentum
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">Revenue Growth (YoY)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{stock.yoyQuarterlyRevenueGrowth || 12.4}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">Net Profit Growth (YoY)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{stock.yoyQuarterlyProfitGrowth || 14.8}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-[#2C6E49] rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shareholding & Ownership (With 4-Quarter Trend) */}
        {activeDetailTab === 'shareholding' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 shadow-xs">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-3">
                Institutional & Promoter Shareholding Pattern
              </h4>

              {/* Stacked Percentage Bar */}
              <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: `${stock.promoterHolding ?? 50.3}%` }} className="bg-[#2C6E49]" title={`Promoter: ${stock.promoterHolding ?? 50.3}%`} />
                <div style={{ width: `${stock.fiiHolding ?? 22.4}%` }} className="bg-blue-500" title={`FII: ${stock.fiiHolding ?? 22.4}%`} />
                <div style={{ width: `${stock.diiHolding ?? 16.8}%` }} className="bg-purple-500" title={`DII: ${stock.diiHolding ?? 16.8}%`} />
                <div style={{ width: `${stock.publicHolding ?? 10.5}%` }} className="bg-amber-500" title={`Public: ${stock.publicHolding ?? 10.5}%`} />
              </div>

              {/* Legend & Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#121815]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2C6E49]" />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Promoter</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                    {stock.promoterHolding ?? 50.3}%
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Pledge: {stock.promoterPledge ?? 0.0}%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#121815]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">FII (Foreign)</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                    {stock.fiiHolding ?? 22.4}%
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Institutional stake</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#121815]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">DII (Domestic)</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                    {stock.diiHolding ?? 16.8}%
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Mutual funds</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#121815]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Public & Retail</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                    {stock.publicHolding ?? 10.5}%
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Free float</span>
                </div>
              </div>
            </div>

            {/* 4-Quarter Trend Table */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 shadow-xs">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quarterly Shareholding Trend (Last 4 Quarters)</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                      <th className="pb-2 font-medium">Quarter</th>
                      <th className="pb-2 font-medium text-right text-[#2C6E49]">Promoter %</th>
                      <th className="pb-2 font-medium text-right text-blue-600">FII %</th>
                      <th className="pb-2 font-medium text-right text-purple-600">DII %</th>
                      <th className="pb-2 font-medium text-right text-amber-600">Public %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                    {shareholdingTrendData.map((q, idx) => (
                      <tr key={q.quarter} className={idx === shareholdingTrendData.length - 1 ? 'font-bold bg-emerald-50/40 dark:bg-emerald-950/30' : ''}>
                        <td className="py-2 text-gray-800 dark:text-gray-200">{q.quarter}</td>
                        <td className="py-2 text-right">{q.promoter}%</td>
                        <td className="py-2 text-right text-blue-600 dark:text-blue-400">{q.fii}%</td>
                        <td className="py-2 text-right text-purple-600 dark:text-purple-400">{q.dii}%</td>
                        <td className="py-2 text-right text-amber-600 dark:text-amber-400">{q.public}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Peer Comparison */}
        {activeDetailTab === 'peers' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 shadow-xs">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-3">
                Sector Competitor Matrix ({stock.sector})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                      <th className="pb-2 font-medium">Company</th>
                      <th className="pb-2 font-medium text-right">P/E Ratio</th>
                      <th className="pb-2 font-medium text-right">Market Cap</th>
                      <th className="pb-2 font-medium text-right">Day %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/30 font-bold">
                      <td className="py-2.5 text-emerald-900 dark:text-emerald-200">{stock.symbol} (This Stock)</td>
                      <td className="py-2.5 text-right">{stock.peRatio || 'N/A'}x</td>
                      <td className="py-2.5 text-right">{stock.marketCap}</td>
                      <td className="py-2.5 text-right text-emerald-600">+{stock.changePercent}%</td>
                    </tr>
                    {peersList.map(peer => (
                      <tr key={peer.symbol}>
                        <td className="py-2 text-gray-800 dark:text-gray-200">{peer.name} ({peer.symbol})</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{peer.pe}x</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{peer.marketCap}</td>
                        <td className={`py-2 text-right ${peer.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {peer.changePercent >= 0 ? '+' : ''}{peer.changePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: SIP Historical Simulator */}
        {activeDetailTab === 'sip' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 shadow-xs">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-3 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Monthly SIP Accumulation Simulator in {stock.symbol}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Investment Amount ({stock.currency === 'USD' ? '$' : '₹'})
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={sipMonthlyAmount}
                    onChange={(e) => setSipMonthlyAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Duration: {sipYears} Years
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={sipYears}
                    onChange={(e) => setSipYears(parseInt(e.target.value))}
                    className="w-full accent-[#2C6E49]"
                  />
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#121815]">
                  <span className="text-[10px] uppercase font-mono text-gray-400">Total Invested</span>
                  <div className="text-base font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                    {stock.currency === 'USD' ? '$' : '₹'}{Math.round(totalSipInvested).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#121815]">
                  <span className="text-[10px] uppercase font-mono text-gray-400">Compounded Wealth Gained</span>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +{stock.currency === 'USD' ? '$' : '₹'}{Math.round(estimatedWealthGain).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] uppercase font-mono text-emerald-800 dark:text-emerald-300 font-bold">Estimated Total Corpus</span>
                  <div className="text-base font-bold font-mono text-emerald-950 dark:text-emerald-100 mt-0.5">
                    {stock.currency === 'USD' ? '$' : '₹'}{Math.round(futureSipValue).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
