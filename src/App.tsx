import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssetList } from './components/assets/AssetList';
import { AddAssetModal } from './components/assets/AddAssetModal';
import { WatchlistView } from './components/watchlist/WatchlistView';
import { AddStockModal } from './components/watchlist/AddStockModal';
import { StockDetailModal } from './components/watchlist/StockDetailModal';
import { BuyHoldingModal } from './components/watchlist/BuyHoldingModal';
import { LiabilityList } from './components/liabilities/LiabilityList';
import { AddLiabilityModal } from './components/liabilities/AddLiabilityModal';
import { LoanAmortizationModal } from './components/liabilities/LoanAmortizationModal';
import { CashflowManager } from './components/cashflow/CashflowManager';
import { AddTransactionModal } from './components/cashflow/AddTransactionModal';
import { GoalList } from './components/goals/GoalList';
import { AddGoalModal } from './components/goals/AddGoalModal';
import { CalculatorSuite } from './components/calculators/CalculatorSuite';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SectorBalancingView } from './components/sector-balancing/SectorBalancingView';
import { MarketSentimentView } from './components/market-sentiment/MarketSentimentView';
import { SettingsView } from './components/settings/SettingsView';
import { CsvImportModal } from './components/import-export/CsvImportModal';
import { DataBackupModal } from './components/import-export/DataBackupModal';
import { CloudSyncModal } from './components/cloud/CloudSyncModal';
import { RecordSnapshotModal } from './components/dashboard/RecordSnapshotModal';
import { Asset, Liability, CashflowItem, Goal, WatchlistItem } from './types/finance';

const MainAppContent: React.FC = () => {
  const { activeTab } = useFinance();

  // Modals state
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedDetailStock, setSelectedDetailStock] = useState<WatchlistItem | null>(null);
  const [isDetailStockOpen, setIsDetailStockOpen] = useState(false);

  const [selectedBuyStock, setSelectedBuyStock] = useState<WatchlistItem | null>(null);
  const [isBuyStockOpen, setIsBuyStockOpen] = useState(false);

  const [isAddLiabilityOpen, setIsAddLiabilityOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  const [isAmortizationOpen, setIsAmortizationOpen] = useState(false);
  const [amortizationLiability, setAmortizationLiability] = useState<Liability | null>(null);

  const [isAddCashflowOpen, setIsAddCashflowOpen] = useState(false);
  const [editingCashflow, setEditingCashflow] = useState<CashflowItem | null>(null);

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isDataBackupOpen, setIsDataBackupOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal Triggers
  const handleOpenAddAsset = (assetToEdit?: Asset) => {
    setEditingAsset(assetToEdit || null);
    setIsAddAssetOpen(true);
  };

  const handleOpenStockDetail = (stock: WatchlistItem) => {
    setSelectedDetailStock(stock);
    setIsDetailStockOpen(true);
  };

  const handleOpenBuyStock = (stock: WatchlistItem) => {
    setSelectedBuyStock(stock);
    setIsBuyStockOpen(true);
  };

  const handleOpenAddLiability = (liabilityToEdit?: Liability) => {
    setEditingLiability(liabilityToEdit || null);
    setIsAddLiabilityOpen(true);
  };

  const handleOpenAmortization = (liability: Liability) => {
    setAmortizationLiability(liability);
    setIsAmortizationOpen(true);
  };

  const handleOpenAddCashflow = (itemToEdit?: CashflowItem) => {
    setEditingCashflow(itemToEdit || null);
    setIsAddCashflowOpen(true);
  };

  const handleOpenAddGoal = (goalToEdit?: Goal) => {
    setEditingGoal(goalToEdit || null);
    setIsAddGoalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] dark:bg-[#0d1210] text-[#1a1f1c] dark:text-[#f0f4f1] transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenAddAsset={() => handleOpenAddAsset()}
        onOpenAddLiability={() => handleOpenAddLiability()}
        onOpenAddCashflow={() => handleOpenAddCashflow()}
        onOpenAddGoal={() => handleOpenAddGoal()}
        onOpenCsvImport={() => setIsCsvImportOpen(true)}
        onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
      />

      {/* Sidebar & Main View Layout */}
      <div className="w-full flex">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenExportModal={() => setIsDataBackupOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 w-full p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4rem)] max-w-[1750px]">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddAsset={() => handleOpenAddAsset()}
              onOpenAddLiability={() => handleOpenAddLiability()}
              onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
            />
          )}

          {activeTab === 'assets' && (
            <AssetList
              onOpenAddAsset={handleOpenAddAsset}
              onOpenCsvImport={() => setIsCsvImportOpen(true)}
            />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistView
              onOpenAddStock={() => setIsAddStockOpen(true)}
              onOpenDetailModal={handleOpenStockDetail}
              onOpenBuyModal={handleOpenBuyStock}
            />
          )}

          {activeTab === 'sector_balancing' && (
            <SectorBalancingView />
          )}

          {activeTab === 'market_radar' && (
            <MarketSentimentView />
          )}

          {activeTab === 'liabilities' && (
            <LiabilityList
              onOpenAddLiability={handleOpenAddLiability}
              onOpenAmortization={handleOpenAmortization}
            />
          )}

          {activeTab === 'cashflow' && (
            <CashflowManager
              onOpenAddCashflow={handleOpenAddCashflow}
            />
          )}

          {activeTab === 'goals' && (
            <GoalList
              onOpenAddGoal={handleOpenAddGoal}
            />
          )}

          {activeTab === 'calculators' && (
            <CalculatorSuite />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenExportModal={() => setIsDataBackupOpen(true)}
              onOpenCsvImport={() => setIsCsvImportOpen(true)}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals Container */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />

      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => { setIsAddAssetOpen(false); setEditingAsset(null); }}
        assetToEdit={editingAsset}
      />

      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
      />

      <StockDetailModal
        isOpen={isDetailStockOpen}
        onClose={() => { setIsDetailStockOpen(false); setSelectedDetailStock(null); }}
        stock={selectedDetailStock}
        onOpenBuyModal={handleOpenBuyStock}
      />

      <BuyHoldingModal
        isOpen={isBuyStockOpen}
        onClose={() => { setIsBuyStockOpen(false); setSelectedBuyStock(null); }}
        stock={selectedBuyStock}
      />

      <AddLiabilityModal
        isOpen={isAddLiabilityOpen}
        onClose={() => { setIsAddLiabilityOpen(false); setEditingLiability(null); }}
        liabilityToEdit={editingLiability}
      />

      <LoanAmortizationModal
        isOpen={isAmortizationOpen}
        onClose={() => { setIsAmortizationOpen(false); setAmortizationLiability(null); }}
        liability={amortizationLiability}
      />

      <AddTransactionModal
        isOpen={isAddCashflowOpen}
        onClose={() => { setIsAddCashflowOpen(false); setEditingCashflow(null); }}
        itemToEdit={editingCashflow}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => { setIsAddGoalOpen(false); setEditingGoal(null); }}
        goalToEdit={editingGoal}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />

      <DataBackupModal
        isOpen={isDataBackupOpen}
        onClose={() => setIsDataBackupOpen(false)}
      />

      <RecordSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}

export default App;
