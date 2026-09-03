import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { ArrowUpDown, ArrowRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const CashflowOverview: React.FC = () => {
  const {
    totalMonthlyIncome,
    totalMonthlyExpenses,
    monthlySavings,
    savingsRate,
    profileCashflow,
    setActiveTab
  } = useFinance();

  // Top expenses
  const expensesList = profileCashflow
    .filter(c => c.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                Monthly Cash Flow
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Income, expenses & savings rate
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('cashflow')}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Income vs Expense Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" /> Income
            </span>
            <div className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              +<PrivacyValue amountInINR={totalMonthlyIncome} compact={true} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
            <span className="text-[11px] font-medium text-rose-800 dark:text-rose-300 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Outflow
            </span>
            <div className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
              -<PrivacyValue amountInINR={totalMonthlyExpenses} compact={true} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <span className="text-[11px] font-medium text-blue-800 dark:text-blue-300">
              Savings %
            </span>
            <div className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">
              {savingsRate.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Top Expense breakdown */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 font-mono">
            Key Outflows
          </span>
          <div className="space-y-2">
            {expensesList.map(exp => {
              const pct = totalMonthlyExpenses > 0 ? ((exp.amount / totalMonthlyExpenses) * 100).toFixed(0) : 0;
              return (
                <div key={exp.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px] font-medium">
                      {exp.category}
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white font-semibold">
                      <PrivacyValue amountInINR={exp.amount} compact={true} />
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500/80 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Monthly Surplus: <span className="font-semibold text-emerald-600 dark:text-emerald-400"><PrivacyValue amountInINR={monthlySavings} compact={true} /></span></span>
        <span className="font-medium text-[11px] bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
          {savingsRate >= 50 ? '🔥 High Savings' : 'Healthy'}
        </span>
      </div>
    </div>
  );
};
