import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../../types/finance';
import {
  LayoutDashboard,
  Coins,
  TrendingUp,
  Landmark,
  ArrowUpDown,
  Target,
  Calculator,
  PieChart,
  Scale,
  Gauge,
  Settings,
  ShieldCheck,
  DownloadCloud
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenExportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  onOpenExportModal
}) => {
  const { activeTab, setActiveTab, profileAssets, profileLiabilities, profileGoals, watchlist } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Assets', icon: Coins, badge: profileAssets.length },
    { id: 'watchlist', label: 'Stock Watchlist', icon: TrendingUp, badge: watchlist.length },
    { id: 'sector_balancing', label: 'Sector Balancing', icon: Scale },
    { id: 'market_radar', label: 'Market Sentiment', icon: Gauge },
    { id: 'liabilities', label: 'Liabilities & Debt', icon: Landmark, badge: profileLiabilities.length },
    { id: 'cashflow', label: 'Cash Flow & Budget', icon: ArrowUpDown },
    { id: 'goals', label: 'Goals & FIRE', icon: Target, badge: profileGoals.length },
    { id: 'calculators', label: 'Financial Calculators', icon: Calculator },
    { id: 'analytics', label: 'Wealth Analytics', icon: PieChart },
    { id: 'settings', label: 'Data & Backup', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#fafaf7]/95 dark:bg-[#0d1210]/95 backdrop-blur-md border-r border-gray-200/80 dark:border-gray-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between p-4 overflow-y-auto`}
      >
        <div className="space-y-2">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono">
            Navigation
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2C6E49] text-white shadow-sm shadow-emerald-900/20 font-bold scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Privacy Card */}
        <div className="space-y-3 pt-4 border-t border-gray-200/80 dark:border-gray-800">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-left shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Private Offline</span>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
              Your wealth data is encrypted and stored locally in your browser.
            </p>
            <button
              onClick={onOpenExportModal}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Export Portfolio</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
