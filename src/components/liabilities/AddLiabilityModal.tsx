import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { Liability, LiabilityType } from '../../types/finance';

interface AddLiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  liabilityToEdit?: Liability | null;
}

const LOAN_TYPES: LiabilityType[] = [
  'Home Loan',
  'Car Loan',
  'Education Loan',
  'Personal Loan',
  'Credit Card',
  'Other'
];

export const AddLiabilityModal: React.FC<AddLiabilityModalProps> = ({
  isOpen,
  onClose,
  liabilityToEdit
}) => {
  const { addLiability, updateLiability, activeProfile } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<LiabilityType>('Home Loan');
  const [lender, setLender] = useState('HDFC Bank');
  const [originalPrincipal, setOriginalPrincipal] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');
  const [interestRate, setInterestRate] = useState('8.5');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [tenureMonths, setTenureMonths] = useState('120');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (liabilityToEdit) {
      setName(liabilityToEdit.name);
      setType(liabilityToEdit.type);
      setLender(liabilityToEdit.lender);
      setOriginalPrincipal(String(liabilityToEdit.originalPrincipal));
      setOutstandingBalance(String(liabilityToEdit.outstandingBalance));
      setInterestRate(String(liabilityToEdit.interestRate));
      setMonthlyEmi(String(liabilityToEdit.monthlyEmi));
      setTenureMonths(String(liabilityToEdit.tenureMonthsRemaining));
      setStartDate(liabilityToEdit.startDate);
      setNotes(liabilityToEdit.notes || '');
    } else {
      setName('');
      setType('Home Loan');
      setLender('HDFC Bank');
      setOriginalPrincipal('');
      setOutstandingBalance('');
      setInterestRate('8.5');
      setMonthlyEmi('');
      setTenureMonths('120');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [liabilityToEdit, isOpen]);

  // Auto calculate estimated EMI when Principal, Rate, Tenure change
  const autoCalculateEmi = () => {
    const p = parseFloat(outstandingBalance || originalPrincipal);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(tenureMonths);
    if (p > 0 && r >= 0 && n > 0) {
      if (r === 0) {
        setMonthlyEmi(String(Math.round(p / n)));
      } else {
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setMonthlyEmi(String(Math.round(emi)));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const orig = parseFloat(originalPrincipal) || parseFloat(outstandingBalance) || 0;
    const out = parseFloat(outstandingBalance) || orig;
    const rate = parseFloat(interestRate) || 0;
    const emi = parseFloat(monthlyEmi) || 0;
    const tenure = parseInt(tenureMonths) || 12;

    if (liabilityToEdit) {
      updateLiability({
        ...liabilityToEdit,
        name: name.trim(),
        type,
        lender: lender.trim(),
        originalPrincipal: orig,
        outstandingBalance: out,
        interestRate: rate,
        monthlyEmi: emi,
        tenureMonthsRemaining: tenure,
        startDate,
        notes: notes.trim()
      });
    } else {
      addLiability({
        name: name.trim(),
        type,
        lender: lender.trim(),
        originalPrincipal: orig,
        outstandingBalance: out,
        interestRate: rate,
        monthlyEmi: emi,
        tenureMonthsRemaining: tenure,
        startDate,
        profileId: activeProfile,
        notes: notes.trim()
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={liabilityToEdit ? 'Edit Liability / Loan' : 'Add Loan / Liability'}
      subtitle="Track mortgages, vehicle loans, education debt, and credit balances"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Loan Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LiabilityType)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {LOAN_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lender / Bank
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Bank, SBI, ICICI"
              value={lender}
              onChange={(e) => setLender(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Loan Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Home Loan (Whitefield Apartment), Nexon EV Loan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Outstanding Balance (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 2180000"
              value={outstandingBalance}
              onChange={(e) => setOutstandingBalance(e.target.value)}
              onBlur={autoCalculateEmi}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Original Principal (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 3500000"
              value={originalPrincipal}
              onChange={(e) => setOriginalPrincipal(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Interest Rate (% APR)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 8.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              onBlur={autoCalculateEmi}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Remaining Months
            </label>
            <input
              type="number"
              placeholder="e.g. 120"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(e.target.value)}
              onBlur={autoCalculateEmi}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Monthly EMI (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 24500"
              value={monthlyEmi}
              onChange={(e) => setMonthlyEmi(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Notes / Account Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Loan A/c #99882211, Fixed/Floating"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm active:scale-95"
          >
            {liabilityToEdit ? 'Save Changes' : 'Add Liability'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
