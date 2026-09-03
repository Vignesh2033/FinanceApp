import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Asset,
  Liability,
  CashflowItem,
  Goal,
  Snapshot,
  EssentialsCheck,
  ActiveTab,
  CurrencyCode,
  AssetCategory,
  WatchlistItem,
  WatchlistFolder,
  WatchlistAlert,
  MarketIndex,
  CloudSyncConfig,
  CloudBackupRevision,
  CloudSyncResult
} from '../types/finance';
import {
  loadCloudConfig,
  saveCloudConfig,
  getCloudRevisions,
  syncPortfolioToCloud,
  restorePortfolioFromCloud
} from '../utils/cloudSyncService';
import {
  INITIAL_ASSETS,
  INITIAL_LIABILITIES,
  INITIAL_CASHFLOW,
  INITIAL_GOALS,
  INITIAL_SNAPSHOTS,
  INITIAL_ESSENTIALS,
  INITIAL_PROFILES
} from '../data/initialData';
import { INITIAL_WATCHLIST, INITIAL_WATCHLIST_FOLDERS, fetchStockInfoFromOnline } from '../utils/stockService';
import {
  fetchMarketIndices,
  DEFAULT_MARKET_INDICES,
  fetchYahooQuote,
  normalizeYahooTicker
} from '../utils/yahooFinance';

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  'Equity': '#3b82f6', // blue
  'Mutual Funds': '#10b981', // emerald
  'Govt & EPF/PPF': '#8b5cf6', // purple
  'Precious Metals': '#f59e0b', // amber
  'Real Estate': '#ec4899', // pink
  'Fixed Income & Deposits': '#06b6d4', // cyan
  'Cash & Bank': '#14b8a6', // teal
  'Crypto & Alternate': '#f97316', // orange
  'Other Assets': '#64748b', // slate
};

interface FinanceContextType {
  // States
  assets: Asset[];
  liabilities: Liability[];
  cashflow: CashflowItem[];
  goals: Goal[];
  snapshots: Snapshot[];
  essentials: EssentialsCheck;
  watchlist: WatchlistItem[];
  activeProfile: string;
  activeTab: ActiveTab;
  currency: CurrencyCode;
  isPrivacyMode: boolean;
  isDarkMode: boolean;
  isDemoMode: boolean;

  // Setters & Actions
  setActiveTab: (tab: ActiveTab) => void;
  setActiveProfile: (profileId: string) => void;
  setCurrency: (code: CurrencyCode) => void;
  togglePrivacyMode: () => void;
  toggleDarkMode: () => void;
  addAsset: (asset: Omit<Asset, 'id' | 'updatedAt'>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Omit<Liability, 'id'>) => void;
  updateLiability: (liability: Liability) => void;
  deleteLiability: (id: string) => void;
  addCashflowItem: (item: Omit<CashflowItem, 'id'>) => void;
  updateCashflowItem: (item: CashflowItem) => void;
  deleteCashflowItem: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  addSnapshot: (date?: string) => void;
  deleteSnapshot: (id: string) => void;
  updateEssentials: (essentials: EssentialsCheck) => void;
  importAssets: (assets: Asset[]) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  restoreBackup: (backupData: any) => void;

  // Watchlist Actions & Folders
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  updateWatchlistItem: (item: WatchlistItem) => void;
  refreshWatchlistQuotes: () => Promise<void>;
  convertWatchlistToAsset: (item: WatchlistItem, quantity: number, buyPrice: number) => void;

  // Yahoo Finance Live Market Feeds & Asset Price Sync
  marketIndices: MarketIndex[];
  isRefreshingQuotes: boolean;
  lastQuotesSyncedAt: string | null;
  autoRefreshInterval: number; // in seconds (0 = off)
  setAutoRefreshInterval: (seconds: number) => void;
  refreshMarketIndices: () => Promise<void>;
  syncAssetPricesFromYahoo: () => Promise<{ updatedCount: number; errors: string[] }>;

  // Watchlist Folders & Thematic Lists
  watchlistFolders: WatchlistFolder[];
  activeFolderId: string;
  setActiveFolderId: (id: string) => void;
  createWatchlistFolder: (name: string, icon?: string, description?: string) => void;
  deleteWatchlistFolder: (id: string) => void;
  toggleStockInFolder: (folderId: string, stockId: string) => void;

