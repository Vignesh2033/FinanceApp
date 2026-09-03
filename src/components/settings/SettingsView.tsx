import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CURRENCY_CONFIGS, INITIAL_PROFILES } from '../../data/initialData';
import { CurrencyCode } from '../../types/finance';
import { testYahooConnection } from '../../utils/yahooFinance';
import {
  ShieldCheck,
  Download,
  Upload,
  Sparkles,
  Trash2,
  Lock,
  Globe,
  User,
  Database,
  Moon,
  Sun,
  Settings,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity
} from 'lucide-react';

interface SettingsViewProps {
  onOpenExportModal: () => void;
  onOpenCsvImport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenExportModal,
  onOpenCsvImport
}) => {
  const {
    currency,
    setCurrency,
    activeProfile,
    setActiveProfile,
    isDarkMode,
    toggleDarkMode,
    isPrivacyMode,
    togglePrivacyMode,
    resetToDemoData,
    clearAllData,
    autoRefreshInterval,
    setAutoRefreshInterval,
    refreshMarketIndices,
    refreshWatchlistQuotes,
    syncAssetPricesFromYahoo,
    isRefreshingQuotes,
    lastQuotesSyncedAt
  } = useFinance();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const res = await testYahooConnection();
      setConnectionStatus({
        tested: true,
        success: res.success,
        latencyMs: res.latencyMs,
        error: res.error
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        error: err?.message || 'Network error'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncFeedback('Syncing live market quotes and portfolio assets...');
    try {
      await refreshMarketIndices();
      await refreshWatchlistQuotes();
      const assetRes = await syncAssetPricesFromYahoo();
      setSyncFeedback(`Sync complete! Updated benchmark feeds and ${assetRes.updatedCount} portfolio holdings.`);
    } catch {
      setSyncFeedback('Sync finished with partial updates.');
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-gray-900/10 via-white to-gray-50 dark:from-[#131b17] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shadow-md">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Settings & Data Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Configure user preferences, base currency, Yahoo Finance live data feeds, and backups
            </p>
          </div>
        </div>
      </div>

      {/* 1. Privacy & Architecture Badge */}
      <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3.5 shadow-xs">
        <div className="p-2.5 rounded-2xl bg-[#2C6E49] text-white shrink-0 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
            Privacy-First Offline Architecture
          </h3>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
            PersonalPortfolioApp operates 100% locally in your browser. No server databases, no bank login credentials stored, zero trackers. Your personal wealth records stay solely on your hardware.
          </p>
        </div>
      </div>

      {/* 2. Yahoo Finance Live Feeds & Sync Settings */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Yahoo Finance Live Market Data Engine</span>
          </h3>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 font-bold">
            🟢 Active
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Provides real-time quotes, ticker autocompletion, historical candlestick charts (1D to 5Y), and benchmark market indices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Auto-Refresh Interval */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Background Auto-Refresh Frequency
            </label>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value, 10))}
              className="w-full h-10 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value={0}>Manual Refresh Only (Off)</option>
              <option value={30}>Every 30 Seconds</option>
              <option value={60}>Every 1 Minute (Recommended)</option>
              <option value={300}>Every 5 Minutes</option>
            </select>
          </div>

          {/* Connection Test */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              API Connection & Ping Status
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="flex-1 h-10 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#19221d] hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
              </button>

              {connectionStatus && (
                <span className={`text-[11px] font-mono font-bold px-2.5 py-2 rounded-2xl border ${
                  connectionStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                }`}>
                  {connectionStatus.success ? `🟢 ${connectionStatus.latencyMs}ms` : '🔴 Failed'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Manual Sync Button */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-mono">
            Last Synced: {lastQuotesSyncedAt || 'Live Feeds Active'}
          </div>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isRefreshingQuotes}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingQuotes ? 'animate-spin' : ''}`} />
            <span>Sync All Quotes & Portfolio Now</span>
          </button>
        </div>

        {syncFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-mono text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncFeedback}</span>
          </div>
        )}
      </div>

      {/* 3. Display Preferences Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>Display & Currency Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Base Portfolio Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full h-10 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              {Object.values(CURRENCY_CONFIGS).map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Active User Profile
            </label>
            <select
              value={activeProfile}
              onChange={(e) => setActiveProfile(e.target.value)}
              className="w-full h-10 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              {INITIAL_PROFILES.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.name} ({prof.tagline})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111614]">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Dark Theme</p>
              <p className="text-[11px] text-gray-400">Toggle dark / light appearance</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111614]">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Privacy Numbers Mask</p>
              <p className="text-[11px] text-gray-400">Blur sensitive portfolio totals</p>
            </div>
            <button
              onClick={togglePrivacyMode}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                isPrivacyMode ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isPrivacyMode ? 'Masked' : 'Visible'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Data Portability */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          <span>Backup, Export & Import</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            onClick={onOpenExportModal}
            className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111614]/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 text-left transition-all flex items-center justify-between cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Export & Backup</h4>
              <p className="text-[11px] text-gray-400">Save JSON backup or printable PDF</p>
            </div>
            <Download className="w-4 h-4 text-[#2C6E49] dark:text-emerald-400" />
          </button>

          <button
            onClick={onOpenCsvImport}
            className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111614]/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 text-left transition-all flex items-center justify-between cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Import CSV Spreadsheet</h4>
              <p className="text-[11px] text-gray-400">Zerodha, Groww, or generic CSV</p>
            </div>
            <Upload className="w-4 h-4 text-blue-500" />
          </button>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={resetToDemoData}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reset to Demo Showcase Data</span>
          </button>

          <button
            onClick={() => { if (confirm('Are you sure you want to clear all data?')) clearAllData(); }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
