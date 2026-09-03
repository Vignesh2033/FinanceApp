import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export const EssentialsScorecard: React.FC = () => {
  const { essentials, totalAssetValue } = useFinance();

  const currentRunwayMonths = essentials.emergencyFund.currentMonthsCovered;
  const isEmergencyFundAdequate = currentRunwayMonths >= essentials.emergencyFund.targetMonths;

  let healthScore = 50;
  if (essentials.termInsurance.active) healthScore += 20;
  if (essentials.healthInsurance.active) healthScore += 20;
  if (isEmergencyFundAdequate) healthScore += 10;

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
              Financial Essentials Check
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Protection against health, life, and market emergencies
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
          Health: {healthScore}/100
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3 gap-3">
        {/* 1. Term Insurance */}
        <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#121815]/50 flex items-start gap-3">
          <div className="mt-0.5">
            {essentials.termInsurance.active ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                Term Life Cover
              </p>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                <PrivacyValue amountInINR={essentials.termInsurance.coverAmount} compact={true} />
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {essentials.termInsurance.insurer}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
              ✓ Adequate (10-15x income)
            </p>
          </div>
        </div>

        {/* 2. Health Cover */}
        <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#121815]/50 flex items-start gap-3">
          <div className="mt-0.5">
            {essentials.healthInsurance.active ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                Health Floater
              </p>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                <PrivacyValue amountInINR={essentials.healthInsurance.coverAmount} compact={true} />
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {essentials.healthInsurance.insurer}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
              ✓ Family Floater Protected
            </p>
          </div>
        </div>

        {/* 3. Emergency Runway */}
        <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#121815]/50 flex items-start gap-3">
          <div className="mt-0.5">
            {isEmergencyFundAdequate ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                Emergency Runway
              </p>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                {currentRunwayMonths} Months
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Liquid Cash & FDs reserved
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
              ✓ Target: 6 months living costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
