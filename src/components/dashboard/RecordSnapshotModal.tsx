import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { Camera, Calendar, CheckCircle2 } from 'lucide-react';

interface RecordSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordSnapshotModal: React.FC<RecordSnapshotModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addSnapshot, netWorth, totalAssetValue, totalLiabilityValue } = useFinance();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSnapshot(date);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Net Worth Snapshot"
      subtitle="Save a monthly checkpoint to track your long-term wealth growth"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Total Assets:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              <PrivacyValue amountInINR={totalAssetValue} />
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Total Liabilities:</span>
            <span className="font-mono font-bold text-rose-500">
              <PrivacyValue amountInINR={totalLiabilityValue} />
            </span>
          </div>
          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Net Worth Snapshot:</span>
            <span className="text-base font-bold font-display text-emerald-700 dark:text-emerald-400">
              <PrivacyValue amountInINR={netWorth} />
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Snapshot Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Recorded!</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Record Checkpoint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
