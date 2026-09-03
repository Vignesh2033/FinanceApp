import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CashflowItem, CashflowType } from '../../types/finance';
import { PrivacyValue } from '../common/PrivacyValue';
import {
  ArrowUpDown,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  PieChart,
  Calendar,
  Wallet,
  Coins
} from 'lucide-react';

interface CashflowManagerProps {
  onOpenAddCashflow: (itemToEdit?: CashflowItem) => void;
}

export const CashflowManager: React.FC<CashflowManagerProps> = ({ onOpenAddCashflow }) => {
  const {
    profileCashflow,
    deleteCashflowItem,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    monthlySavings,
    savingsRate
  } = useFinance();

  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');

  const incomeItems = profileCashflow.filter(c => c.type === 'income');
  const expenseItems = profileCashflow.filter(c => c.type === 'expense');

  const displayedItems = profileCashflow.filter(c => {
    if (activeFilter === 'income') return c.type === 'income';
    if (activeFilter === 'expense') return c.type === 'expense';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-teal-950/10 via-white to-gray-50 dark:from-[#0f1a16] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-teal-900/20">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Cash Flow & Budget
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track monthly recurring income, living expenses, and target your savings rate
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAddCashflow()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#2C6E49] to-emerald-700 hover:from-[#23583a] hover:to-emerald-800 transition-all shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cash Flow</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            Monthly Income
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5">
            +<PrivacyValue amountInINR={totalMonthlyIncome} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            {incomeItems.length} income streams
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
            Monthly Expenses
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-display mt-0.5">
            -<PrivacyValue amountInINR={totalMonthlyExpenses} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            {expenseItems.length} expense categories
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 font-mono flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
            Monthly Net Savings
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-display mt-0.5">
            +<PrivacyValue amountInINR={monthlySavings} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            Surplus for investing
          </p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 font-mono">
            Savings Rate
          </span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-display mt-0.5 flex items-center gap-2">
            {savingsRate.toFixed(0)}%
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
              {savingsRate >= 50 ? 'FIRE Level' : 'Healthy'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            Benchmark: &gt; 50% for early retirement
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-[#141a17] text-gray-900 dark:text-white font-bold shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Items ({profileCashflow.length})
          </button>
          <button
            onClick={() => setActiveFilter('income')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'income'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Inflow / Income ({incomeItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('expense')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'expense'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Outflow / Expenses ({expenseItems.length})
          </button>
        </div>
      </div>

      {/* Cashflow Table */}
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/80 dark:bg-[#121815]/50 text-gray-400">
                <th className="py-3.5 px-4 font-semibold font-sans">Item & Description</th>
                <th className="py-3.5 px-4 font-semibold font-sans">Category</th>
                <th className="py-3.5 px-4 font-semibold font-sans">Frequency</th>
                <th className="py-3.5 px-4 font-semibold text-right">Monthly Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {displayedItems.map(item => {
                const isIncome = item.type === 'income';

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white font-sans text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{item.title}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-sans">
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 capitalize font-mono">
                      {item.frequency}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                      <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {isIncome ? '+' : '-'}<PrivacyValue amountInINR={item.amount} />
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenAddCashflow(item)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCashflowItem(item.id)}
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
    </div>
  );
};
