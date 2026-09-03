import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { WatchlistItem, WatchlistPeer, ShareholdingQuarter } from '../../types/finance';
import {
  getSectorPeers,
  getShareholdingTrend,
  getCompanyShareholding,
  getFinancialStatements,
  getAIBullBear,
  getAnalystConsensus,
  calculateVolumeMultiple,
  fetchStockInfoFromOnline
} from '../../utils/stockService';
import { SetStockAlertModal } from './SetStockAlertModal';
import { CreateWatchlistModal } from './CreateWatchlistModal';
import { MarketTickerTape } from '../common/MarketTickerTape';
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Trash2,
  ShoppingBag,
  ExternalLink,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Bell,
  Sparkles,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  Zap,
  BarChart3,
  Users,
  Activity,
  Calculator,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  Bot,
  PieChart,
  FolderPlus,
  Download,
  AlertTriangle,
  Coins,
  FileText,
  Target,
  Table as TableIcon,
  Layout,
  X,
  Scale,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WatchlistViewProps {
  onOpenAddStock: () => void;
  onOpenDetailModal?: (stock: WatchlistItem) => void;
  onOpenBuyModal: (stock: WatchlistItem) => void;
}

type DetailTab = 'overview' | 'financials' | 'shareholding' | 'peers' | 'ai_sentiment' | 'sip';
type ViewMode = 'terminal' | 'screener_table';

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  onOpenAddStock,
  onOpenBuyModal
}) => {
  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    refreshWatchlistQuotes,
    watchlistFolders,
    activeFolderId,
    setActiveFolderId,
    deleteWatchlistFolder,
    toggleStockInFolder,
    stockAlerts,
    clearTriggeredAlerts,
    currency,
    isPrivacyMode
  } = useFinance();

  const [selectedStockId, setSelectedStockId] = useState<string>(() => {
    return watchlist[0]?.id || '';
  });

  const [viewMode, setViewMode] = useState<ViewMode>('terminal');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'change_desc' | 'change_asc' | 'pe_asc' | 'de_asc' | 'roe_desc' | 'div_desc' | 'price' | 'name'>('change_desc');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1M');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Live');

  // Modals state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  // SIP Calculator State
  const [sipMonthlyAmount, setSipMonthlyAmount] = useState<number>(10000);
  const [sipYears, setSipYears] = useState<number>(3);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWatchlistQuotes();
    setIsRefreshing(false);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  // Fetch latest quotes once on mount
  useEffect(() => {
    refreshWatchlistQuotes();
    const interval = setInterval(() => {
      refreshWatchlistQuotes();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter by Active Folder first
  const activeFolder = watchlistFolders.find(f => f.id === activeFolderId) || watchlistFolders[0];
  const folderWatchlist = (activeFolder && !activeFolder.isDefault)
    ? watchlist.filter(w => activeFolder.stockIds.includes(w.id))
    : watchlist;

  // Filter and Sort
  const filteredWatchlist = folderWatchlist
    .filter(item => {
      const matchesExchange =
        selectedExchange === 'ALL' ||
        (selectedExchange === 'NSE' && (item.exchange === 'NSE' || item.exchange === 'BSE')) ||
        (selectedExchange === 'US' && (item.exchange === 'NASDAQ' || item.exchange === 'NYSE')) ||
        (selectedExchange === 'ETF' && (item.sector.includes('ETF') || item.sector.includes('SGB') || item.sector.includes('Precious Metals'))) ||
        (selectedExchange === 'CRYPTO' && item.exchange === 'CRYPTO');

      const matchesSearch =
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesExchange && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'change_desc') return b.changePercent - a.changePercent;
      if (sortBy === 'change_asc') return a.changePercent - b.changePercent;
      if (sortBy === 'pe_asc') return (a.peRatio || 999) - (b.peRatio || 999);
      if (sortBy === 'de_asc') return (a.debtToEquity ?? 999) - (b.debtToEquity ?? 999);
      if (sortBy === 'roe_desc') return (b.roe || 0) - (a.roe || 0);
      if (sortBy === 'div_desc') return (b.dividendYield || 0) - (a.dividendYield || 0);
      if (sortBy === 'price') return b.currentPrice - a.currentPrice;
      if (sortBy === 'name') return a.symbol.localeCompare(b.symbol);
      return 0;
    });

  // Ensure a selected stock is always active
  useEffect(() => {
    if (!selectedStockId && filteredWatchlist.length > 0) {
      setSelectedStockId(filteredWatchlist[0].id);
    } else if (selectedStockId && !filteredWatchlist.some(w => w.id === selectedStockId) && filteredWatchlist.length > 0) {
      setSelectedStockId(filteredWatchlist[0].id);
    }
  }, [filteredWatchlist, selectedStockId]);

  // Selected Stock for Full Inline Analytics
  const activeStock = watchlist.find(w => w.id === selectedStockId) || filteredWatchlist[0] || watchlist[0];

  // Stats calculation
  const gainersCount = filteredWatchlist.filter(w => w.changePercent > 0).length;
  const losersCount = filteredWatchlist.filter(w => w.changePercent < 0).length;
  const peFiltered = filteredWatchlist.filter(w => w.peRatio && w.peRatio > 0);
  const avgPe = peFiltered.length > 0
    ? Math.round((peFiltered.reduce((sum, w) => sum + (w.peRatio || 0), 0) / peFiltered.length) * 10) / 10
    : 22.4;

  // Active Stock Calculations
  const isPositive = (activeStock?.change || 0) >= 0;
  const timeframePrices = activeStock?.timeframes?.[selectedTimeframe] || activeStock?.sparkline || [100, 105];
  const chartData = timeframePrices.map((val, idx) => ({
    time: `P${idx + 1}`,
    price: val
  }));

  const range52 = activeStock ? activeStock.fiftyTwoWeekHigh - activeStock.fiftyTwoWeekLow : 0;
  const currentPos = range52 > 0 && activeStock ? ((activeStock.currentPrice - activeStock.fiftyTwoWeekLow) / range52) * 100 : 50;

  // SIP Math for Active Stock
  const totalMonths = sipYears * 12;
  const totalSipInvested = sipMonthlyAmount * totalMonths;
  const estCagr = activeStock?.exchange === 'CRYPTO' ? 25 : (activeStock?.roe || 16) > 20 ? 16 : 13;
  const monthlyRate = estCagr / 100 / 12;
  const futureSipValue = sipMonthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  const estimatedWealthGain = futureSipValue - totalSipInvested;

  // Sector Peers
  const peersList: WatchlistPeer[] = activeStock
    ? (activeStock.peers && activeStock.peers.length > 0
        ? activeStock.peers
        : getSectorPeers(activeStock.symbol, activeStock.sector))
    : [];

  // Shareholding Data for Active Stock
  const currentHoldingData = activeStock
    ? getCompanyShareholding(activeStock.symbol, activeStock.currency === 'USD')
    : { promoterHolding: 50.3, promoterPledge: 0.0, fiiHolding: 22.4, diiHolding: 16.8, publicHolding: 10.5, trend: [] };

  const promoterVal = activeStock?.promoterHolding !== undefined ? activeStock.promoterHolding : currentHoldingData.promoterHolding;
  const fiiVal = activeStock?.fiiHolding !== undefined ? activeStock.fiiHolding : currentHoldingData.fiiHolding;
  const diiVal = activeStock?.diiHolding !== undefined ? activeStock.diiHolding : currentHoldingData.diiHolding;
  const publicVal = activeStock?.publicHolding !== undefined ? activeStock.publicHolding : currentHoldingData.publicHolding;
  const pledgeVal = activeStock?.promoterPledge !== undefined ? activeStock.promoterPledge : currentHoldingData.promoterPledge;

  // Shareholding Trend (4 Quarters)
  const shareholdingTrendData: ShareholdingQuarter[] = (activeStock?.shareholdingTrend && activeStock.shareholdingTrend.length > 0)
    ? activeStock.shareholdingTrend
    : currentHoldingData.trend;

  // 3-Year Financial Statements
  const financialStatements = activeStock
    ? (activeStock.financialStatements || getFinancialStatements(activeStock.symbol, activeStock.currentPrice, activeStock.currency === 'USD'))
    : null;

  const financialChartData = financialStatements?.years.map((year, i) => ({
    year,
    Revenue: financialStatements.revenue[i],
    NetProfit: financialStatements.netProfit[i]
  })) || [];

  // AI Bull / Bear & Consensus
  const aiAnalysis = activeStock
    ? (activeStock.aiBullBear || getAIBullBear(activeStock.symbol, activeStock.sector, activeStock.changePercent))
    : null;

  const consensus = activeStock
    ? (activeStock.analystConsensus || getAnalystConsensus(activeStock.symbol, activeStock.currentPrice))
    : null;

  // Active Alerts for selected stock
  const activeStockAlerts = activeStock
    ? stockAlerts.filter(a => a.stockId === activeStock.id || a.symbol.toUpperCase() === activeStock.symbol.toUpperCase())
    : [];

  const triggeredAlerts = stockAlerts.filter(a => a.isTriggered);

  // Company Badge Colors
  const getCompanyBadgeColor = (symbol: string) => {
    const clean = symbol.toUpperCase().replace('.NS', '').replace('.BO', '');
    if (['BTC-USD', 'ETH-USD', 'SOL-USD'].includes(clean)) return 'from-amber-500 to-orange-600 text-white shadow-amber-500/20';
    if (['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'AMD'].includes(clean)) return 'from-indigo-600 to-blue-600 text-white shadow-indigo-500/20';
    if (['RELIANCE', 'LT', 'ONGC', 'IOC'].includes(clean)) return 'from-emerald-600 to-teal-700 text-white shadow-emerald-500/20';
    if (['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'BAJFINANCE'].includes(clean)) return 'from-blue-600 to-cyan-700 text-white shadow-blue-500/20';
    if (['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM'].includes(clean)) return 'from-purple-600 to-indigo-700 text-white shadow-purple-500/20';
    if (['ITC', 'HINDUNILVR', 'NESTLEIND', 'TITAN'].includes(clean)) return 'from-rose-600 to-pink-700 text-white shadow-rose-500/20';
    return 'from-[#2C6E49] to-emerald-700 text-white shadow-emerald-500/20';
  };

  const getCompanyInitial = (symbol: string) => {
    if (symbol.startsWith('BTC')) return '₿';
    if (symbol.startsWith('ETH')) return 'Ξ';
    if (symbol.startsWith('SOL')) return '◎';
    return symbol.charAt(0).toUpperCase();
  };

  // Helper for Debt/Equity status badge
  const getDebtStatusBadge = (de?: number) => {
    if (de === undefined) return null;
    if (de === 0) return <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold font-mono border border-emerald-200/60 dark:border-emerald-800/60">Zero Debt</span>;
    if (de < 0.5) return <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold font-mono border border-emerald-200/60 dark:border-emerald-800/60">Low D/E {de}x</span>;
    if (de <= 1.5) return <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold font-mono border border-amber-200/60 dark:border-amber-800/60">Mod D/E {de}x</span>;
    return <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold font-mono border border-rose-200/60 dark:border-rose-800/60">High D/E {de}x</span>;
  };

  // Export Stock Report Memo
  const handleExportMemo = () => {
    if (!activeStock) return;
    const memoContent = `
=====================================================
PERSONALPORTFOLIOAPP · EQUITY RESEARCH MEMO
=====================================================
Security: ${activeStock.name} (${activeStock.symbol})
Exchange: ${activeStock.exchange} | Sector: ${activeStock.sector}
Last Traded Price: ${activeStock.currency === 'USD' ? '$' : '₹'}${activeStock.currentPrice} (${activeStock.changePercent >= 0 ? '+' : ''}${activeStock.changePercent}%)
Target Price: ${activeStock.currency === 'USD' ? '$' : '₹'}${activeStock.targetPrice || 'N/A'} (Consensus: ${activeStock.consensus || 'Buy'})
52-Week Range: ${activeStock.currency === 'USD' ? '$' : '₹'}${activeStock.fiftyTwoWeekLow} - ${activeStock.currency === 'USD' ? '$' : '₹'}${activeStock.fiftyTwoWeekHigh}

KEY FUNDAMENTAL RATIOS & VALUATION:
-----------------------------------------------------
- P/E Ratio (TTM): ${activeStock.peRatio ? `${activeStock.peRatio}x` : 'N/A'}
- Debt to Equity (D/E): ${activeStock.debtToEquity !== undefined ? `${activeStock.debtToEquity}x` : '0.25x'}
- Price to Book (P/B): ${activeStock.pbRatio ? `${activeStock.pbRatio}x` : '3.2x'}
- Return on Equity (ROE): ${activeStock.roe ? `${activeStock.roe}%` : '18.4%'}
- ROCE: ${activeStock.roce ? `${activeStock.roce}%` : '16.5%'}
- Dividend Yield: ${activeStock.dividendYield ? `${activeStock.dividendYield}%` : '0.8%'}
- Free Cash Flow: ${activeStock.freeCashFlow || '₹14,500 Cr'}
- Volume Multiplier: ${activeStock.volumeMultiple ?? calculateVolumeMultiple(activeStock.symbol, activeStock.changePercent)}x
- Beta: ${activeStock.beta || 0.95}

AI BULL CASE:
${aiAnalysis?.bullCase.map(b => `+ ${b}`).join('\n') || 'N/A'}

AI BEAR CASE / RISKS:
${aiAnalysis?.bearCase.map(b => `- ${b}`).join('\n') || 'N/A'}

Generated by PersonalPortfolioApp on ${new Date().toLocaleDateString()}
=====================================================
`;
    const blob = new Blob([memoContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeStock.symbol}_Research_Memo.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Live Benchmark Indices Ticker Tape */}
      <MarketTickerTape />

      {/* Triggered Alerts Notification Banner */}
      {triggeredAlerts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-900 dark:text-amber-200">
            <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>
              <strong>🔔 {triggeredAlerts.length} Stock Alert(s) Triggered:</strong>{' '}
              {triggeredAlerts.map(a => `${a.symbol} (${a.condition.replace('_', ' ')})`).join(', ')}
            </span>
          </div>
          <button
            onClick={clearTriggeredAlerts}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-200 cursor-pointer"
          >
            Dismiss All
          </button>
        </div>
      )}

      {/* Top Header & Market Breadth Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/10 via-white to-gray-50 dark:from-[#111914] dark:via-[#141b17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#2C6E49] to-emerald-800 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight flex items-center gap-2">
                <span>Stock Watchlist & Analytics Terminal</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  LIVE
                </span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                <span>{filteredWatchlist.length} Securities</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">🟢 {gainersCount} Up</span>
                <span className="text-rose-500 font-semibold">🔴 {losersCount} Down</span>
                <span>•</span>
                <span>Avg P/E: <strong>{avgPe}x</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* View Mode Toggle (Terminal vs Screener Table) */}
          <div className="flex items-center bg-gray-100/80 dark:bg-[#18201b] p-1 rounded-2xl border border-gray-200/80 dark:border-gray-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'terminal'
                  ? 'bg-white dark:bg-[#202c24] text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Split-Screen Terminal View"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Terminal</span>
            </button>
            <button
              onClick={() => setViewMode('screener_table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'screener_table'
                  ? 'bg-white dark:bg-[#202c24] text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Fundamental Screener Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Screener Table</span>
            </button>
          </div>

          {/* Refresh Quotes */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium border border-gray-200/80 dark:border-gray-700 bg-white dark:bg-[#161e1a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer"
            title="Refresh Quotes from Online Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Create Custom Folder */}
          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium border border-gray-200/80 dark:border-gray-700 bg-white dark:bg-[#161e1a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">New Watchlist</span>
          </button>

          {/* Add Stock */}
          <button
            onClick={onOpenAddStock}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#2C6E49] to-emerald-700 hover:from-[#23583a] hover:to-emerald-800 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Thematic Watchlist Folders Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {watchlistFolders.map(folder => {
          const isActive = activeFolderId === folder.id;
          const count = folder.isDefault ? watchlist.length : watchlist.filter(w => folder.stockIds.includes(w.id)).length;

          return (
            <button
              key={folder.id}
              onClick={() => setActiveFolderId(folder.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#2C6E49] text-white shadow-sm shadow-emerald-900/20'
                  : 'bg-white dark:bg-[#141a17] text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <span>{folder.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: FUNDAMENTAL SCREENER TABLE VIEW */}
      {viewMode === 'screener_table' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Filter and Sort Toolbar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by symbol, company, or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-[#18201b] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-[#18201b] text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="change_desc">Day Change (High to Low)</option>
                <option value="change_asc">Day Change (Low to High)</option>
                <option value="pe_asc">P/E Ratio (Lowest / Value First)</option>
                <option value="de_asc">Debt to Equity (Lowest Debt First)</option>
                <option value="roe_desc">ROE % (Highest First)</option>
                <option value="div_desc">Dividend Yield (Highest First)</option>
                <option value="price">Price (Highest First)</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Full Screener Table */}
          <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#141a17] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-[#18201b] text-gray-400">
                    <th className="py-3.5 px-4 font-semibold">Security</th>
                    <th className="py-3.5 px-3 font-semibold text-right">LTP Price</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Day Change %</th>
                    <th className="py-3.5 px-3 font-semibold text-right text-emerald-600 dark:text-emerald-400">P/E Ratio</th>
                    <th className="py-3.5 px-3 font-semibold text-right text-blue-600 dark:text-blue-400">Debt / Equity</th>
                    <th className="py-3.5 px-3 font-semibold text-right">P/B Ratio</th>
                    <th className="py-3.5 px-3 font-semibold text-right text-purple-600 dark:text-purple-400">ROE %</th>
                    <th className="py-3.5 px-3 font-semibold text-right text-amber-600 dark:text-amber-400">ROCE %</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Div Yield</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Market Cap</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Vol Multiplier</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {filteredWatchlist.map(stock => {
                    const itemPositive = stock.change >= 0;
                    const de = stock.debtToEquity ?? (stock.currency === 'USD' ? 0.18 : 0.35);
                    const volMult = stock.volumeMultiple ?? calculateVolumeMultiple(stock.symbol, stock.changePercent);

                    return (
                      <tr
                        key={stock.id}
                        className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${getCompanyBadgeColor(stock.symbol)} flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                              {getCompanyInitial(stock.symbol)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-display font-bold text-sm text-gray-900 dark:text-white">
                                  {stock.symbol}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono">
                                  {stock.exchange}
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-400 font-sans block truncate max-w-[170px]">
                                {stock.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold text-gray-900 dark:text-white">
                          {stock.currency === 'USD' ? '$' : '₹'}{stock.currentPrice.toLocaleString()}
                        </td>

                        <td className={`py-3.5 px-3 text-right font-bold ${
                          itemPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                        }`}>
                          {itemPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </td>

                        {/* P/E Ratio */}
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-300">
                          {stock.peRatio ? `${stock.peRatio}x` : 'N/A'}
                        </td>

                        {/* Debt to Equity */}
                        <td className="py-3.5 px-3 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded-md ${
                            de === 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : de <= 0.5
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : de <= 1.5
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {de}x
                          </span>
                        </td>

                        {/* P/B Ratio */}
                        <td className="py-3.5 px-3 text-right text-gray-700 dark:text-gray-300">
                          {stock.pbRatio ? `${stock.pbRatio}x` : '3.2x'}
                        </td>

                        {/* ROE % */}
                        <td className="py-3.5 px-3 text-right font-bold text-purple-700 dark:text-purple-300">
                          {stock.roe ? `${stock.roe}%` : '18.4%'}
                        </td>

                        {/* ROCE % */}
                        <td className="py-3.5 px-3 text-right font-bold text-amber-700 dark:text-amber-300">
                          {stock.roce ? `${stock.roce}%` : '16.5%'}
                        </td>

                        {/* Dividend Yield */}
                        <td className="py-3.5 px-3 text-right text-gray-700 dark:text-gray-300">
                          {stock.dividendYield ? `${stock.dividendYield}%` : '—'}
                        </td>

                        {/* Market Cap */}
                        <td className="py-3.5 px-3 text-right text-gray-700 dark:text-gray-300">
                          {stock.marketCap}
                        </td>

                        {/* Volume Multiplier */}
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ⚡ {volMult}x
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedStockId(stock.id);
                                setViewMode('terminal');
                              }}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#2C6E49] bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 cursor-pointer"
                              title="Open in Terminal"
                            >
                              Terminal →
                            </button>
                            <button
                              onClick={() => onOpenBuyModal(stock)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                              title="Add to Portfolio"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
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
      ) : (
        /* VIEW MODE 2: SPLIT SCREEN TERMINAL VIEW */
        watchlist.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-[#141a17]/50">
            <TrendingUp className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Your Watchlist is Empty
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Add Indian stocks (NSE), US tech giants, Gold ETFs, or Bitcoin to unlock the live analytics terminal.
            </p>
            <button
              onClick={onOpenAddStock}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Stock</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Watchlist Securities List (lg:col-span-4 xl:col-span-4) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-3">
              {/* Search & Category Filter */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in this list..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-[#18201b] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Exchange Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'NSE', label: 'NSE' },
                    { id: 'US', label: 'US Tech' },
                    { id: 'ETF', label: 'ETFs' },
                    { id: 'CRYPTO', label: 'Crypto' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedExchange(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedExchange === tab.id
                          ? 'bg-[#2C6E49] text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Securities List with Fundamental Ratios Tag Strips */}
              <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#141a17] divide-y divide-gray-100 dark:divide-gray-800/80 max-h-[680px] overflow-y-auto shadow-xs">
                {filteredWatchlist.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    No matching securities found
                  </div>
                ) : (
                  filteredWatchlist.map(stock => {
                    const isSelected = activeStock?.id === stock.id;
                    const itemPositive = stock.change >= 0;
                    const stockAlertCount = stockAlerts.filter(a => a.stockId === stock.id).length;
                    const de = stock.debtToEquity ?? (stock.currency === 'USD' ? 0.18 : 0.35);

                    return (
                      <div
                        key={stock.id}
                        onClick={() => setSelectedStockId(stock.id)}
                        className={`p-4 transition-all cursor-pointer space-y-2 relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-l-4 border-[#2C6E49]'
                            : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {/* Company Avatar Badge */}
                            <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${getCompanyBadgeColor(stock.symbol)} flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                              {getCompanyInitial(stock.symbol)}
                            </div>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-display font-bold text-sm text-gray-900 dark:text-white">
                                  {stock.symbol}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                                  {stock.exchange}
                                </span>
                                {stockAlertCount > 0 && (
                                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-0.5">
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>{stockAlertCount}</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {stock.name}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                              {stock.currency === 'USD' ? '$' : '₹'}{stock.currentPrice.toLocaleString()}
                            </div>
                            <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold mt-0.5 px-2 py-0.5 rounded-md ${
                              itemPositive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
                            }`}>
                              {itemPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        {/* Fundamental Ratios Tag Strip under each stock */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 font-mono text-[10px]">
                          {stock.peRatio && (
                            <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300">
                              P/E <strong>{stock.peRatio}x</strong>
                            </span>
                          )}
                          {getDebtStatusBadge(de)}
                          {stock.roe && (
                            <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                              ROE <strong>{stock.roe}%</strong>
                            </span>
                          )}
                          {stock.dividendYield ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                              Div <strong>{stock.dividendYield}%</strong>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Full Inline Stock Analytics Terminal (lg:col-span-8 xl:col-span-8) */}
            {activeStock && (
              <div className="lg:col-span-8 xl:col-span-8 space-y-4 animate-fade-in">
                
                {/* Hero Header & Quick Action Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Big Avatar */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getCompanyBadgeColor(activeStock.symbol)} flex items-center justify-center font-bold text-xl shadow-lg shrink-0`}>
                      {getCompanyInitial(activeStock.symbol)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
                          {activeStock.symbol}
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {activeStock.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold">
                          {activeStock.exchange}
                        </span>
                        {activeStock.consensus && (
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                            activeStock.consensus === 'Strong Buy' || activeStock.consensus === 'Buy'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {activeStock.consensus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        Sector: {activeStock.sector} · Target: {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.targetPrice || 'N/A'} (Upside: +{consensus?.upsidePercent || 18.5}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    {/* Set Alert Button */}
                    <button
                      onClick={() => setIsAlertModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18201b] text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
                      title="Set Technical / Price Alert"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Set Alert</span>
                      {activeStockAlerts.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                          {activeStockAlerts.length}
                        </span>
                      )}
                    </button>

                    {/* Export Research Memo */}
                    <button
                      onClick={handleExportMemo}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18201b] text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
                      title="Export Equity Memo"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Memo</span>
                    </button>

                    {/* Add to Portfolio */}
                    <button
                      onClick={() => onOpenBuyModal(activeStock)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#2C6E49] to-emerald-700 hover:from-[#23583a] hover:to-emerald-800 transition-all shadow-sm cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Portfolio</span>
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromWatchlist(activeStock.id)}
                      className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-2xl transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price & Interactive Chart Panel */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
                  {/* Price Bar & Timeframe Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80">
                    <div>
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                          {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.currentPrice.toLocaleString()}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                          isPositive
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {isPositive ? '+' : ''}{activeStock.change.toFixed(2)} ({isPositive ? '+' : ''}{activeStock.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        Day Range: {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.dayLow} – {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.dayHigh}
                      </p>
                    </div>

                    {/* Timeframe selector pills */}
                    <div className="flex items-center bg-gray-100 dark:bg-[#18201b] p-1 rounded-2xl text-xs font-mono">
                      {(['1D', '1W', '1M', '1Y', '5Y'] as const).map(tf => (
                        <button
                          key={tf}
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
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

                  {/* SVG Area Chart */}
                  <div className="h-[210px] w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="activeStockGrad" x1="0" y1="0" x2="0" y2="1">
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
                                <div className="p-2.5 rounded-2xl bg-gray-900 text-white text-xs font-mono shadow-xl border border-gray-700">
                                  {activeStock.currency === 'USD' ? '$' : '₹'}{payload[0].value}
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
                          fill="url(#activeStockGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 52-Week Range Bar */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80">
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="text-gray-400">52W Low: {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.fiftyTwoWeekLow}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">52-Week Range Position</span>
                      <span className="text-gray-400">52W High: {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.fiftyTwoWeekHigh}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-[#2C6E49] rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, currentPos))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* DEDICATED FUNDAMENTAL VALUATION & SOLVENCY MATRIX (8-Card Grid) */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Key Fundamental Ratios & Valuation Matrix</span>
                    </h3>
                    <span className="text-[11px] font-mono text-gray-400">
                      Market Cap: {activeStock.marketCap}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* P/E Ratio */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">P/E Ratio (TTM)</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                          {activeStock.peRatio ? `${activeStock.peRatio}x` : 'N/A'}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {activeStock.peRatio && activeStock.peRatio < 20 ? 'Value' : activeStock.peRatio && activeStock.peRatio < 35 ? 'Fair' : 'Growth'}
                        </span>
                      </div>
                    </div>

                    {/* Debt to Equity */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Debt to Equity</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-lg font-bold font-mono text-blue-700 dark:text-blue-300">
                          {activeStock.debtToEquity !== undefined ? `${activeStock.debtToEquity}x` : '0.25x'}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600">
                          {(activeStock.debtToEquity ?? 0.25) <= 0.5 ? 'Low Debt' : (activeStock.debtToEquity ?? 0.25) <= 1.5 ? 'Moderate' : 'High'}
                        </span>
                      </div>
                    </div>

                    {/* Price to Book */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Price to Book (P/B)</span>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">
                        {activeStock.pbRatio ? `${activeStock.pbRatio}x` : '3.2x'}
                      </div>
                    </div>

                    {/* Return on Equity */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Return on Equity (ROE)</span>
                      <div className="text-lg font-bold font-mono text-purple-700 dark:text-purple-300 mt-1">
                        {activeStock.roe ? `${activeStock.roe}%` : '18.4%'}
                      </div>
                    </div>

                    {/* ROCE */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">ROCE %</span>
                      <div className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300 mt-1">
                        {activeStock.roce ? `${activeStock.roce}%` : '16.5%'}
                      </div>
                    </div>

                    {/* Dividend Yield */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Dividend Yield</span>
                      <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {activeStock.dividendYield ? `${activeStock.dividendYield}%` : '0.80%'}
                      </div>
                    </div>

                    {/* Free Cash Flow */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Free Cash Flow</span>
                      <div className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1.5 truncate">
                        {activeStock.freeCashFlow || '₹14,500 Cr'}
                      </div>
                    </div>

                    {/* YoY Profit Growth */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121815] border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">YoY Profit Growth</span>
                      <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
                        +{activeStock.yoyQuarterlyProfitGrowth || 12.5}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline 6-Tab Navigation Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-[#141a17] p-2 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
                  {[
                    { id: 'overview', label: 'Technicals & Momentum', icon: Zap },
                    { id: 'financials', label: '3Y Statements & Margins', icon: BarChart3 },
                    { id: 'shareholding', label: 'Ownership & Trends', icon: Users },
                    { id: 'peers', label: `Sector Peers (${peersList.length})`, icon: Activity },
                    { id: 'ai_sentiment', label: '🤖 AI Bull/Bear & Consensus', icon: Bot },
                    { id: 'sip', label: 'SIP Simulator', icon: Calculator }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeDetailTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDetailTab(tab.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
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
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                        <span className="text-[10px] uppercase font-mono text-gray-400 block">RSI (14-Day)</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-base font-bold font-mono text-gray-900 dark:text-white">
                            {activeStock.rsi || 54.2}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                            (activeStock.rsi || 54.2) > 70 ? 'bg-rose-100 text-rose-800' : (activeStock.rsi || 54.2) < 38 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {(activeStock.rsi || 54.2) > 70 ? 'Overbought' : (activeStock.rsi || 54.2) < 38 ? 'Oversold / Dip' : 'Neutral'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                        <span className="text-[10px] uppercase font-mono text-gray-400 block">50-DMA</span>
                        <span className="text-base font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                          {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.dma50 || Math.round(activeStock.currentPrice * 0.97)}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                        <span className="text-[10px] uppercase font-mono text-gray-400 block">200-DMA</span>
                        <span className="text-base font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                          {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.dma200 || Math.round(activeStock.currentPrice * 0.92)}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                        <span className="text-[10px] uppercase font-mono text-gray-400 block">Volume Multiplier</span>
                        <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                          ⚡ {activeStock.volumeMultiple ?? calculateVolumeMultiple(activeStock.symbol, activeStock.changePercent)}x 20D Avg
                        </span>
                      </div>
                    </div>

                    {/* Overview description & Upcoming results */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">
                          Company Overview & Catalysts
                        </h4>
                        {activeStock.upcomingEarningsDate && (
                          <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60">
                            📅 Next Earnings: {activeStock.upcomingEarningsDate}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1.5">
                        {activeStock.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: 3-Year Statements & Margins Breakdown */}
                {activeDetailTab === 'financials' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Visual 3-Year Revenue & Profit Chart */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-2">
                          3-Year Revenue vs Net Profit ({financialStatements?.currencyUnit || '₹ Cr'})
                        </h4>
                        <div className="h-44 w-full pt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <XAxis dataKey="year" stroke="#888888" fontSize={11} />
                              <YAxis stroke="#888888" fontSize={11} />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="p-2.5 rounded-2xl bg-gray-900 text-white text-xs font-mono shadow-md">
                                        <div>Rev: {payload[0]?.value} {financialStatements?.currencyUnit}</div>
                                        <div className="text-emerald-400">Profit: {payload[1]?.value} {financialStatements?.currencyUnit}</div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                              <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="NetProfit" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Operating & Net Margins */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-2">
                            Profitability Margins & Segment Revenue Split
                          </h4>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                              <span className="text-[10px] text-gray-400 font-mono">Operating Margin</span>
                              <span className="text-base font-bold font-mono text-emerald-600 block mt-0.5">
                                {financialStatements?.operatingMargin[financialStatements.operatingMargin.length - 1]}%
                              </span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                              <span className="text-[10px] text-gray-400 font-mono">Net Profit Margin</span>
                              <span className="text-base font-bold font-mono text-blue-600 block mt-0.5">
                                {financialStatements?.netMargin[financialStatements.netMargin.length - 1]}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Segment Split */}
                        <div>
                          <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 font-mono">
                            Business Divisions Contribution:
                          </span>
                          <div className="space-y-1.5">
                            {financialStatements?.segments?.map((seg, i) => (
                              <div key={i} className="space-y-0.5">
                                <div className="flex justify-between text-[11px] font-mono text-gray-600 dark:text-gray-300">
                                  <span>{seg.name}</span>
                                  <span className="font-bold">{seg.percent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#2C6E49] rounded-full" style={{ width: `${seg.percent}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Ownership & Trends */}
                {activeDetailTab === 'shareholding' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">
                            Institutional & Promoter Shareholding Pattern
                          </h4>
                          <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                            Latest Quarter vs Historical Trend
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Promoter Pledge: {pledgeVal}%</span>
                        </span>
                      </div>

                      {/* Stacked Percentage Bar */}
                      <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
                        <div style={{ width: `${promoterVal}%` }} className="bg-[#2C6E49]" title={`Promoter: ${promoterVal}%`} />
                        <div style={{ width: `${fiiVal}%` }} className="bg-blue-500" title={`FII: ${fiiVal}%`} />
                        <div style={{ width: `${diiVal}%` }} className="bg-purple-500" title={`DII: ${diiVal}%`} />
                        <div style={{ width: `${publicVal}%` }} className="bg-amber-500" title={`Public: ${publicVal}%`} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#2C6E49]" />
                            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Promoters</span>
                          </div>
                          <span className="text-base font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                            {promoterVal}%
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">FII (Foreign)</span>
                          </div>
                          <span className="text-base font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                            {fiiVal}%
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">DII (Domestic)</span>
                          </div>
                          <span className="text-base font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                            {diiVal}%
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Public & Retail</span>
                          </div>
                          <span className="text-base font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                            {publicVal}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4-Quarter Trend Table */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>Quarterly Shareholding Trend (Last 4 Quarters)</span>
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                              <th className="pb-2.5 font-medium">Quarter Period</th>
                              <th className="pb-2.5 font-medium text-right text-[#2C6E49]">Promoter %</th>
                              <th className="pb-2.5 font-medium text-right text-blue-600">FII (Foreign) %</th>
                              <th className="pb-2.5 font-medium text-right text-purple-600">DII (Mutual Funds) %</th>
                              <th className="pb-2.5 font-medium text-right text-amber-600">Public %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                            {shareholdingTrendData.map((q, idx) => (
                              <tr key={q.quarter} className={idx === shareholdingTrendData.length - 1 ? 'bg-emerald-50/50 dark:bg-emerald-950/30 font-bold' : ''}>
                                <td className="py-2.5 text-gray-800 dark:text-gray-200">{q.quarter}</td>
                                <td className="py-2.5 text-right">{q.promoter}%</td>
                                <td className="py-2.5 text-right text-blue-600 dark:text-blue-400">{q.fii}%</td>
                                <td className="py-2.5 text-right text-purple-600 dark:text-purple-400">{q.dii}%</td>
                                <td className="py-2.5 text-right text-amber-600 dark:text-amber-400">{q.public}%</td>
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
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">
                            Sector Competitor Matrix ({activeStock.sector})
                          </h4>
                          <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                            Side-by-side valuation & performance against sector rivals
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-gray-500">
                          {peersList.length} Competitors Found
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                              <th className="pb-2.5 font-medium">Company & Ticker</th>
                              <th className="pb-2.5 font-medium text-right">LTP Price</th>
                              <th className="pb-2.5 font-medium text-right">P/E Ratio</th>
                              <th className="pb-2.5 font-medium text-right">Market Cap</th>
                              <th className="pb-2.5 font-medium text-right">Day %</th>
                              <th className="pb-2.5 font-medium text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                            <tr className="bg-emerald-50/70 dark:bg-emerald-950/40 font-bold border-l-4 border-[#2C6E49]">
                              <td className="py-3.5 px-3 text-emerald-950 dark:text-emerald-200">
                                {activeStock.symbol} · {activeStock.name} (Active)
                              </td>
                              <td className="py-3.5 text-right text-emerald-900 dark:text-emerald-200">
                                {activeStock.currency === 'USD' ? '$' : '₹'}{activeStock.currentPrice.toLocaleString()}
                              </td>
                              <td className="py-3.5 text-right">{activeStock.peRatio || 'N/A'}x</td>
                              <td className="py-3.5 text-right">{activeStock.marketCap}</td>
                              <td className={`py-3.5 text-right ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                {isPositive ? '+' : ''}{activeStock.changePercent.toFixed(2)}%
                              </td>
                              <td className="py-3.5 text-center">
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-sans">Active</span>
                              </td>
                            </tr>

                            {peersList.map(peer => {
                              const isPeerTracked = watchlist.some(w => w.symbol.toUpperCase() === peer.symbol.toUpperCase());
                              const peerPositive = peer.changePercent >= 0;

                              return (
                                <tr key={peer.symbol} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                                  <td className="py-3.5 px-3">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                      {peer.symbol}
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-sans block truncate max-w-[170px]">
                                      {peer.name}
                                    </span>
                                  </td>

                                  <td className="py-3.5 text-right font-bold text-gray-900 dark:text-white">
                                    {peer.price ? `${peer.currency === 'USD' ? '$' : '₹'}${peer.price.toLocaleString()}` : '—'}
                                  </td>

                                  <td className="py-3.5 text-right text-gray-700 dark:text-gray-300">
                                    {peer.pe ? `${peer.pe}x` : 'N/A'}
                                  </td>

                                  <td className="py-3.5 text-right text-gray-700 dark:text-gray-300">
                                    {peer.marketCap}
                                  </td>

                                  <td className={`py-3.5 text-right font-bold ${peerPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                    {peerPositive ? '+' : ''}{peer.changePercent}%
                                  </td>

                                  <td className="py-3.5 text-center">
                                    {isPeerTracked ? (
                                      <button
                                        onClick={() => {
                                          const found = watchlist.find(w => w.symbol.toUpperCase() === peer.symbol.toUpperCase());
                                          if (found) setSelectedStockId(found.id);
                                        }}
                                        className="px-3 py-1 rounded-xl text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 cursor-pointer"
                                      >
                                        View →
                                      </button>
                                    ) : (
                                      <button
                                        onClick={async () => {
                                          const newStock = await fetchStockInfoFromOnline(peer.symbol);
                                          addToWatchlist(newStock);
                                          setSelectedStockId(newStock.id);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-[#2C6E49] hover:text-white cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Watch</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: AI Bull / Bear & Analyst Consensus */}
                {activeDetailTab === 'ai_sentiment' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bull Case */}
                      <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs">
                        <div className="flex items-center gap-2 mb-2.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase font-mono">
                            Key Bull Case & Growth Catalysts
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs text-emerald-900/90 dark:text-emerald-200/90">
                          {aiAnalysis?.bullCase.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bear Case */}
                      <div className="p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 shadow-xs">
                        <div className="flex items-center gap-2 mb-2.5">
                          <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200 uppercase font-mono">
                            Key Bear Case & Downside Risks
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs text-rose-900/90 dark:text-rose-200/90">
                          {aiAnalysis?.bearCase.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-rose-500 font-bold mt-0.5">⚠</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Institutional Analyst Consensus Card */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span>Analyst Consensus & Target Price Range</span>
                          </h4>
                          <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                            Coverage across {consensus?.totalAnalysts || 32} Wall St & Dalal St Brokerages
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-2xl border border-emerald-200/80">
                          Upside: +{consensus?.upsidePercent || 18.5}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <span className="text-[10px] text-gray-400 font-mono">Brokerage Ratings</span>
                          <div className="text-sm font-bold font-mono text-emerald-600 mt-1">
                            {consensus?.buyCount || 26} Buy · {consensus?.holdCount || 5} Hold · {consensus?.sellCount || 2} Sell
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <span className="text-[10px] text-gray-400 font-mono">Low Target</span>
                          <div className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1">
                            {activeStock.currency === 'USD' ? '$' : '₹'}{consensus?.targetLow}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono font-bold">Median Target</span>
                          <div className="text-sm font-bold font-mono text-emerald-950 dark:text-emerald-100 mt-1">
                            {activeStock.currency === 'USD' ? '$' : '₹'}{consensus?.targetMedian}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <span className="text-[10px] text-gray-400 font-mono">High Bull Target</span>
                          <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                            {activeStock.currency === 'USD' ? '$' : '₹'}{consensus?.targetHigh}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: SIP Historical Simulator */}
                {activeDetailTab === 'sip' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono mb-3 flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-emerald-600" />
                        <span>Monthly SIP Accumulation Simulator in {activeStock.symbol}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Monthly SIP Amount ({activeStock.currency === 'USD' ? '$' : '₹'})
                          </label>
                          <input
                            type="number"
                            step="1000"
                            value={sipMonthlyAmount}
                            onChange={(e) => setSipMonthlyAmount(parseFloat(e.target.value) || 0)}
                            className="w-full h-10 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Tenure: {sipYears} Years
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
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <span className="text-[10px] uppercase font-mono text-gray-400">Total Invested</span>
                          <div className="text-base font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                            {activeStock.currency === 'USD' ? '$' : '₹'}{Math.round(totalSipInvested).toLocaleString()}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#121815]">
                          <span className="text-[10px] uppercase font-mono text-gray-400">Compounded Wealth Gained</span>
                          <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                            +{activeStock.currency === 'USD' ? '$' : '₹'}{Math.round(estimatedWealthGain).toLocaleString()}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                          <span className="text-[10px] uppercase font-mono text-emerald-800 dark:text-emerald-300 font-bold">Estimated Total Corpus</span>
                          <div className="text-base font-bold font-mono text-emerald-950 dark:text-emerald-100 mt-0.5">
                            {activeStock.currency === 'USD' ? '$' : '₹'}{Math.round(futureSipValue).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}

      {/* Set Alert Modal */}
      <SetStockAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        stock={activeStock}
      />

      {/* Create Watchlist Folder Modal */}
      <CreateWatchlistModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
      />
    </div>
  );
};
