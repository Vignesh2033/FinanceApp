import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  EquitySector,
  SectorBenchmarkModel,
  SectorAllocationItem,
  MacroCyclePhase
} from '../../types/finance';
import {
  PRESET_SECTOR_MODELS,
  SECTOR_COLORS,
  SECTOR_VALUATION_METRICS,
  MACRO_CYCLE_MODELS,
  STRESS_TEST_SCENARIOS,
  calculateSectorAllocations,
  calculateSectorRebalancingOrders,
  calculateSectorHealthScore,
  calculateStressTestImpact,
  generateSipRoadmap,
  generateBrokerBaskets
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
  Scale,
  Calendar,
  Activity,
  Copy,
  FileSpreadsheet,
  Gauge,
  Flame,
  ShieldAlert,
  ArrowRight,
  Landmark
} from 'lucide-react';

export const SectorBalancingView: React.FC = () => {
  const { profileAssets, currency, addToWatchlist, addSnapshot } = useFinance();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<
    'ALLOCATION' | 'VALUATION' | 'MACRO_CYCLE' | 'STRESS_TEST' | 'SIP_ROADMAP' | 'BROKER_BASKET'
  >('ALLOCATION');

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

  // Selected Macro Cycle
  const [selectedMacroCycle, setSelectedMacroCycle] = useState<MacroCyclePhase>('EARLY_CYCLE');

  // Selected Stress Test Scenario
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen-tech-crash');

  // SIP Roadmap Months
  const [sipRoadmapMonths, setSipRoadmapMonths] = useState<number>(4);
  const [monthlySipBudget, setMonthlySipBudget] = useState<string>('50000');

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

  // Stress test calculation
  const activeScenario = useMemo(() => {
    return STRESS_TEST_SCENARIOS.find(s => s.id === selectedScenarioId) || STRESS_TEST_SCENARIOS[0];
  }, [selectedScenarioId]);

  const stressTestResult = useMemo(() => {
    return calculateStressTestImpact(sectorData.items, sectorData.totalEquityValue, activeScenario);
  }, [sectorData, activeScenario]);

  // SIP Roadmap calculation
  const sipBudget = parseFloat(monthlySipBudget) || 50000;
  const sipRoadmap = useMemo(() => {
    return generateSipRoadmap(sectorData.items, sectorData.totalEquityValue, sipBudget, sipRoadmapMonths);
  }, [sectorData, sipBudget, sipRoadmapMonths]);

  // Broker Baskets calculation
  const brokerBaskets = useMemo(() => {
    return generateBrokerBaskets(rebalanceOrders);
  }, [rebalanceOrders]);

  // Custom slider weight updater
  const handleCustomSliderChange = (sector: EquitySector, val: number) => {
    setCustomWeights(prev => ({
      ...prev,
      [sector]: val
    }));
  };

  const customTotalPercentage = Object.values(customWeights).reduce((sum, v) => sum + v, 0);

  // Apply Macro Cycle Preset to Active Model
  const handleApplyMacroCycle = (phase: MacroCyclePhase) => {
    const cycleData = MACRO_CYCLE_MODELS[phase];
    setCustomWeights(cycleData.weights);
    setSelectedModelId('custom');
    setToastMessage(`Applied "${cycleData.name}" target weights!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy Zerodha Basket to Clipboard
  const handleCopyZerodhaBasket = () => {
    navigator.clipboard.writeText(brokerBaskets.zerodhaJson);
    setToastMessage('Copied Zerodha Kite Basket JSON to clipboard! Paste into Kite Basket Orders.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Download Groww CSV
  const handleDownloadGrowwCsv = () => {
    const blob = new Blob([brokerBaskets.growwCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Groww_Sector_Rebalance_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setToastMessage('Downloaded Groww CSV order file successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export Plan to Text Memo
  const handleExportMemo = () => {
    const activeModelName = selectedModelId === 'custom'
      ? 'Custom Portfolio Weights'
      : PRESET_SECTOR_MODELS.find(m => m.id === selectedModelId)?.name;

    let content = `====================================================\n`;
    content += `EQUITY SECTOR BALANCING & REBALANCING MEMO\n`;
    content += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    content += `Total Equity Portfolio Analyzed: ₹${sectorData.totalEquityValue.toLocaleString()}\n`;
    content += `Portfolio Weighted Beta: ${sectorData.portfolioWeightedBeta}x\n`;
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
                Institutional Suite
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Valuation Heatmaps, Macro Cycle Rotations, Stress-Testing, 4-Month DCA Roadmaps & Broker Baskets
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
            {profileAssets.filter(a => a.category === 'Equity' || a.category === 'Mutual Funds').length} active positions
          </p>
        </div>

        {/* Portfolio Beta */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center justify-between">
            <span>Portfolio Beta</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-1 flex items-baseline gap-2">
            <span>{sectorData.portfolioWeightedBeta}x</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
              sectorData.portfolioWeightedBeta > 1.15 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {sectorData.portfolioWeightedBeta > 1.15 ? 'Aggressive' : 'Balanced'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Weighted systemic volatility score
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
            <span>Diversification Score</span>
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

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#111713] border border-gray-200 dark:border-gray-800">
        {[
          { id: 'ALLOCATION', label: '📊 Allocation & Orders', icon: Layers },
          { id: 'VALUATION', label: '🔍 Valuation & P/E Heatmap', icon: Gauge },
          { id: 'MACRO_CYCLE', label: '🔄 Macro Business Cycle', icon: Sparkles },
          { id: 'STRESS_TEST', label: '💥 Stress-Test Simulator', icon: Flame },
          { id: 'SIP_ROADMAP', label: '📅 4-Month SIP Roadmap', icon: Calendar },
          { id: 'BROKER_BASKET', label: '🛒 Broker Baskets (Kite/Groww)', icon: FileSpreadsheet },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
      {/* TAB 1: ALLOCATION & SIMULATOR */}
      {/* ========================================================================================= */}
      {activeSubTab === 'ALLOCATION' && (
        <div className="space-y-6 animate-fade-in">
          {/* Preset Benchmark Model Selector */}
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

          {/* Visual Comparison Charts */}
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

          {/* Interactive Rebalancing Orders */}
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
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 2: VALUATION & PE HEATMAP */}
      {/* ========================================================================================= */}
      {activeSubTab === 'VALUATION' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-600" />
                <span>Sector Valuation & 5-Year Historical Discount/Premium Heatmap</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Identifies which sectors are historically undervalued (bargain accumulation zones) vs trading at heavy valuation premiums
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {sectorData.items.map(item => {
                const val = SECTOR_VALUATION_METRICS[item.sector];
                if (!val) return null;

                const isCheap = val.valuationStatus === 'CHEAP';
                const isExpensive = val.valuationStatus === 'EXPENSIVE';

                return (
                  <div
                    key={item.sector}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121915]/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate" title={item.sector}>
                            {item.sector}
                          </h4>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">
                          Beta: {val.beta}x · Div Yield: {val.dividendYield}%
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        isCheap ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        isExpensive ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {isCheap ? `🟢 ${Math.abs(val.discountPremiumPercent)}% Discount` :
                         isExpensive ? `🔴 +${val.discountPremiumPercent}% Premium` : '⚪ Fair Value'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-white dark:bg-[#16211c] border border-gray-100 dark:border-gray-800 text-center text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Current P/E</span>
                        <span className="font-bold text-gray-900 dark:text-white">{val.currentPE}x</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">5Y Hist P/E</span>
                        <span className="font-bold text-gray-500">{val.historical5YPE}x</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">ROE</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{val.roe}%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Catalyst: </span>
                      {val.catalyst}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 3: MACRO BUSINESS CYCLE NAVIGATOR */}
      {/* ========================================================================================= */}
      {activeSubTab === 'MACRO_CYCLE' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Macro Business Cycle & Sector Rotation Navigator</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Based on the Fidelity Global Business Cycle model. Align your target allocations with current economic expansion or contraction phases.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(MACRO_CYCLE_MODELS) as MacroCyclePhase[]).map(phase => {
                const cycle = MACRO_CYCLE_MODELS[phase];
                const isSelected = selectedMacroCycle === phase;
                return (
                  <div
                    key={phase}
                    onClick={() => setSelectedMacroCycle(phase)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-sm ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121915]/50 hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#16211c] text-emerald-800 dark:text-emerald-300 border border-gray-200 dark:border-gray-700">
                        {cycle.badge}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                        {cycle.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {cycle.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono block">
                        Favored Sectors:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cycle.topFavoredSectors.map(s => (
                          <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#16211c] text-gray-700 dark:text-gray-300">
                            {s.split(' ')[0]}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyMacroCycle(phase);
                        }}
                        className="w-full py-1.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 mt-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Apply Cycle Target</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 4: STRESS-TESTING SIMULATOR */}
      {/* ========================================================================================= */}
      {activeSubTab === 'STRESS_TEST' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>Sector Black Swan & Macro Stress-Test Simulator</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Simulates real-world market shocks and calculates the exact rupee P&L impact on your current holdings
              </p>
            </div>

            {/* Scenario Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STRESS_TEST_SCENARIOS.map(scen => {
                const isSelected = selectedScenarioId === scen.id;
                return (
                  <div
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-1 ring-rose-500/60 shadow-xs'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121915]/50 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">{scen.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {scen.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Stress Test P&L Result Banner */}
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              stressTestResult.totalPnL >= 0
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono">
                  Simulated Scenario Portfolio P&L Impact
                </span>
                <div className="text-2xl font-bold font-mono">
                  <span className={stressTestResult.totalPnL >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                    {stressTestResult.totalPnL >= 0 ? '+' : ''}₹{stressTestResult.totalPnL.toLocaleString()} ({stressTestResult.totalPnLPercent}%)
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  Projected Portfolio Value: ₹{stressTestResult.newTotalValue.toLocaleString()} (from ₹{sectorData.totalEquityValue.toLocaleString()})
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#16211c] border border-gray-200 dark:border-gray-800">
                  {stressTestResult.totalPnL >= 0 ? '🟢 Net Positive Resilience' : '🔴 Drawdown Vulnerable'}
                </span>
              </div>
            </div>

            {/* Sector Impact Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Sector</th>
                    <th className="pb-2 font-semibold">Current Value</th>
                    <th className="pb-2 font-semibold">Shock %</th>
                    <th className="pb-2 font-semibold">Simulated P&L (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {stressTestResult.sectorImpacts.map(impact => (
                    <tr key={impact.sector}>
                      <td className="py-2.5 font-bold text-gray-900 dark:text-white">{impact.sector}</td>
                      <td className="py-2.5 font-mono text-gray-500">
                        ₹{(sectorData.items.find(i => i.sector === impact.sector)?.value || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono font-bold">
                        <span className={impact.shockPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {impact.shockPercent >= 0 ? `+${impact.shockPercent}%` : `${impact.shockPercent}%`}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono font-bold">
                        <span className={impact.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {impact.pnl >= 0 ? `+₹${impact.pnl.toLocaleString()}` : `-₹${Math.abs(impact.pnl).toLocaleString()}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 5: 4-MONTH SIP ROADMAP */}
      {/* ========================================================================================= */}
      {activeSubTab === 'SIP_ROADMAP' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>Disciplined 4-Month DCA / SIP Rebalancing Roadmap</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Phased dollar-cost averaging tranches to systematically eliminate sector deficits without timing the market
                </p>
              </div>

              {/* Monthly Budget Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 font-mono">Monthly SIP:</label>
                <input
                  type="number"
                  step="10000"
                  value={monthlySipBudget}
                  onChange={(e) => setMonthlySipBudget(e.target.value)}
                  className="w-28 h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121915] font-mono text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Monthly Tranche Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sipRoadmap.map(plan => (
                <div key={plan.month} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121915]/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800 pb-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                      {plan.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                      ₹{plan.monthlyAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {plan.sectorAllocations.map(alloc => (
                      <div key={alloc.sector} className="p-2.5 rounded-xl bg-white dark:bg-[#16211c] border border-gray-100 dark:border-gray-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900 dark:text-white truncate" title={alloc.sector}>
                            {alloc.sector.split(' ')[0]}
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{alloc.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono">
                          Buy: {alloc.suggestedStocks.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 6: BROKER BASKETS (KITE & GROWW) */}
      {/* ========================================================================================= */}
      {activeSubTab === 'BROKER_BASKET' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>1-Click Broker Basket Orders (Zerodha Kite & Groww)</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Automatically formats all calculated rebalancing orders into ready-to-execute broker payloads
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Zerodha Kite Basket Payload */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121915]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Zerodha Kite Basket JSON</span>
                  </span>
                  <button
                    onClick={handleCopyZerodhaBasket}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={brokerBaskets.zerodhaJson}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16211c] font-mono text-[11px] text-gray-700 dark:text-gray-300 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400">
                  Tip: In Zerodha Kite $\to$ Orders $\to$ Baskets $\to$ Paste this JSON to execute in 1 click.
                </p>
              </div>

              {/* Groww Order CSV */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121915]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                    <span>Groww / Indmoney CSV Order File</span>
                  </span>
                  <button
                    onClick={handleDownloadGrowwCsv}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={brokerBaskets.growwCsv}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16211c] font-mono text-[11px] text-gray-700 dark:text-gray-300 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400">
                  Tip: Upload this CSV into Groww or Indmoney to trigger bulk execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
