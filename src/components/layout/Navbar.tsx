import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CURRENCY_CONFIGS, INITIAL_PROFILES } from '../../data/initialData';
import { CurrencyCode } from '../../types/finance';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Plus,
  TrendingUp,
  CreditCard,
  Target,
  Sparkles,
  ChevronDown,
  Camera,
  FileSpreadsheet
} from 'lucide-react';

interface NavbarProps {
  onOpenAddAsset: () => void;
  onOpenAddLiability: () => void;
  onOpenAddCashflow: () => void;
  onOpenAddGoal: () => void;
  onOpenCsvImport: () => void;
  onOpenSnapshotModal: () => void;
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddAsset,
  onOpenAddLiability,
  onOpenAddCashflow,
  onOpenAddGoal,
  onOpenCsvImport,
  onOpenSnapshotModal,
  onOpenMobileSidebar,
}) => {
  const {
    currency,
    setCurrency,
    activeProfile,
    setActiveProfile,
    isPrivacyMode,
    togglePrivacyMode,
    isDarkMode,
    toggleDarkMode,
    isDemoMode,
    resetToDemoData,
    addSnapshot
  } = useFinance();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const isAnyMenuOpen = showQuickAdd || showCurrencyMenu || showProfileMenu;
  const closeAllMenus = () => {
    setShowQuickAdd(false);
    setShowCurrencyMenu(false);
    setShowProfileMenu(false);
  };

  const currentProfile = INITIAL_PROFILES.find(p => p.id === activeProfile) || INITIAL_PROFILES[0];

  return (
    <>
      {/* Invisible backdrop to dismiss menus on outside click */}
      {isAnyMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={closeAllMenus}
        />
      )}

      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#101613]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/80 transition-colors">
        <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2C6E49] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                P
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
                  PersonalPortfolioApp
                </span>
                <span className="ml-2 hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#2C6E49] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 text-[#2C6E49] dark:text-emerald-400" />
                  <span>100% Private</span>
                </span>
              </div>
            </div>

            {/* Showcase Data badge */}
            {isDemoMode && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Demo Portfolio</span>
              </span>
            )}
          </div>

          {/* Center: Live Global Market Pulse Ticker */}
          <div className="hidden xl:flex items-center gap-4 text-[11px] font-mono text-gray-500 dark:text-gray-400 border-l border-r border-gray-100 dark:border-gray-800 px-4 py-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">NIFTY 50</span>
              <span className="text-gray-900 dark:text-white font-bold">24,180.20</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+0.42%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 dark:text-gray-300">SENSEX</span>
              <span className="text-gray-900 dark:text-white font-bold">79,450.15</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+0.38%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 dark:text-gray-300">NASDAQ</span>
              <span className="text-gray-900 dark:text-white font-bold">19,840.40</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+1.15%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 dark:text-gray-300">BTC</span>
              <span className="text-gray-900 dark:text-white font-bold">$79,652</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+1.58%</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Add Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCurrencyMenu(false);
                  setShowProfileMenu(false);
                  setShowQuickAdd(!showQuickAdd);
                }}
                className="flex items-center gap-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-1.5 rounded-lg shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {showQuickAdd && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161e1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-50 animate-fade-in"
                >
                  <button
                    onClick={() => { closeAllMenus(); onOpenAddAsset(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Add Asset / Holding</span>
                  </button>
                  <button
                    onClick={() => { closeAllMenus(); onOpenAddLiability(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-rose-500" />
                    <span>Add Loan / Liability</span>
                  </button>
                  <button
                    onClick={() => { closeAllMenus(); onOpenAddCashflow(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-blue-500" />
                    <span>Add Cashflow / Expense</span>
                  </button>
                  <button
                    onClick={() => { closeAllMenus(); onOpenAddGoal(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Target className="w-4 h-4 text-purple-500" />
                    <span>Create Financial Goal</span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                  <button
                    onClick={() => { closeAllMenus(); onOpenSnapshotModal ? onOpenSnapshotModal() : addSnapshot(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>Take Net Worth Snapshot</span>
                  </button>
                  <button
                    onClick={() => { closeAllMenus(); onOpenCsvImport(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-500" />
                    <span>Import Broker XLS / CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Privacy Toggle (Mask values with ••••••) */}
            <button
              onClick={togglePrivacyMode}
              title={isPrivacyMode ? "Privacy Mode ON (Masked)" : "Turn ON Privacy Mask"}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isPrivacyMode
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Currency Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  setShowProfileMenu(false);
                  setShowCurrencyMenu(!showCurrencyMenu);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-gray-100 cursor-pointer"
              >
                <span>{CURRENCY_CONFIGS[currency]?.symbol}</span>
                <span className="font-mono">{currency}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showCurrencyMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161e1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-50 animate-fade-in max-h-72 overflow-y-auto"
                >
                  <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Select Base Currency
                  </div>
                  {Object.values(CURRENCY_CONFIGS).map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        closeAllMenus();
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer ${
                        currency === curr.code ? 'font-bold text-[#2C6E49] dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{curr.name}</span>
                      <span className="font-mono text-gray-400 font-normal">{curr.symbol} {curr.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  setShowCurrencyMenu(false);
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${currentProfile.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}>
                  {currentProfile.name.charAt(0)}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{currentProfile.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161e1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-50 animate-fade-in"
                >
                  <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Switch Profile
                  </div>
                  {INITIAL_PROFILES.map(prof => (
                    <button
                      key={prof.id}
                      onClick={() => {
                        setActiveProfile(prof.id);
                        closeAllMenus();
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer ${
                        activeProfile === prof.id ? 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${prof.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}>
                        {prof.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{prof.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{prof.tagline}</p>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                  <button
                    onClick={() => {
                      resetToDemoData();
                      closeAllMenus();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reload Showcase Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>

          </div>
        </div>
      </header>
    </>
  );
};
