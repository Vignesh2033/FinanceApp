import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Liability } from '../../types/finance';
import { calculateLoanAmortization } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { Sparkles, Calendar, DollarSign, ArrowDownRight, Clock } from 'lucide-react';

interface LoanAmortizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  liability: Liability | null;
}

export const LoanAmortizationModal: React.FC<LoanAmortizationModalProps> = ({
  isOpen,
  onClose,
  liability
}) => {
  const { currency, isPrivacyMode } = useFinance();

  const [extraMonthly, setExtraMonthly] = useState<number>(5000);
  const [lumpsumMonth, setLumpsumMonth] = useState<number>(12);
  const [lumpsumAmount, setLumpsumAmount] = useState<number>(100000);
  const [viewType, setViewType] = useState<'yearly' | 'monthly'>('yearly');

  const amortizationResult = useMemo(() => {
    if (!liability) return null;
    return calculateLoanAmortization(
      liability.outstandingBalance,
      liability.interestRate,
      liability.tenureMonthsRemaining,
      extraMonthly,
      lumpsumMonth,
      lumpsumAmount
    );
  }, [liability, extraMonthly, lumpsumMonth, lumpsumAmount]);

  if (!liability || !amortizationResult) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Amortization & Prepayment: ${liability.name}`}
      subtitle={`${liability.lender} · Outstanding: ${formatCurrency(liability.outstandingBalance, currency, false, isPrivacyMode)} @ ${liability.interestRate}% APR`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Prepayment Impact Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <span className="text-[11px] font-semibold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Interest Saved
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5">
              +<PrivacyValue amountInINR={amortizationResult.interestSaved} />
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Reduced from {formatCurrency(amortizationResult.totalInterestWithoutPrepayment, currency, true, isPrivacyMode)}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase text-blue-800 dark:text-blue-300 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Time Saved
            </span>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-display mt-0.5">
              {amortizationResult.monthsSaved} Months
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {(amortizationResult.monthsSaved / 12).toFixed(1)} years faster payoff!
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase text-purple-800 dark:text-purple-300 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              New Loan Duration
            </span>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-display mt-0.5">
              {amortizationResult.schedule.length} Months
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Down from {liability.tenureMonthsRemaining} months
            </p>
          </div>
        </div>

        {/* Interactive Prepayment Controls */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121815]/50 space-y-3.5">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase font-mono">
            Prepayment Simulator Controls
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                Extra Monthly EMI (₹)
              </label>
              <input
                type="number"
                step="500"
                value={extraMonthly}
                onChange={(e) => setExtraMonthly(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                Lumpsum Prepayment (₹)
              </label>
              <input
                type="number"
                step="10000"
                value={lumpsumAmount}
                onChange={(e) => setLumpsumAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                At Month #
              </label>
              <input
                type="number"
                min="1"
                max={liability.tenureMonthsRemaining}
                value={lumpsumMonth}
                onChange={(e) => setLumpsumMonth(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Schedule View Toggle & Table */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase font-mono text-gray-500 dark:text-gray-400">
              Amortization Schedule Breakdown
            </h4>

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setViewType('yearly')}
                className={`px-2.5 py-1 rounded-md ${viewType === 'yearly' ? 'bg-white dark:bg-[#151c18] font-bold text-[#2C6E49] dark:text-emerald-400 shadow-xs' : 'text-gray-500'}`}
              >
                Yearly
              </button>
              <button
                onClick={() => setViewType('monthly')}
                className={`px-2.5 py-1 rounded-md ${viewType === 'monthly' ? 'bg-white dark:bg-[#151c18] font-bold text-[#2C6E49] dark:text-emerald-400 shadow-xs' : 'text-gray-500'}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#111614] text-gray-400 font-mono sticky top-0">
                  <th className="py-2.5 px-3 font-medium">{viewType === 'yearly' ? 'Year' : 'Month'}</th>
                  <th className="py-2.5 px-3 font-medium text-right">Principal Paid</th>
                  <th className="py-2.5 px-3 font-medium text-right">Interest Paid</th>
                  <th className="py-2.5 px-3 font-medium text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono">
                {viewType === 'yearly' ? (
                  amortizationResult.yearlySchedule.map(row => (
                    <tr key={row.year} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                      <td className="py-2 px-3 font-bold text-gray-800 dark:text-gray-200">Year {row.year}</td>
                      <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">
                        <PrivacyValue amountInINR={row.principalPaid} />
                      </td>
                      <td className="py-2 px-3 text-right text-rose-500">
                        <PrivacyValue amountInINR={row.interestPaid} />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">
                        <PrivacyValue amountInINR={row.endingBalance} />
                      </td>
                    </tr>
                  ))
                ) : (
                  amortizationResult.schedule.map(row => (
                    <tr key={row.month} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Month {row.month}</td>
                      <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">
                        <PrivacyValue amountInINR={row.principal + row.prepayment} />
                      </td>
                      <td className="py-2 px-3 text-right text-rose-500">
                        <PrivacyValue amountInINR={row.interest} />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">
                        <PrivacyValue amountInINR={row.closingBalance} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
