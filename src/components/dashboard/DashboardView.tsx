import React from 'react';
import { DashboardHero } from './DashboardHero';
import { MetricCards } from './MetricCards';
import { NetWorthChart } from './NetWorthChart';
import { TopMoversWidget } from './TopMoversWidget';
import { FireReadinessWidget } from './FireReadinessWidget';
import { AssetAllocation } from './AssetAllocation';
import { CashflowOverview } from './CashflowOverview';
import { EssentialsScorecard } from './EssentialsScorecard';
import { SnapshotsTimeline } from './SnapshotsTimeline';

interface DashboardViewProps {
  onOpenAddAsset: () => void;
  onOpenAddLiability: () => void;
  onOpenSnapshotModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddAsset,
  onOpenAddLiability,
  onOpenSnapshotModal,
}) => {
  return (
    <div className="space-y-6 max-w-full animate-fade-in">
      {/* 1. Personalized Dynamic Dashboard Hero & Quick Actions */}
      <DashboardHero
        onOpenAddAsset={onOpenAddAsset}
        onOpenAddLiability={onOpenAddLiability}
        onOpenSnapshotModal={onOpenSnapshotModal}
      />

      {/* 2. Top High-Level Wealth Metric Cards */}
      <MetricCards
        onOpenAddAsset={onOpenAddAsset}
        onOpenAddLiability={onOpenAddLiability}
      />

      {/* 3. Visual Graphs & Multi-Column Intelligence Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Net Worth Trajectory Chart, Growth Drivers & Milestones */}
        <div className="xl:col-span-7 2xl:col-span-8 space-y-6">
          <NetWorthChart onOpenSnapshotModal={onOpenSnapshotModal} />
          <TopMoversWidget />
          <SnapshotsTimeline onOpenSnapshotModal={onOpenSnapshotModal} />
        </div>

        {/* Right Column: Allocation, FIRE Runway, Cashflow & Essentials Check */}
        <div className="xl:col-span-5 2xl:col-span-4 space-y-6">
          <AssetAllocation />
          <FireReadinessWidget />
          <CashflowOverview />
          <EssentialsScorecard />
        </div>
      </div>
    </div>
  );
};
