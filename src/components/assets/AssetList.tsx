import React, { useState, useMemo } from 'react';
import { useFinance, CATEGORY_COLORS } from '../../context/FinanceContext';
import { Asset, AssetCategory } from '../../types/finance';
import { PrivacyValue } from '../common/PrivacyValue';
import { exportAssetsToCsv, exportAssetsToExcel } from '../../utils/csvParser';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Download,
  LayoutGrid,
  List,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  FileText,
  X,
  Coins,
  Wallet,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface AssetListProps {
  onOpenAddAsset: (assetToEdit?: Asset) => void;
  onOpenCsvImport: () => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  onOpenAddAsset,
  onOpenCsvImport
}) => {
  const {
    profileAssets,
    deleteAsset,
    totalAssetValue,
    totalInvestedValue,
    overallUnrealizedGain,
    overallUnrealizedGainPercent,
    syncAssetPricesFromYahoo,
    isRefreshingQuotes,
    lastQuotesSyncedAt
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'name'>('value');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncLivePrices = async () => {
    const res = await syncAssetPricesFromYahoo();
    if (res.updatedCount > 0) {
      setSyncMessage(`Successfully updated ${res.updatedCount} holdings with real-time Yahoo Finance market prices!`);
    } else {
      setSyncMessage(`All eligible holdings are up to date.`);
    }
    setTimeout(() => {
      setSyncMessage(null);
    }, 4500);
  };

  // Categories list with count
  const categories: { id: string; label: string; count: number }[] = useMemo(() => {
    const counts: Record<string, number> = {};
    profileAssets.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    const list = [
      { id: 'ALL', label: 'All Assets', count: profileAssets.length },
      { id: 'Equity', label: 'Equity', count: counts['Equity'] || 0 },
      { id: 'Mutual Funds', label: 'Mutual Funds', count: counts['Mutual Funds'] || 0 },
      { id: 'Govt & EPF/PPF', label: 'Govt & EPF/PPF', count: counts['Govt & EPF/PPF'] || 0 },
      { id: 'Precious Metals', label: 'Gold & Metals', count: counts['Precious Metals'] || 0 },
      { id: 'Real Estate', label: 'Real Estate', count: counts['Real Estate'] || 0 },
      { id: 'Fixed Income & Deposits', label: 'Fixed Deposits', count: counts['Fixed Income & Deposits'] || 0 },
      { id: 'Cash & Bank', label: 'Cash & Bank', count: counts['Cash & Bank'] || 0 },
      { id: 'Crypto & Alternate', label: 'Crypto & Alternate', count: counts['Crypto & Alternate'] || 0 },
    ];
    return list.filter(c => c.id === 'ALL' || c.count > 0);
  }, [profileAssets]);

  // Filtered and Sorted Assets
  const filteredAssets = useMemo(() => {
    return profileAssets
      .filter(a => {
        const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
        const matchesSearch =
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'value') return b.currentValue - a.currentValue;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'gain') {
          const gainA = a.investedValue > 0 ? (a.currentValue - a.investedValue) / a.investedValue : 0;
          const gainB = b.investedValue > 0 ? (b.currentValue - b.investedValue) / b.investedValue : 0;
          return gainB - gainA;
        }
        return 0;
      });
  }, [profileAssets, selectedCategory, searchQuery, sortBy]);

  // Export handlers
  const handleExportCsv = () => {
    const csvData = exportAssetsToCsv(profileAssets);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PersonalPortfolio_Assets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportAssetsToExcel(profileAssets);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-blue-950/10 via-white to-gray-50 dark:from-[#0d161d] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Assets Portfolio
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track and manage investments across {categories.length - 1} active asset classes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Export Dropdown (Excel / CSV) */}
          <div className="relative">
            {showExportMenu && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowExportMenu(false)}
              />
            )}

            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border border-gray-200/80 dark:border-gray-700 bg-white dark:bg-[#161e1a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer relative z-40"
              title="Download Portfolio"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#161e1a] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-50 animate-fade-in"
              >
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>CSV File (.csv)</span>
                </button>
              </div>
            )}
          </div>

          {/* Yahoo Finance Live Sync Button */}
          <button
            onClick={handleSyncLivePrices}
            disabled={isRefreshingQuotes}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Sync latest live market prices for Equities, Crypto & ETFs from Yahoo Finance"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshingQuotes ? 'animate-spin' : ''}`} />
            <span>{isRefreshingQuotes ? 'Syncing...' : 'Sync Live Prices'}</span>
          </button>

          <button
            onClick={onOpenCsvImport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import XLS / CSV</span>
          </button>

          <button
            onClick={() => onOpenAddAsset()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#2C6E49] to-emerald-700 hover:from-[#23583a] hover:to-emerald-800 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast Banner */}
      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-900 dark:text-emerald-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Portfolio Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Total Asset Value
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-0.5">
            <PrivacyValue amountInINR={totalAssetValue} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            {profileAssets.length} total holdings
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Total Invested Cost
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-0.5">
            <PrivacyValue amountInINR={totalInvestedValue} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            Net capital basis
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Overall Unrealized Gain
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5 flex items-center gap-2">
            +<PrivacyValue amountInINR={overallUnrealizedGain} />
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              +{overallUnrealizedGainPercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
            Compounded net returns
          </p>
        </div>
      </div>

      {/* Category Pills Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#2C6E49] text-white shadow-xs'
                : 'bg-white dark:bg-[#141a17] text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:border-gray-300'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
              selectedCategory === cat.id ? 'bg-white/20 text-white font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search, Sort, and View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset name, broker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141a17] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

        {/* Sort and View Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141a17] text-xs text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="value">Highest Value</option>
              <option value="gain">Highest Return %</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-[#141a17] text-gray-900 dark:text-white shadow-xs font-bold' : 'text-gray-400'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'cards' ? 'bg-white dark:bg-[#141a17] text-gray-900 dark:text-white shadow-xs font-bold' : 'text-gray-400'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Asset List Content */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-[#141a17]/50">
          <TrendingUp className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            No assets found
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Try changing your search keywords or category filters.'
              : 'Start by tracking your stocks, mutual funds, EPF, real estate, or gold.'}
          </p>
          <button
            onClick={() => onOpenAddAsset()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Asset</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/80 dark:bg-[#121815]/50 text-gray-400">
                  <th className="py-3.5 px-4 font-semibold font-sans">Asset Name</th>
                  <th className="py-3.5 px-4 font-semibold font-sans">Category / Broker</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Invested Value</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Current Value</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Gain / Loss</th>
                  <th className="py-3.5 px-4 font-semibold text-center font-sans">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {filteredAssets.map(asset => {
                  const gain = asset.currentValue - asset.investedValue;
                  const gainPct = asset.investedValue > 0 ? (gain / asset.investedValue) * 100 : 0;
                  const isPositive = gain >= 0;
                  const catColor = CATEGORY_COLORS[asset.category] || '#64748b';

                  return (
                    <tr key={asset.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-white font-sans text-sm">
                          {asset.name}
                        </div>
                        {asset.notes && (
                          <div className="text-[11px] text-gray-400 font-sans truncate max-w-xs mt-0.5">
                            {asset.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {asset.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                          {asset.institution} · {asset.subCategory}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-gray-600 dark:text-gray-400 font-medium">
                        <PrivacyValue amountInINR={asset.investedValue} />
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white text-sm">
                        <PrivacyValue amountInINR={asset.currentValue} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className={`font-mono font-bold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          <PrivacyValue amountInINR={Math.abs(gain)} />
                        </div>
                        <span className={`text-[10px] font-mono block mt-0.5 ${
                          isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                        }`}>
                          {isPositive ? '+' : ''}{gainPct.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenAddAsset(asset)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteAsset(asset.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => {
            const gain = asset.currentValue - asset.investedValue;
            const gainPct = asset.investedValue > 0 ? (gain / asset.investedValue) * 100 : 0;
            const isPositive = gain >= 0;
            const catColor = CATEGORY_COLORS[asset.category] || '#64748b';

            return (
              <div
                key={asset.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                      style={{ backgroundColor: `${catColor}15`, color: catColor }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                      {asset.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenAddAsset(asset)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAsset(asset.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white text-base truncate">
                    {asset.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {asset.institution} · {asset.subCategory}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">Current</span>
                      <div className="font-display font-bold text-base text-gray-900 dark:text-white">
                        <PrivacyValue amountInINR={asset.currentValue} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">Invested</span>
                      <div className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <PrivacyValue amountInINR={asset.investedValue} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400 font-mono">Gain / Loss:</span>
                  <span className={`font-mono font-bold ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  }`}>
                    {isPositive ? '+' : ''}{gainPct.toFixed(1)}% (+<PrivacyValue amountInINR={Math.abs(gain)} compact={true} />)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
