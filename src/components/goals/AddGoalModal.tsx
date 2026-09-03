import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { Goal, GoalCategory } from '../../types/finance';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

const GOAL_CATEGORIES: { id: GoalCategory; label: string; icon: string; defaultTarget: number }[] = [
  { id: 'FIRE', label: 'Financial Independence / Early Retirement (FIRE)', icon: 'Flame', defaultTarget: 50000000 },
  { id: 'Emergency', label: 'Emergency Fund (6-12 Months)', icon: 'ShieldCheck', defaultTarget: 600000 },
  { id: 'Education', label: "Child's Higher Education", icon: 'GraduationCap', defaultTarget: 4000000 },
  { id: 'Home', label: 'Buy A Dream Home', icon: 'Home', defaultTarget: 8000000 },
  { id: 'Travel', label: 'Luxury Vacation / Travel', icon: 'Plane', defaultTarget: 500000 },
  { id: 'Vehicle', label: 'Car / Vehicle Purchase', icon: 'Car', defaultTarget: 1500000 },
  { id: 'Custom', label: 'Custom Goal', icon: 'Target', defaultTarget: 1000000 },
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit
}) => {
  const { addGoal, updateGoal, activeProfile } = useFinance();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('FIRE');
  const [targetAmount, setTargetAmount] = useState('50000000');
  const [targetYear, setTargetYear] = useState(String(new Date().getFullYear() + 10));
  const [currentAmount, setCurrentAmount] = useState('0');
  const [monthlyContribution, setMonthlyContribution] = useState('50000');
  const [expectedReturnRate, setExpectedReturnRate] = useState('12');
  const [expectedInflationRate, setExpectedInflationRate] = useState('6');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setCategory(goalToEdit.category);
      setTargetAmount(String(goalToEdit.targetAmount));
      setTargetYear(String(goalToEdit.targetYear));
      setCurrentAmount(String(goalToEdit.currentAmount));
      setMonthlyContribution(String(goalToEdit.monthlyContribution));
      setExpectedReturnRate(String(goalToEdit.expectedReturnRate));
      setExpectedInflationRate(String(goalToEdit.expectedInflationRate));
    } else {
      setTitle('Financial Independence (FIRE)');
      setCategory('FIRE');
      setTargetAmount('50000000');
      setTargetYear(String(new Date().getFullYear() + 10));
      setCurrentAmount('0');
      setMonthlyContribution('50000');
      setExpectedReturnRate('12');
      setExpectedInflationRate('6');
    }
  }, [goalToEdit, isOpen]);

  const handleCategoryChange = (cat: GoalCategory) => {
    setCategory(cat);
    const found = GOAL_CATEGORIES.find(c => c.id === cat);
    if (found && !goalToEdit) {
      setTitle(found.label.split('(')[0].trim());
      setTargetAmount(String(found.defaultTarget));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tAmt = parseFloat(targetAmount) || 0;
    const cAmt = parseFloat(currentAmount) || 0;
    const mContrib = parseFloat(monthlyContribution) || 0;
    const retRate = parseFloat(expectedReturnRate) || 12;
    const infRate = parseFloat(expectedInflationRate) || 6;
    const yr = parseInt(targetYear) || (new Date().getFullYear() + 5);

    if (goalToEdit) {
      updateGoal({
        ...goalToEdit,
        title: title.trim(),
        category,
        targetAmount: tAmt,
        targetYear: yr,
        currentAmount: cAmt,
        monthlyContribution: mContrib,
        expectedReturnRate: retRate,
        expectedInflationRate: infRate,
      });
    } else {
      addGoal({
        title: title.trim(),
        category,
        targetAmount: tAmt,
        targetYear: yr,
        currentAmount: cAmt,
        monthlyContribution: mContrib,
        expectedReturnRate: retRate,
        expectedInflationRate: infRate,
        profileId: activeProfile
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Financial Goal' : 'Create Financial Goal'}
      subtitle="Set target milestones with inflation adjustments and SIP planning"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Goal Type
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as GoalCategory)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {GOAL_CATEGORIES.map(g => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Goal Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Goal Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Early Retirement FIRE, Child Harvard Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Target Amount & Target Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Target Corpus (₹ in Today's value) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 50000000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Target Completion Year *
            </label>
            <input
              type="number"
              required
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 50}
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Current Saved & Monthly SIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Already Saved / Allocated (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 2000000"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Monthly SIP Dedicated (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Rates: Return & Inflation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Expected Return (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Expected Inflation (% p.a.)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedInflationRate}
              onChange={(e) => setExpectedInflationRate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
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
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-sm active:scale-95"
          >
            {goalToEdit ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
