import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Liability } from '../../types/finance';
import { PrivacyValue } from '../common/PrivacyValue';
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  ArrowDownRight,
  TrendingDown,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface LiabilityListProps {
  onOpenAddLiability: (liabilityToEdit?: Liability) => void;
  onOpenAmortization: (liability: Liability) => void;
}

export const LiabilityList: React.FC<LiabilityListProps> = ({
  onOpenAddLiability,
  onOpenAmortization
}) => {
  const { profileLiabilities, deleteLiability, totalLiabilityValue, totalAssetValue } = useFinance();

  const totalMonthlyEmi = profileLiabilities.reduce((sum, l) => sum + (l.monthlyEmi || 0), 0);
  const debtToAsset = totalAssetValue > 0 ? (totalLiabilityValue / totalAssetValue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-rose-950/10 via-white to-gray-50 dark:from-[#1a0f12] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold shadow-md shadow-rose-900/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Liabilities & Debt Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Monitor loan amortization, simulate prepayment interest savings, and accelerate debt freedom
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAddLiability()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 transition-all shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Liability</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Total Outstanding Debt
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-display mt-0.5">
            <PrivacyValue amountInINR={totalLiabilityValue} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            {profileLiabilities.length} active loan accounts
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Monthly EMI Commitment
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-0.5">
            <PrivacyValue amountInINR={totalMonthlyEmi} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            Total monthly debt cash outflow
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Debt-to-Asset Leverage
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-0.5 flex items-center gap-2">
            {debtToAsset.toFixed(1)}%
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-xl ${
              debtToAsset <= 20
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : debtToAsset <= 40
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
            }`}>
              {debtToAsset <= 20 ? 'Safe (< 20%)' : debtToAsset <= 40 ? 'Moderate' : 'High Leverage'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            Conservative threshold is under 30%
          </p>
        </div>
      </div>

      {/* Liabilities List */}
      {profileLiabilities.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-[#141a17]/50">
          <Landmark className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            No liabilities recorded
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            You are completely debt-free! If you have mortgages or loans, add them to simulate prepayment savings.
          </p>
          <button
            onClick={() => onOpenAddLiability()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {profileLiabilities.map(liability => {
            const paidPct = liability.originalPrincipal > 0
              ? Math.min(100, Math.max(0, ((liability.originalPrincipal - liability.outstandingBalance) / liability.originalPrincipal) * 100))
              : 0;

            return (
              <div
                key={liability.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-mono">
                      {liability.type}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenAddLiability(liability)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg cursor-pointer"
                        title="Edit Loan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLiability(liability.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                    {liability.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {liability.lender} · {liability.interestRate}% APR
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">Outstanding</span>
                      <div className="font-display font-bold text-base text-rose-600 dark:text-rose-400">
                        <PrivacyValue amountInINR={liability.outstandingBalance} />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">Monthly EMI</span>
                      <div className="font-mono text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                        <PrivacyValue amountInINR={liability.monthlyEmi} />
                      </div>
                    </div>
                  </div>

                  {/* Loan progress bar */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                      <span>Principal Repaid</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{paidPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#2C6E49] rounded-full transition-all duration-500"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-mono">
                      <span>{liability.tenureMonthsRemaining} months left</span>
                      <span>Orig: <PrivacyValue amountInINR={liability.originalPrincipal} compact={true} /></span>
                    </div>
                  </div>
                </div>

                {/* Prepayment Simulator Action */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                  <button
                    onClick={() => onOpenAmortization(liability)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#2C6E49] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Amortize & Prepayment Simulator</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