  // Cloud Storage & Multi-Device Sync
  cloudConfig: CloudSyncConfig;
  setCloudConfig: (config: CloudSyncConfig) => void;
  cloudRevisions: CloudBackupRevision[];
  isCloudSyncing: boolean;
  lastCloudSyncResult: CloudSyncResult | null;
  syncToCloud: (masterPassword?: string) => Promise<CloudSyncResult>;
  restoreFromCloud: (masterPassword?: string) => Promise<boolean>;
  refreshCloudRevisions: () => void;

  // Stock Alerts Engine
  stockAlerts: WatchlistAlert[];
  addStockAlert: (alert: Omit<WatchlistAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  removeStockAlert: (id: string) => void;
  toggleStockAlert: (id: string) => void;
  clearTriggeredAlerts: () => void;

  // Computed Metrics for Active Profile
  profileAssets: Asset[];
  profileLiabilities: Liability[];
  profileCashflow: CashflowItem[];
  profileGoals: Goal[];
  profileSnapshots: Snapshot[];
  totalAssetValue: number;
  totalInvestedValue: number;
  totalLiabilityValue: number;
  netWorth: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  overallUnrealizedGain: number;
  overallUnrealizedGainPercent: number;
  assetAllocation: { category: AssetCategory; value: number; percentage: number; color: string; count: number }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ASSETS: 'finboom_assets_v1',
  LIABILITIES: 'finboom_liabilities_v1',
  CASHFLOW: 'finboom_cashflow_v1',
  GOALS: 'finboom_goals_v1',
  SNAPSHOTS: 'finboom_snapshots_v1',
  ESSENTIALS: 'finboom_essentials_v1',
  WATCHLIST: 'finboom_watchlist_v1',
  FOLDERS: 'finboom_watchlist_folders_v1',
  ALERTS: 'finboom_stock_alerts_v1',
  PROFILE: 'finboom_profile_v1',
  CURRENCY: 'finboom_currency_v1',
  PRIVACY: 'finboom_privacy_v1',
  THEME: 'finboom_theme_v1',
  DEMO: 'finboom_is_demo_v1',
  AUTOREFRESH: 'finboom_autorefresh_v1'
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize states from LocalStorage or Fallbacks
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [liabilities, setLiabilities] = useState<Liability[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LIABILITIES);
    return saved ? JSON.parse(saved) : INITIAL_LIABILITIES;
  });

  const [cashflow, setCashflow] = useState<CashflowItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASHFLOW);
    return saved ? JSON.parse(saved) : INITIAL_CASHFLOW;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
    return saved ? JSON.parse(saved) : INITIAL_SNAPSHOTS;
  });

  const [essentials, setEssentials] = useState<EssentialsCheck>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ESSENTIALS);
    return saved ? JSON.parse(saved) : INITIAL_ESSENTIALS;
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
  });

  // Yahoo Finance Feeds & Live Quotes State
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(DEFAULT_MARKET_INDICES);
  const [isRefreshingQuotes, setIsRefreshingQuotes] = useState<boolean>(false);
  const [lastQuotesSyncedAt, setLastQuotesSyncedAt] = useState<string | null>(null);
  const [autoRefreshInterval, setAutoRefreshIntervalState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTOREFRESH);
    return saved ? parseInt(saved, 10) : 0;
  });

  const setAutoRefreshInterval = (seconds: number) => {
    setAutoRefreshIntervalState(seconds);
    localStorage.setItem(STORAGE_KEYS.AUTOREFRESH, String(seconds));
  };

  const [watchlistFolders, setWatchlistFolders] = useState<WatchlistFolder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return saved ? JSON.parse(saved) : INITIAL_WATCHLIST_FOLDERS;
  });

  const [activeFolderId, setActiveFolderId] = useState<string>('folder-all');

  // Cloud Storage & Multi-Device Sync State
  const [cloudConfig, setCloudConfigState] = useState<CloudSyncConfig>(() => loadCloudConfig());
  const [cloudRevisions, setCloudRevisions] = useState<CloudBackupRevision[]>(() => getCloudRevisions());
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncResult, setLastCloudSyncResult] = useState<CloudSyncResult | null>(null);

  const setCloudConfig = (cfg: CloudSyncConfig) => {
    setCloudConfigState(cfg);
    saveCloudConfig(cfg);
  };

  const refreshCloudRevisions = () => {
    setCloudRevisions(getCloudRevisions());
  };

  const syncToCloud = async (masterPassword?: string): Promise<CloudSyncResult> => {
    setIsCloudSyncing(true);
    try {
      const res = await syncPortfolioToCloud(
        {
          assets,
          liabilities,
          goals,
          cashflow,
          snapshots,
          watchlist,
          currency,
          activeProfile
        },
        cloudConfig,
        masterPassword
      );
      setLastCloudSyncResult(res);
      refreshCloudRevisions();
      return res;
    } catch (err: any) {
      const failedRes: CloudSyncResult = {
        success: false,
        error: err?.message || 'Cloud sync failed',
        timestamp: new Date().toISOString()
      };
      setLastCloudSyncResult(failedRes);
      return failedRes;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const restoreFromCloud = async (masterPassword?: string): Promise<boolean> => {
    setIsCloudSyncing(true);
    try {
      const res = await restorePortfolioFromCloud(cloudConfig, masterPassword);
      if (res && res.portfolioData) {
        restoreBackup(res.portfolioData);
        refreshCloudRevisions();
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const [stockAlerts, setStockAlerts] = useState<WatchlistAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'alert-1',
        stockId: 'wl-reliance',
        symbol: 'RELIANCE',
        condition: 'PRICE_ABOVE',
        targetValue: 1350,
        isActive: true,
        isTriggered: false,
        createdAt: '2026-02-25',
        notes: 'Breakout above ₹1,350 resistance'
      },
      {
        id: 'alert-2',
        stockId: 'wl-nvda',
        symbol: 'NVDA',
        condition: 'RSI_BELOW',
        targetValue: 40,
        isActive: true,
        isTriggered: false,
        createdAt: '2026-02-26',
        notes: 'Dip accumulation zone'
      }
    ];
  });

  const [activeProfile, setActiveProfile] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PROFILE) || 'personal';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode) || 'INR';
  });

  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PRIVACY) === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return false;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEMO);
    return saved !== null ? saved === 'true' : true;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIABILITIES, JSON.stringify(liabilities));
  }, [liabilities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASHFLOW, JSON.stringify(cashflow));
  }, [cashflow]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(watchlistFolders));
  }, [watchlistFolders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(stockAlerts));
  }, [stockAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ESSENTIALS, JSON.stringify(essentials));
  }, [essentials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, activeProfile);
  }, [activeProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRIVACY, String(isPrivacyMode));
  }, [isPrivacyMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO, String(isDemoMode));
  }, [isDemoMode]);

  // Actions
  const togglePrivacyMode = () => setIsPrivacyMode(prev => !prev);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const addAsset = (newAsset: Omit<Asset, 'id' | 'updatedAt'>) => {
    const asset: Asset = {
      ...newAsset,
      id: `ast-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setAssets(prev => [asset, ...prev]);
    setIsDemoMode(false);
  };

  const updateAsset = (updated: Asset) => {
    setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
    setIsDemoMode(false);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addLiability = (newLiability: Omit<Liability, 'id'>) => {
    const liability: Liability = {
      ...newLiability,
      id: `liab-${Date.now()}`
    };
    setLiabilities(prev => [liability, ...prev]);
    setIsDemoMode(false);
  };

  const updateLiability = (updated: Liability) => {
    setLiabilities(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const deleteLiability = (id: string) => {
    setLiabilities(prev => prev.filter(l => l.id !== id));
  };

  const addCashflowItem = (newItem: Omit<CashflowItem, 'id'>) => {
    const item: CashflowItem = {
      ...newItem,
      id: `cf-${Date.now()}`
    };
    setCashflow(prev => [item, ...prev]);
  };

  const updateCashflowItem = (updated: CashflowItem) => {
    setCashflow(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCashflowItem = (id: string) => {
    setCashflow(prev => prev.filter(c => c.id !== id));
  };

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: `gl-${Date.now()}`
    };
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (updated: Goal) => {
    setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addSnapshot = (customDate?: string) => {
    const dateObj = customDate ? new Date(customDate) : new Date();
    const dateStr = dateObj.toISOString().split('T')[0];
    const monthLabel = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    
    // Filter by active profile
    const pAssets = assets.filter(a => a.profileId === activeProfile);
    const pLiabilities = liabilities.filter(l => l.profileId === activeProfile);
    const totalAssets = pAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalLiabilities = pLiabilities.reduce((sum, l) => sum + l.outstandingBalance, 0);
    const netWorth = totalAssets - totalLiabilities;

    const newSnapshot: Snapshot = {
      id: `snp-${Date.now()}`,
      date: dateStr,
      monthLabel,
      totalAssets,
      totalLiabilities,
      netWorth,
      profileId: activeProfile
    };

    setSnapshots(prev => {
      const filtered = prev.filter(s => !(s.monthLabel === monthLabel && s.profileId === activeProfile));
      return [...filtered, newSnapshot].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  };

  const updateEssentials = (newEssentials: EssentialsCheck) => {
    setEssentials(newEssentials);
  };

  const importAssets = (imported: Asset[]) => {
    setAssets(prev => [...imported, ...prev]);
    setIsDemoMode(false);
  };

  // Watchlist Actions
  const addToWatchlist = (item: WatchlistItem) => {
    setWatchlist(prev => {
      const exists = prev.some(w => w.symbol.toUpperCase() === item.symbol.toUpperCase());
      if (exists) {
        return prev.map(w => w.symbol.toUpperCase() === item.symbol.toUpperCase() ? { ...w, ...item } : w);
      }
      return [item, ...prev];
    });

    // If a custom folder is currently active, also assign this new stock to that folder
    if (activeFolderId && activeFolderId !== 'folder-all') {
      setWatchlistFolders(prevFolders =>
        prevFolders.map(f => {
          if (f.id === activeFolderId && !f.stockIds.includes(item.id)) {
            return { ...f, stockIds: [item.id, ...f.stockIds] };
          }
          return f;
        })
      );
    }
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
    // Also remove from all folders
    setWatchlistFolders(prev =>
      prev.map(f => ({ ...f, stockIds: f.stockIds.filter(stockId => stockId !== id) }))
    );
  };

  const updateWatchlistItem = (updated: WatchlistItem) => {
    setWatchlist(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  // Initial load of live market indices
  useEffect(() => {
    fetchMarketIndices().then(data => {
      if (data && data.length > 0) {
        setMarketIndices(data);
        setLastQuotesSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }).catch(() => {});
  }, []);

  // Periodic Auto-Refresh for Market Indices & Watchlist Quotes
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchMarketIndices().then(data => {
        if (data && data.length > 0) {
          setMarketIndices(data);
          setLastQuotesSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }).catch(() => {});

      refreshWatchlistQuotes().catch(() => {});
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, watchlist]);

  const refreshMarketIndices = async () => {
    setIsRefreshingQuotes(true);
    try {
      const fresh = await fetchMarketIndices();
      if (fresh && fresh.length > 0) {
        setMarketIndices(fresh);
        setLastQuotesSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      //
    } finally {
      setIsRefreshingQuotes(false);
    }
  };

  const refreshWatchlistQuotes = async () => {
    setIsRefreshingQuotes(true);
    try {
      const currentList = [...watchlist];
      const updated = await Promise.all(
        currentList.map(async (item) => {
          try {
            const fresh = await fetchStockInfoFromOnline(item.symbol);
            return {
              ...item,
              currentPrice: fresh.currentPrice,
              change: fresh.change,
              changePercent: fresh.changePercent,
              dayHigh: fresh.dayHigh,
              dayLow: fresh.dayLow,
              fiftyTwoWeekHigh: fresh.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: fresh.fiftyTwoWeekLow,
              sparkline: fresh.sparkline || item.sparkline,
              news: fresh.news || item.news
            };
          } catch {
            return item;
          }
        })
      );

      // Merge quotes using functional updater so newly added stocks are never wiped out
      setWatchlist(prevList => {
        return prevList.map(item => {
          const fresh = updated.find(u => u.symbol.toUpperCase() === item.symbol.toUpperCase());
          return fresh ? { ...item, ...fresh } : item;
        });
      });

      setLastQuotesSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Check alert triggers against updated quotes
      setStockAlerts(prevAlerts =>
        prevAlerts.map(alert => {
          if (!alert.isActive || alert.isTriggered) return alert;
          const stock = updated.find(s => s.id === alert.stockId || s.symbol.toUpperCase() === alert.symbol.toUpperCase());
          if (!stock) return alert;

          let triggered = false;
          if (alert.condition === 'PRICE_ABOVE' && stock.currentPrice >= alert.targetValue) triggered = true;
          if (alert.condition === 'PRICE_BELOW' && stock.currentPrice <= alert.targetValue) triggered = true;
          if (alert.condition === 'RSI_BELOW' && (stock.rsi || 50) <= alert.targetValue) triggered = true;
          if (alert.condition === 'RSI_ABOVE' && (stock.rsi || 50) >= alert.targetValue) triggered = true;
          if (alert.condition === 'GOLDEN_CROSS' && stock.dmaStatus === 'Bullish') triggered = true;

          if (triggered) {
            return {
              ...alert,
              isTriggered: true,
              triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return alert;
        })
      );
    } finally {
      setIsRefreshingQuotes(false);
    }
  };

  const syncAssetPricesFromYahoo = async (): Promise<{ updatedCount: number; errors: string[] }> => {
    setIsRefreshingQuotes(true);
    const errors: string[] = [];
    let updatedCount = 0;

    try {
      const pAssets = [...assets];
      const updatedAssets = await Promise.all(
        pAssets.map(async (asset) => {
          const isEligible = ['Equity', 'Mutual Funds', 'Crypto & Alternate', 'Precious Metals'].includes(asset.category) || !!asset.yahooTicker;
          if (!isEligible) return asset;

          let tickerToQuery = asset.yahooTicker || '';
          if (!tickerToQuery) {
            const nameUpper = asset.name.toUpperCase();
            if (nameUpper.includes('RELIANCE')) tickerToQuery = 'RELIANCE.NS';
            else if (nameUpper.includes('TCS') || nameUpper.includes('TATA CONSULTANCY')) tickerToQuery = 'TCS.NS';
            else if (nameUpper.includes('INFY') || nameUpper.includes('INFOSYS')) tickerToQuery = 'INFY.NS';
            else if (nameUpper.includes('HDFC BANK')) tickerToQuery = 'HDFCBANK.NS';
            else if (nameUpper.includes('ICICI BANK')) tickerToQuery = 'ICICIBANK.NS';
            else if (nameUpper.includes('STATE BANK') || nameUpper.includes('SBIN')) tickerToQuery = 'SBIN.NS';
            else if (nameUpper.includes('TATA MOTORS')) tickerToQuery = 'TATAMOTORS.NS';
            else if (nameUpper.includes('NVIDIA') || nameUpper.includes('NVDA')) tickerToQuery = 'NVDA';
            else if (nameUpper.includes('APPLE') || nameUpper.includes('AAPL')) tickerToQuery = 'AAPL';
            else if (nameUpper.includes('MICROSOFT') || nameUpper.includes('MSFT')) tickerToQuery = 'MSFT';
            else if (nameUpper.includes('ALPHABET') || nameUpper.includes('GOOGLE') || nameUpper.includes('GOOG')) tickerToQuery = 'GOOGL';
            else if (nameUpper.includes('AMAZON') || nameUpper.includes('AMZN')) tickerToQuery = 'AMZN';
            else if (nameUpper.includes('TESLA') || nameUpper.includes('TSLA')) tickerToQuery = 'TSLA';
            else if (nameUpper.includes('BITCOIN') || nameUpper.includes('BTC')) tickerToQuery = 'BTC-USD';
            else if (nameUpper.includes('ETHEREUM') || nameUpper.includes('ETH')) tickerToQuery = 'ETH-USD';
            else if (nameUpper.includes('SOLANA') || nameUpper.includes('SOL')) tickerToQuery = 'SOL-USD';
            else if (nameUpper.includes('GOLD BEES') || nameUpper.includes('GOLDBEES')) tickerToQuery = 'GOLDBEES.NS';
            else if (nameUpper.includes('NIFTY BEES') || nameUpper.includes('NIFTYBEES')) tickerToQuery = 'NIFTYBEES.NS';
            else if (nameUpper.includes('SGB') || nameUpper.includes('SOVEREIGN GOLD')) tickerToQuery = 'GOLDBEES.NS';
            else {
              const firstWord = asset.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
              if (firstWord && firstWord.length >= 2) {
                tickerToQuery = normalizeYahooTicker(firstWord);
              }
            }
          }

          if (!tickerToQuery) return asset;

          try {
            const quote = await fetchYahooQuote(tickerToQuery);
            if (quote && quote.currentPrice > 0) {
              updatedCount++;
              const newCurrentPrice = quote.currentPrice;
              let newCurrentVal = asset.currentValue;

              if (asset.units && asset.units > 0) {
                newCurrentVal = Math.round(asset.units * newCurrentPrice * 100) / 100;
              } else if (asset.investedValue > 0) {
                const priceChangeRatio = quote.changePercent ? (1 + quote.changePercent / 100) : 1;
                newCurrentVal = Math.round(asset.currentValue * priceChangeRatio * 100) / 100;
              }

              return {
                ...asset,
                currentValue: newCurrentVal,
                nav: newCurrentPrice,
                yahooTicker: quote.symbol,
                lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                updatedAt: new Date().toISOString().split('T')[0]
              };
            }
          } catch (e: any) {
            errors.push(`${asset.name}: ${e?.message || 'Failed to fetch quote'}`);
          }

          return asset;
        })
      );

      setAssets(updatedAssets);
      setLastQuotesSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setIsRefreshingQuotes(false);
    }

    return { updatedCount, errors };
  };

  // Folder Actions
  const createWatchlistFolder = (name: string, icon: string = 'Folder', description: string = '') => {
    const newFolder: WatchlistFolder = {
      id: `folder-${Date.now()}`,
      name,
      icon,
      description,
      stockIds: []
    };
    setWatchlistFolders(prev => [...prev, newFolder]);
    setActiveFolderId(newFolder.id);
  };

  const deleteWatchlistFolder = (id: string) => {
    setWatchlistFolders(prev => prev.filter(f => f.id !== id || f.isDefault));
    if (activeFolderId === id) {
      setActiveFolderId('folder-all');
    }
  };

  const toggleStockInFolder = (folderId: string, stockId: string) => {
    setWatchlistFolders(prev =>
      prev.map(f => {
        if (f.id !== folderId) return f;
        const exists = f.stockIds.includes(stockId);
        return {
          ...f,
          stockIds: exists ? f.stockIds.filter(id => id !== stockId) : [...f.stockIds, stockId]
        };
      })
    );
  };

  // Stock Alert Actions
  const addStockAlert = (newAlert: Omit<WatchlistAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const alert: WatchlistAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isTriggered: false
    };
    setStockAlerts(prev => [alert, ...prev]);
  };

  const removeStockAlert = (id: string) => {
    setStockAlerts(prev => prev.filter(a => a.id !== id));
  };

  const toggleStockAlert = (id: string) => {
    setStockAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const clearTriggeredAlerts = () => {
    setStockAlerts(prev => prev.map(a => ({ ...a, isTriggered: false, triggeredAt: undefined })));
  };

  const convertWatchlistToAsset = (item: WatchlistItem, quantity: number, buyPrice: number) => {
    let cat: AssetCategory = 'Equity';
    if (item.exchange === 'CRYPTO') cat = 'Crypto & Alternate';
    else if (item.sector.includes('Precious Metals') || item.symbol.includes('GOLD') || item.symbol.includes('SGB')) cat = 'Precious Metals';
    else if (item.sector.includes('ETF') || item.sector.includes('Fund')) cat = 'Mutual Funds';

    const newAsset: Omit<Asset, 'id' | 'updatedAt'> = {
      name: item.name,
      category: cat,
      subCategory: `${item.exchange} Holding`,
      institution: item.exchange === 'NSE' || item.exchange === 'BSE' ? 'Zerodha Kite' : 'IndMoney',
      currentValue: Math.round(quantity * item.currentPrice),
      investedValue: Math.round(quantity * buyPrice),
      units: quantity,
      currency: item.currency,
      profileId: activeProfile,
      notes: `Converted from Watchlist (${item.symbol})`
    };

    addAsset(newAsset);
  };

  const resetToDemoData = () => {
    setAssets(INITIAL_ASSETS);
    setLiabilities(INITIAL_LIABILITIES);
    setCashflow(INITIAL_CASHFLOW);
    setGoals(INITIAL_GOALS);
    setSnapshots(INITIAL_SNAPSHOTS);
    setEssentials(INITIAL_ESSENTIALS);
    setWatchlist(INITIAL_WATCHLIST);
    setIsDemoMode(true);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.LIABILITIES);
    localStorage.removeItem(STORAGE_KEYS.CASHFLOW);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.SNAPSHOTS);
    localStorage.removeItem(STORAGE_KEYS.ESSENTIALS);
    localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
  };

  const clearAllData = () => {
    setAssets([]);
    setLiabilities([]);
    setCashflow([]);
    setGoals([]);
    setSnapshots([]);
    setWatchlist([]);
    setIsDemoMode(false);
    localStorage.clear();
  };

  const restoreBackup = (backupData: any) => {
    if (backupData.assets) setAssets(backupData.assets);
    if (backupData.liabilities) setLiabilities(backupData.liabilities);
    if (backupData.cashflow) setCashflow(backupData.cashflow);
    if (backupData.goals) setGoals(backupData.goals);
    if (backupData.snapshots) setSnapshots(backupData.snapshots);
    if (backupData.essentials) setEssentials(backupData.essentials);
    if (backupData.watchlist) setWatchlist(backupData.watchlist);
    setIsDemoMode(false);
  };

  // Profile-specific filtered data
  const profileAssets = assets.filter(a => a.profileId === activeProfile);
  const profileLiabilities = liabilities.filter(l => l.profileId === activeProfile);
  const profileCashflow = cashflow.filter(c => c.profileId === activeProfile);
  const profileGoals = goals.filter(g => g.profileId === activeProfile);
  const profileSnapshots = snapshots.filter(s => s.profileId === activeProfile);

  // Computed Portfolio Metrics
  const totalAssetValue = profileAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalInvestedValue = profileAssets.reduce((sum, a) => sum + a.investedValue, 0);
  const totalLiabilityValue = profileLiabilities.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const netWorth = totalAssetValue - totalLiabilityValue;

  const totalMonthlyIncome = profileCashflow
    .filter(c => c.type === 'income')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalMonthlyExpenses = profileCashflow
    .filter(c => c.type === 'expense')
    .reduce((sum, c) => sum + c.amount, 0);

  const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome) * 100 : 0;

  const overallUnrealizedGain = totalAssetValue - totalInvestedValue;
  const overallUnrealizedGainPercent = totalInvestedValue > 0
    ? (overallUnrealizedGain / totalInvestedValue) * 100
    : 0;

  // Asset allocation grouped by category
  const assetAllocation = Object.entries(
    profileAssets.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.currentValue;
      return acc;
    }, {} as Record<AssetCategory, number>)
  ).map(([category, value]) => ({
    category: category as AssetCategory,
    value,
    percentage: totalAssetValue > 0 ? Number(((value / totalAssetValue) * 100).toFixed(1)) : 0,
    color: CATEGORY_COLORS[category as AssetCategory] || '#64748b',
    count: profileAssets.filter(a => a.category === category).length
  })).sort((a, b) => b.value - a.value);

  return (
    <FinanceContext.Provider
      value={{
        assets,
        liabilities,
        cashflow,
        goals,
        snapshots,
        essentials,
        watchlist,
        activeProfile,
        activeTab,
        currency,
        isPrivacyMode,
        isDarkMode,
        isDemoMode,
        setActiveTab,
        setActiveProfile,
        setCurrency,
        togglePrivacyMode,
        toggleDarkMode,
        addAsset,
        updateAsset,
        deleteAsset,
        addLiability,
        updateLiability,
        deleteLiability,
        addCashflowItem,
        updateCashflowItem,
        deleteCashflowItem,
        addGoal,
        updateGoal,
        deleteGoal,
        addSnapshot,
        deleteSnapshot,
        updateEssentials,
        importAssets,
        resetToDemoData,
        clearAllData,
        restoreBackup,
        addToWatchlist,
        removeFromWatchlist,
        updateWatchlistItem,
        refreshWatchlistQuotes,
        convertWatchlistToAsset,
        watchlistFolders,
        activeFolderId,
        setActiveFolderId,
        createWatchlistFolder,
        deleteWatchlistFolder,
        toggleStockInFolder,
        cloudConfig,
        setCloudConfig,
        cloudRevisions,
        isCloudSyncing,
        lastCloudSyncResult,
        syncToCloud,
        restoreFromCloud,
        refreshCloudRevisions,
        marketIndices,
        isRefreshingQuotes,
        lastQuotesSyncedAt,
        autoRefreshInterval,
        setAutoRefreshInterval,
        refreshMarketIndices,
        syncAssetPricesFromYahoo,
        stockAlerts,
        addStockAlert,
        removeStockAlert,
        toggleStockAlert,
        clearTriggeredAlerts,
        profileAssets,
        profileLiabilities,
        profileCashflow,
        profileGoals,
        profileSnapshots,
        totalAssetValue,
        totalInvestedValue,
        totalLiabilityValue,
        netWorth,
        totalMonthlyIncome,
        totalMonthlyExpenses,
        monthlySavings,
        savingsRate,
        overallUnrealizedGain,
        overallUnrealizedGainPercent,
        assetAllocation
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
