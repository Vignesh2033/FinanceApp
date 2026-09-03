import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { INITIAL_PROFILES } from '../../data/initialData';
import { PrivacyValue } from '../common/PrivacyValue';
import {
  Sparkles,
  Plus,
  Camera,
  Target,
  TrendingUp,
  Wallet,
  Landmark,
  ArrowUpDown,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DashboardHeroProps {
  onOpenAddAsset: () => void;
  onOpenAddLiability: () => void;
  onOpenSnapshotModal: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  onOpenAddAsset,
  onOpenAddLiability,
  onOpenSnapshotModal,
}) => {
  const {
    activeProfile,
    netWorth,
    overallUnrealizedGain,
    overallUnrealizedGainPercent,
    setActiveTab,
    isDemoMode
  } = useFinance();

  const currentProfile = INITIAL_PROFILES.find(p => p.id === activeProfile) || INITIAL_PROFILES[0];

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/15 via-white to-gray-50 dark:from-[#0d1612] dark:via-[#141b17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        {/* Profile Avatar Badge */}
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#2C6E49] to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/20 shrink-0">
          {currentProfile.name.charAt(0)}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
              {getGreeting()}, {currentProfile.name}
            </h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE PORTFOLIO</span>
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono flex-wrap">
            <span>{currentProfile.tagline}</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Unrealized Gain: +<PrivacyValue amountInINR={overallUnrealizedGain} compact={true} /> (+{overallUnrealizedGainPercent.toFixed(1)}%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onOpenAddAsset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#2C6E49] to-emerald-700 hover:from-[#23583a] hover:to-emerald-800 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>

        <button
          onClick={onOpenSnapshotModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border border-gray-200/80 dark:border-gray-700 bg-white dark:bg-[#161e1a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer"
          title="Record Monthly Checkpoint"
        >
          <Camera className="w-3.5 h-3.5 text-amber-500" />
          <span>Snapshot</span>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border border-gray-200/80 dark:border-gray-700 bg-white dark:bg-[#161e1a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer"
          title="Stock Watchlist Terminal"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Watchlist</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border border-gray-200/80 dark:border-gray-700 bg-white dark:bg-[#161e1a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer"
          title="Milestone Goals"
        >
          <Target className="w-3.5 h-3.5 text-purple-500" />
          <span>Goals</span>
        </button>
      </div>
    </div>
  );
};
