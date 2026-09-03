import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  EquitySector,
  SectorBenchmarkModel,
  SectorAllocationItem
} from '../../types/finance';
import {
  PRESET_SECTOR_MODELS,
  SECTOR_COLORS,
  calculateSectorAllocations,
  calculateSectorRebalancingOrders,
  calculateSectorHealthScore
} from '../../utils/sectorBalancingService';
import { PrivacyValue } from '../common/PrivacyValue';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  PieChart as PieIcon,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Download,
  Plus,
  CheckCircle2,
  DollarSign,
  Layers,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Scale
} from 'lucide-react';

export const SectorBalancingView: React.FC = () => {
  const { profileAssets, currency, addToWatchlist, addSnapshot } = useFinance();

  // Selected Benchmark Model
  const [selectedModelId, setSelectedModelId] = useState<string>('model-optimal-alpha');
  const [customWeights, setCustomWeights] = useState<Record<EquitySector, number>>(
    PRESET_SECTOR_MODELS[0].weights
  );

  // Rebalancing Simulation Mode & Fresh Cash
  const [rebalanceMode, setRebalanceMode] = useState<'CASH_INJECTION' | 'FULL_REBALANCE'>('CASH_INJECTION');
  const [freshCapitalInput, setFreshCapitalInput] = useState<string>('100000');
  const [showCustomSliders, setShowCustomSliders] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active target weights based on selected model
  const activeTargetWeights = useMemo(() => {
    if (selectedModelId === 'custom') {
      return customWeights;
    }
    const model = PRESET_SECTOR_MODELS.find(m => m.id === selectedModelId);
    return model ? model.weights : PRESET_SECTOR_MODELS[0].weights;
  }, [selectedModelId, customWeights]);

  // Compute sector allocations
  const sectorData = useMemo(() => {
    return calculateSectorAllocations(profileAssets, activeTargetWeights);
  }, [profileAssets, activeTargetWeights]);

  // Compute health score
  const health = useMemo(() => {
    return calculateSectorHealthScore(sectorData.items, sectorData.maxConcentrationPercent);
  }, [sectorData]);

  // Compute rebalancing trade orders
  const freshCapital = parseFloat(freshCapitalInput) || 0;
  const rebalanceOrders = useMemo(() => {
    return calculateSectorRebalancingOrders(
      sectorData.items,
      sectorData.totalEquityValue,
      freshCapital,
      rebalanceMode
    );
  }, [sectorData, freshCapital, rebalanceMode]);

  // Custom slider weight updater
  const handleCustomSliderChange = (sector: EquitySector, val: number) => {
    setCustomWeights(prev => ({
      ...prev,
      [sector]: val
    }));
  };

  const customTotalPercentage = Object.values(customWeights).reduce((sum, v) => sum + v, 0);

  // Export Plan to Text Memo
  const handleExportMemo = () => {
    const activeModelName = selectedModelId === 'custom'
      ? 'Custom Portfolio Weights'
      : PRESET_SECTOR_MODELS.find(m => m.id === selectedModelId)?.name;

    let content = `====================================================\n`;
    content += `EQUITY SECTOR BALANCING & REBALANCING MEMO\n`;
    content += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    content += `Total Equity Portfolio Analyzed: ₹${sectorData.totalEquityValue.toLocaleString()}\n`;
    content += `Target Sector Model: ${activeModelName}\n`;
    content += `Diversification Health Score: ${health.score}/100 (${health.label})\n`;
    content += `====================================================\n\n`;

    content += `1. CURRENT SECTOR BREAKDOWN VS TARGET:\n`;
    sectorData.items.forEach(item => {
      content += `• ${item.sector.padEnd(30)} Current: ${String(item.percentage).padStart(5)}% (₹${item.value.toLocaleString()}) | Target: ${String(item.targetPercentage).padStart(4)}% | Drift: ${item.driftPercent > 0 ? '+' : ''}${item.driftPercent}% [${item.driftStatus}]\n`;
    });

    content += `\n2. REBALANCING ORDERS (${rebalanceMode === 'CASH_INJECTION' ? 'Smart Cash Injection - Buy Only' : 'Full Sector Realignment'}):\n`;
    if (rebalanceMode === 'CASH_INJECTION') {
      content += `Fresh Capital Injected: ₹${freshCapital.toLocaleString()}\n`;
    }
    rebalanceOrders.forEach((order, idx) => {
      content += `[${idx + 1}] ${order.action} ₹${order.amount.toLocaleString()} into ${order.sector}\n`;
      content += `    Suggested Tickers: ${order.suggestedStocks.join(', ')}\n`;
      content += `    Rationale: ${order.rationale}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sector_Rebalancing_Plan_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();

    setToastMessage('Exported Sector Rebalancing Memo successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add stock to watchlist helper
  const handleAddStock = (symbol: string, name: string, sector: string) => {
    const isUsStock = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'TSLA', 'GOOGL'].includes(symbol);
    addToWatchlist({
      id: `wl-${Date.now()}-${symbol}`,
      symbol,
      name,
      exchange: isUsStock ? 'NASDAQ' : 'NSE',
      currentPrice: 0,
      change: 0,
      changePercent: 0,
      dayHigh: 0,
      dayLow: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      sector,
      currency: isUsStock ? 'USD' : 'INR',
      sparkline: [100, 102, 101, 104, 103, 105],
      addedAt: new Date().toISOString().split('T')[0]
    });
    setToastMessage(`Added ${symbol} to your Stock Watchlist under "${sector}"!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Chart Data Preparation
  const chartData = sectorData.items.map(item => ({
    sector: item.sector.replace('Information Technology', 'IT').replace('Telecommunications', 'Telecom'),
    fullName: item.sector,
    Current: item.percentage,
    Target: item.targetPercentage,
    value: item.value,
    color: item.color
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-900/10 via-white to-gray-50 dark:from-[#131d17] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C6E49] to-teal-800 flex items-center justify-center text-white font-bold shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
                Equity Sector Balancing & Optimization
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                10 Core Sectors
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Analyze stock concentration, benchmark against index weights, and simulate zero-tax smart SIP rebalancing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportMemo}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161f1a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Action Memo</span>
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

      {/* 2. Top Diagnostic Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity Analyzed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center justify-between">
            <span>Total Equity Holdings</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-1">
            <PrivacyValue amountInINR={sectorData.totalEquityValue} />
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {profileAssets.filter(a => a.category === 'Equity' || a.category === 'Mutual Funds').length} active stock & fund positions
          </p>
        </div>

        {/* Active Sectors */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center justify-between">
            <span>Sector Breadth</span>
            <PieIcon className="w-4 h-4 text-blue-500" />
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-1">
            {sectorData.activeSectorsCount} <span className="text-sm font-normal text-gray-400">/ 10 Sectors</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {10 - sectorData.activeSectorsCount} sectors have 0% exposure
          </p>
        </div>

        {/* Max Concentration */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center justify-between">
            <span>Peak Concentration</span>
            <AlertTriangle className={`w-4 h-4 ${sectorData.maxConcentrationPercent > 35 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-1 flex items-baseline gap-2">
            <span>{sectorData.maxConcentrationPercent}%</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
              {sectorData.maxConcentratedSector.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {sectorData.maxConcentrationPercent > 30 ? '⚠️ High sector concentration' : 'Balanced concentration'}
          </p>
        </div>

        {/* Health Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center justify-between">
            <span>Sector Health Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-1 flex items-baseline gap-2">
            <span>{health.score}</span>
            <span className="text-xs font-mono text-gray-400">/ 100</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              health.label === 'Optimal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
              health.label === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
              'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {health.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 truncate" title={health.summary}>
            {health.summary}
          </p>
        </div>
      </div>

      {/* 3. Preset Benchmark Model Selector */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Select Strategic Sector Allocation Model</span>
          </label>

          <button
            onClick={() => setShowCustomSliders(!showCustomSliders)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showCustomSliders ? 'Hide Custom Sliders' : 'Customize Target Sliders'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_SECTOR_MODELS.map(model => {
            const isSelected = selectedModelId === model.id && !showCustomSliders;
            return (
              <div
                key={model.id}
                onClick={() => {
                  setSelectedModelId(model.id);
                  setShowCustomSliders(false);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/50'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161f1a]/50 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center justify-between">
                  <span>{model.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {model.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Custom Sliders Panel */}
        {showCustomSliders && (
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#111614] border border-gray-200 dark:border-gray-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Custom Sector Percentage Weights
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                customTotalPercentage === 100
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                Total: {customTotalPercentage}% {customTotalPercentage === 100 ? '✅ Valid' : '⚠️ Must sum to 100%'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectorData.items.map(item => (
                <div key={item.sector} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300 text-[11px] font-semibold truncate" title={item.sector}>
                      {item.sector}
                    </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {customWeights[item.sector] ?? 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={customWeights[item.sector] ?? 0}
                    onChange={(e) => {
                      setSelectedModelId('custom');
                      handleCustomSliderChange(item.sector, parseInt(e.target.value, 10));
                    }}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Visual Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Side-by-Side Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Current Allocation % vs Target Model %</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Hover bars to inspect drift
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="sector"
                  tick={{ fill: '#888', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const drift = (data.Current - data.Target).toFixed(1);
                      return (
                        <div className="p-3 rounded-xl bg-gray-900/95 text-white text-xs space-y-1 shadow-lg border border-gray-800">
                          <p className="font-bold text-emerald-400">{data.fullName}</p>
                          <p>Current: <span className="font-mono font-bold">{data.Current}%</span> (₹{data.value.toLocaleString()})</p>
                          <p>Target: <span className="font-mono font-bold">{data.Target}%</span></p>
                          <p>
                            Drift: <span className={`font-mono font-bold ${Number(drift) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {Number(drift) > 0 ? `+${drift}% (Overweight)` : `${drift}% (Underweight)`}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Current" fill="#2C6E49" radius={[6, 6, 0, 0]} name="Current %" />
                <Bar dataKey="Target" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Target %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Allocation Balance Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm font-display flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-500" />
              <span>Multi-Axis Sector Radar</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="sector" tick={{ fill: '#888', fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 45]} tick={{ fontSize: 8 }} />
                <Radar name="Current" dataKey="Current" stroke="#2C6E49" fill="#2C6E49" fillOpacity={0.4} />
                <Radar name="Target" dataKey="Target" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-gray-400 text-center font-mono">
            Green = Current Portfolio · Blue = Target Allocation
          </p>
        </div>
      </div>

      {/* 5. Interactive Rebalancing Simulator */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 dark:from-[#141a17] dark:via-[#16211c] dark:to-[#0f1714] border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/70 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>Actionable Rebalancing Execution Orders</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Choose between tax-free cash SIP injection or full portfolio realignment
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#101713] border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setRebalanceMode('CASH_INJECTION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rebalanceMode === 'CASH_INJECTION'
                  ? 'bg-[#2C6E49] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              🌟 Smart Cash Injection (Zero Tax)
            </button>
            <button
              onClick={() => setRebalanceMode('FULL_REBALANCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rebalanceMode === 'FULL_REBALANCE'
                  ? 'bg-[#2C6E49] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              ⚖️ Full Realignment (Buy/Sell)
            </button>
          </div>
        </div>

        {/* Cash Injection Input when Mode A */}
        {rebalanceMode === 'CASH_INJECTION' && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121915] border border-emerald-300/70 dark:border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Monthly SIP / Fresh Capital to Deploy (₹)</span>
              </label>
              <p className="text-[11px] text-gray-500">
                100% of this amount is algorithmically routed to underweight sectors with ZERO tax drag.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="5000"
                value={freshCapitalInput}
                onChange={(e) => setFreshCapitalInput(e.target.value)}
                className="w-36 h-10 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-[#18231e] font-mono text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Quick Chips */}
              <div className="hidden sm:flex items-center gap-1">
                {['50000', '100000', '250000'].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFreshCapitalInput(amt)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                  >
                    ₹{parseInt(amt, 10) / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Orders List */}
        <div className="space-y-2.5">
          {rebalanceOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-gray-50 dark:bg-[#121915] border border-gray-200 dark:border-gray-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">Portfolio Is Perfectly Balanced!</p>
              <p className="text-xs text-gray-500 mt-0.5">All sectors are within your target allocation bands.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121915] overflow-hidden">
              {rebalanceOrders.map((order, idx) => {
                const isBuy = order.action === 'BUY';
                return (
                  <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/60 dark:hover:bg-[#16201b] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isBuy ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isBuy ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isBuy ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            {order.action}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white font-display">
                            {order.sector}
                          </span>
                          <span className="text-xs font-mono text-gray-400">
                            ({order.currentPercent}% $\to$ {order.targetPercent}%)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.rationale}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pl-10 md:pl-0">
                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-gray-900 dark:text-white">
                          ₹{order.amount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          Suggested: {order.suggestedStocks.join(', ')}
                        </div>
                      </div>

                      {isBuy && order.suggestedStocks.length > 0 && (
                        <button
                          onClick={() => handleAddStock(order.suggestedStocks[0], `${order.suggestedStocks[0]} Ltd`, order.sector)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          title="Add recommended leader to watchlist"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Watch {order.suggestedStocks[0]}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6. Sector Drift & Stock Recommendations Matrix */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>10-Sector Breakdown & High-Conviction Stock Ideas</span>
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            Click "+ Watch" to track high-conviction ideas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Sector</th>
                <th className="pb-3 font-semibold">Current Value</th>
                <th className="pb-3 font-semibold">Current %</th>
                <th className="pb-3 font-semibold">Target %</th>
                <th className="pb-3 font-semibold">Drift %</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Recommended Leaders to Add</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {sectorData.items.map(item => {
                const isOver = item.driftStatus === 'OVERWEIGHT';
                const isUnder = item.driftStatus === 'UNDERWEIGHT';

                return (
                  <tr key={item.sector} className="hover:bg-gray-50/60 dark:hover:bg-[#161f1a]/60 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.sector}</span>
                      </div>
                      {item.holdings.length > 0 && (
                        <p className="text-[10px] text-gray-400 pl-4.5 mt-0.5 truncate max-w-xs">
                          Holdings: {item.holdings.map(h => `${h.name} (${h.percentageOfSector}%)`).join(', ')}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 pr-3 font-mono font-bold text-gray-900 dark:text-white">
                      <PrivacyValue amountInINR={item.value} />
                    </td>

                    <td className="py-3.5 pr-3 font-mono font-bold text-gray-900 dark:text-white">
                      {item.percentage}%
                    </td>

                    <td className="py-3.5 pr-3 font-mono text-gray-500 dark:text-gray-400">
                      {item.targetPercentage}%
                    </td>

                    <td className="py-3.5 pr-3 font-mono font-bold">
                      <span className={isOver ? 'text-amber-500' : isUnder ? 'text-emerald-500' : 'text-gray-400'}>
                        {item.driftPercent > 0 ? `+${item.driftPercent}%` : `${item.driftPercent}%`}
                      </span>
                    </td>

                    <td className="py-3.5 pr-3">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        isOver ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' :
                        isUnder ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                        {item.driftStatus}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {item.recommendedStocks.map(stock => (
                          <div
                            key={stock.symbol}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-[11px]"
                          >
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{stock.symbol}</span>
                            {stock.peRatio && (
                              <span className="text-[10px] text-gray-400 font-mono">({stock.peRatio}x P/E)</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAddStock(stock.symbol, stock.name, item.sector)}
                              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer pl-0.5"
                              title={`Add ${stock.name} to Watchlist (${stock.rationale})`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
