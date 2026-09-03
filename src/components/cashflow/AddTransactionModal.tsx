import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { CashflowItem, CashflowType, CashflowFrequency } from '../../types/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: CashflowItem | null;
}

const INCOME_CATEGORIES = [
  'Salary (Primary)',
  'Freelance / Consulting',
  'Dividends & Interest',
  'Rental Income',
  'Business Profit',
  'Bonus / Incentive',
  'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Housing & Rent',
  'Loan EMIs',
  'Groceries & Household',
  'Dining & Food Delivery',
  'Utilities & Bills',
  'Fuel & Transportation',
  'Health & Medical',
  'Insurance Premiums',
  'Shopping & Lifestyle',
  'Entertainment & Travel',
  'Education & Kids',
  'Charity / Family Support',
  'Miscellaneous'
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  itemToEdit
}) => {
  const { addCashflowItem, updateCashflowItem, activeProfile } = useFinance();

  const [type, setType] = useState<CashflowType>('expense');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<CashflowFrequency>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type);
      setTitle(itemToEdit.title);
      setCategory(itemToEdit.category);
      setAmount(String(itemToEdit.amount));
      setFrequency(itemToEdit.frequency);
      setDate(itemToEdit.date);
    } else {
      setType('expense');
      setTitle('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setAmount('');
      setFrequency('monthly');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [itemToEdit, isOpen]);

  const handleTypeChange = (newType: CashflowType) => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const numAmount = parseFloat(amount) || 0;

    if (itemToEdit) {
      updateCashflowItem({
        ...itemToEdit,
        type,
        title: title.trim(),
        category,
        amount: numAmount,
        frequency,
        date
      });
    } else {
      addCashflowItem({
        type,
        title: title.trim(),
        category,
        amount: numAmount,
        frequency,
        date,
        profileId: activeProfile
      });
    }

    onClose();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Cash Flow Item' : 'Add Cash Flow / Expense'}
      subtitle="Track recurring income streams and monthly expenditures"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Income vs Expense */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            + Income Stream
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            - Expense / Outflow
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Description / Label *
          </label>
          <input
            type="text"
            required
            placeholder={type === 'income' ? 'e.g. Primary Tech Salary, Consulting Fee' : 'e.g. Apartment Maintenance, Supermarket Groceries'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Amount and Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as CashflowFrequency)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="monthly">Monthly (Recurring)</option>
              <option value="annual">Annual</option>
              <option value="one-time">One-Time</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Date / Day of Month
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm active:scale-95 ${
              type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {itemToEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
