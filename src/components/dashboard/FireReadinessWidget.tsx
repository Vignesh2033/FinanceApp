import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { Flame, ShieldCheck, Target, ArrowRight, Sparkles } from 'lucide-react';

export const FireReadinessWidget: React.FC = () => {
  const { netWorth, totalMonthlyExpenses, setActiveTab } = useFinance();

  const annualExpenses = (totalMonthlyExpenses || 80000) * 12;
  const fireTargetCorpus = annualExpenses * 25; // 25x Rule (4% Safe Withdrawal)
  const currentFireMultiple = annualExpenses > 0 ? netWorth / annualExpenses : 0;
  const fireProgressPct = fireTargetCorpus > 0 ? Math.min(100, Math.max(0, (netWorth / fireTargetCorpus) * 100)) : 0;

  const getFireTier = (mult: number) => {
    if (mult >= 35) return { name: 'Fat FIRE (35x+)', color: 'text-amber-500', desc: 'Complete financial abundance' };
    if (mult >= 25) return { name: 'Full FIRE Achieved (25x)', color: 'text-emerald-500', desc: '100% financially independent' };
    if (mult >= 20) return { name: 'Lean FIRE (20x)', color: 'text-teal-500', desc: 'Covers essential lifestyle' };
    if (mult >= 15) return { name: 'Coast FIRE (15x)', color: 'text-blue-500', desc: 'Existing corpus compounds to FIRE' };
    if (mult >= 10) return { name: 'Flamingo FIRE (10x)', color: 'text-purple-500', desc: 'Halfway to financial independence' };
    return { name: 'Building Runway (< 10x)', color: 'text-gray-400', desc: 'Early wealth accumulation' };
  };

  const tier = getFireTier(currentFireMultiple);

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
              FIRE Independence Runway
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Years of freedom based on current annual living expenses
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('calculators')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>FIRE Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-amber-50/40 via-gray-50/50 to-emerald-50/30 dark:from-[#1a1410]/50 dark:via-[#141a17] dark:to-[#101813]/50 border border-amber-200/60 dark:border-amber-900/40">
        <div>
          <span className="text-[10px] uppercase font-mono text-gray-400 block">Independence Multiplier</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {currentFireMultiple.toFixed(1)}x
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-sans mt-0.5">
            {currentFireMultiple.toFixed(1)} Years of Living Expenses
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-gray-400 block">Current Milestone Tier</span>
          <div className={`text-base font-bold font-mono mt-1.5 ${tier.color}`}>
            {tier.name}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-sans mt-0.5">
            {tier.desc}
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-gray-400 block">25x Target Corpus (4% Rule)</span>
          <div className="text-base font-bold font-display text-gray-900 dark:text-white mt-1.5">
            <PrivacyValue amountInINR={fireTargetCorpus} />
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 font-bold">
            {fireProgressPct.toFixed(1)}% Achieved
          </p>
        </div>
      </div>

      {/* Progress meter */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
          <span className="text-gray-500 dark:text-gray-400">0x Start</span>
          <span className="font-bold text-gray-900 dark:text-white">{fireProgressPct.toFixed(1)}% to Full FIRE (25x)</span>
          <span className="text-gray-500 dark:text-gray-400">25x Freedom</span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-teal-500 to-[#2C6E49] rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, fireProgressPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
