import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ValuationBandPoint } from '../../types/finance';
import {
  calculateMarketSentiment,
  HISTORICAL_VALUATION_SERIES,
  SECTOR_SENTIMENT_BREAKDOWN
} from '../../utils/marketSentimentService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Gauge,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  CheckCircle2,
  Scale,
  RefreshCw,
  Plus,
  Info,
  Calendar
} from 'lucide-react';

export const MarketSentimentView: React.FC = () => {
  const { setActiveTab, addToWatchlist } = useFinance();
  const [activeSubTab, setActiveSubTab] = useState<'VALUATION_BANDS' | 'SECTOR_RADAR' | 'PILLARS_DEEP_DIVE'>('VALUATION_BANDS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate sentiment data
  const sentiment = useMemo(() => calculateMarketSentiment(), []);

  // Quick Watchlist Add Helper
  const handleAddStock = (symbol: string, sector: string) => {
    addToWatchlist({
      id: `wl-${Date.now()}-${symbol}`,
      symbol,
      name: `${symbol} Ltd`,
      exchange: 'NSE',
      currentPrice: 0,
      change: 0,
      changePercent: 0,
      dayHigh: 0,
      dayLow: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      sector,
      currency: 'INR',
      sparkline: [100, 102, 104, 103, 105, 106],
      addedAt: new Date().toISOString().split('T')[0]
    });
    setToastMessage(`Added ${symbol} to your Watchlist under "${sector}"!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Color mapping based on score
  const getScoreColor = (score: number) => {
    if (score <= 25) return '#10b981'; // emerald
    if (score <= 45) return '#059669'; // green
    if (score <= 55) return '#3b82f6'; // blue
    if (score <= 75) return '#f59e0b'; // amber
    return '#ef4444'; // rose / red
  };

  const scoreColor = getScoreColor(sentiment.compositeScore);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-blue-900/10 via-white to-gray-50 dark:from-[#121926] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-bold shadow-md">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
                Indian Market Sentiment & Valuation Radar
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-800">
                Fear & Greed Engine
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              6-Pillar Macro Valuation, Nifty 50 ±1 SD Bands & Tactical SIP Step-Up Playbook
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sector_balancing')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#2C6E49] hover:bg-[#23583a] text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Open Sector Rebalancer</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-xs font-mono font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Hero Speedometer Gauge & Tactical Playbook Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Speedometer Gauge Box */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Composite Sentiment Meter</span>
            </span>
            <span className="text-[11px] font-mono text-gray-400">
              Score: 0 (Extreme Fear) - 100 (Greed)
            </span>
          </div>

          {/* Circular Gauge Graphic */}
          <div className="relative flex flex-col items-center justify-center py-2">
            {/* SVG Arc Gauge */}
            <svg className="w-64 h-36" viewBox="0 0 200 110">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="25%" stopColor="#059669" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="75%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
                strokeLinecap="round"
                className="dark:stroke-gray-800"
              />
              {/* Colored Gauge Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * sentiment.compositeScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Needle / Center Display */}
            <div className="text-center -mt-8 space-y-0.5">
              <div
                className="text-4xl font-black font-display tracking-tight"
                style={{ color: scoreColor }}
              >
                {sentiment.compositeScore}
              </div>
              <div
                className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block"
                style={{
                  color: scoreColor,
                  borderColor: `${scoreColor}40`,
                  backgroundColor: `${scoreColor}15`
                }}
              >
                {sentiment.label}
              </div>
            </div>
          </div>

          {/* Gauge Range Scale Indicators */}
          <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">0-25<br />Ext Fear</span>
            <span className="text-emerald-700 dark:text-emerald-500 font-bold">26-45<br />Fear</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">46-55<br />Neutral</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">56-75<br />Greed</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">76-100<br />Ext Greed</span>
          </div>
        </div>

        {/* Tactical Asset Allocation Playbook Banner */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 dark:from-[#141a17] dark:via-[#151f28] dark:to-[#10171d] border border-blue-200/80 dark:border-blue-800/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Tactical Asset Allocation Playbook</span>
              </span>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                SIP Multiplier: {sentiment.tacticalAdvice.sipMultiplier}x
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display mt-1">
              {sentiment.tacticalAdvice.headline}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {sentiment.tacticalAdvice.rationale}
            </p>
          </div>

          {/* Action Recommendations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#16211c] border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono block">
                Monthly SIP Action
              </span>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {sentiment.tacticalAdvice.sipAdvice}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#16211c] border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono block">
                Cash & Dry Powder Deployment
              </span>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {sentiment.tacticalAdvice.cashAdvice}
              </p>
            </div>
          </div>

          {/* Stance Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-500">Key Recommended Action:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {sentiment.tacticalAdvice.keyAction}
              </span>
            </div>

            <button
              onClick={() => setActiveTab('sector_balancing')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Execute in Sector Rebalancer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. 6 Quantitative Pillars Breakdown Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>6 Quantitative Macro Pillars (Weighted Breakdown)</span>
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            Updated daily with live Nifty & VIX feeds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sentiment.pillars.map(pillar => {
            const pColor = getScoreColor(pillar.score);
            return (
              <div
                key={pillar.id}
                className="p-4 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
                        {pillar.category} · Weight: {Math.round(pillar.weight * 100)}%
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                        {pillar.name}
                      </h4>
                    </div>

                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0"
                      style={{
                        color: pColor,
                        backgroundColor: `${pColor}15`,
                        border: `1px solid ${pColor}30`
                      }}
                    >
                      Score: {pillar.score}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Current Reading:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                      {pillar.currentValStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Benchmark:</span>
                    <span className="font-mono text-gray-500">{pillar.benchmarkStr}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pillar.score}%`,
                        backgroundColor: pColor
                      }}
                    />
                  </div>

                  <div className="text-[11px] font-semibold text-right" style={{ color: pColor }}>
                    {pillar.statusLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#111713] border border-gray-200 dark:border-gray-800">
        {[
          { id: 'VALUATION_BANDS', label: '📈 5-Year Nifty Valuation Bands (±1 SD)', icon: TrendingUp },
          { id: 'SECTOR_RADAR', label: '🧭 Sector Fear vs Greed Radar', icon: Scale },
          { id: 'PILLARS_DEEP_DIVE', label: '📖 Macro Valuation Framework & Formulae', icon: Info },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#1a231e] text-[#2C6E49] dark:text-emerald-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================================= */}
      {/* SUB-TAB 1: 5-YEAR NIFTY VALUATION BANDS RECHARTS CHART */}
      {/* ========================================================================================= */}
      {activeSubTab === 'VALUATION_BANDS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Nifty 50 Historical Trailing P/E vs Statistical Valuation Bands</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Plots Nifty Trailing P/E over 5 years against +1 SD (24.5x Euphoria), Median (20.5x), and -1 SD (17.5x Bargain Zone)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" /> +1 SD (24.5x)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" /> 10Y Median (20.5x)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> -1 SD (17.5x)
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORICAL_VALUATION_SERIES} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="peGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="yearMonth" tick={{ fill: '#888', fontSize: 11 }} />
                  <YAxis domain={[14, 36]} tick={{ fill: '#888', fontSize: 11 }} unit="x" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as ValuationBandPoint;
                        return (
                          <div className="p-3.5 rounded-2xl bg-gray-900/95 text-white text-xs space-y-1.5 shadow-xl border border-gray-800">
                            <p className="font-bold text-blue-400">{data.yearMonth}</p>
                            <p>Nifty Price: <span className="font-mono font-bold">₹{data.niftyPrice.toLocaleString()}</span></p>
                            <p>Trailing P/E: <span className="font-mono font-bold text-emerald-400">{data.niftyPE}x</span></p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              Bands: 17.5x (Lower) · 20.5x (Median) · 24.5x (Upper)
                            </p>
                            {data.eventLabel && (
                              <p className="text-[11px] font-bold text-amber-400 pt-1 border-t border-gray-700">
                                📌 {data.eventLabel}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={24.5} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Euphoria (+1 SD: 24.5x)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                  <ReferenceLine y={20.5} stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '10Y Median (20.5x)', fill: '#3b82f6', fontSize: 10, position: 'top' }} />
                  <ReferenceLine y={17.5} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Bargain Accumulation (-1 SD: 17.5x)', fill: '#10b981', fontSize: 10, position: 'bottom' }} />
                  <Area type="monotone" dataKey="niftyPE" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#peGradient)" name="Nifty Trailing P/E" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-gray-400 font-mono text-center">
              Historical Rule: Buying Nifty below 19.0x P/E (-1 SD) generated &gt;18.4% 3-Year CAGR across all cycles since 2004.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* SUB-TAB 2: SECTOR FEAR VS GREED RADAR MATRIX */}
      {/* ========================================================================================= */}
      {activeSubTab === 'SECTOR_RADAR' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <span>Indian Sector Valuation & Sentiment Matrix</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Pinpoints which sectors are in Fear (Bargain Discounts to Accumulate) vs Euphoria (Overextended Premiums)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTOR_SENTIMENT_BREAKDOWN.map(item => {
                const isFear = item.sentiment === 'FEAR' || item.sentiment === 'EXTREME_FEAR';
                const isGreed = item.sentiment === 'GREED' || item.sentiment === 'EXTREME_GREED';
                return (
                  <div
                    key={item.sector}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121915]/60 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate" title={item.sector}>
                          {item.sector}
                        </h4>

                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0"
                          style={{
                            color: item.badgeColor,
                            backgroundColor: `${item.badgeColor}15`,
                            border: `1px solid ${item.badgeColor}30`
                          }}
                        >
                          {item.statusLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-white dark:bg-[#16211c] border border-gray-100 dark:border-gray-800 text-center text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-gray-400 block">P/E</span>
                          <span className="font-bold text-gray-900 dark:text-white">{item.pe}x</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">5Y Hist</span>
                          <span className="font-bold text-gray-500">{item.historicalPE}x</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Spread</span>
                          <span className={`font-bold ${item.discountOrPremium < 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {item.discountOrPremium > 0 ? '+' : ''}{item.discountOrPremium}%
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
                        {item.recommendedAction}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400">
                        {isFear ? '🟢 Buy Recommendation' : isGreed ? '🟡 Take Profit Caution' : '⚪ Hold Target'}
                      </span>

                      {isFear && (
                        <button
                          onClick={() => handleAddStock(item.sector.includes('Bank') ? 'HDFCBANK' : item.sector.includes('Pharma') ? 'SUNPHARMA' : 'TATAMOTORS', item.sector)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Watch Leader</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* SUB-TAB 3: MACRO VALUATION FRAMEWORK & FORMULAE */}
      {/* ========================================================================================= */}
      {activeSubTab === 'PILLARS_DEEP_DIVE' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                <span>Institutional Macro Valuation Framework & Mathematical Formulae</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Understand the quantitative mechanics powering the Indian Market Sentiment & Valuation Radar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#121915] border border-gray-200 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>1. Buffett Indicator (Market-Cap to GDP)</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Formula: <code className="px-1.5 py-0.5 rounded bg-white dark:bg-[#16211c] text-emerald-600 font-mono text-[11px]">{'[Total Market Cap (BSE + NSE) / Nominal Annual GDP] × 100'}</code>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Historical Indian benchmarks: &lt;80% (Substantially Undervalued / Heavy Buy), 80-95% (Fair Value Equilibrium), 95-115% (Modestly Overvalued), &gt;115% (Euphoric Bubble Risk).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#121915] border border-gray-200 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>2. Equity Risk Premium (ERP Spread)</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Formula: <code className="px-1.5 py-0.5 rounded bg-white dark:bg-[#16211c] text-blue-600 font-mono text-[11px]">{'ERP = [(1 / Nifty PE) × 100] - 10Y Indian G-Sec Yield'}</code>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Measures the earnings yield premium of equity vs risk-free government securities. When ERP is highly negative (&lt; -2.8%), bonds offer attractive risk-adjusted yields vs overextended equities.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#121915] border border-gray-200 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>3. India VIX (Implied Volatility Index)</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Computed by NSE using Black-Scholes implied volatilities of near and next-month out-of-the-money Nifty option contracts.
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  VIX &lt; 12 signals complacency / low hedging costs. VIX spikes &gt; 22 signal capitulation panic, which historically coincides with major market bottoms.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#121915] border border-gray-200 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>4. Statistical Trailing P/E Standard Deviation Bands</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Calculates 10-year rolling mean (Mean: 20.5x) and standard deviation (Std Dev: ±3.5x).
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Valuations mean-revert over 3-to-5 year horizons. Buying below -1 Standard Deviation (17.5x) minimizes downside drawdown risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
