import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import { Camera, Trash2, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';

interface SnapshotsTimelineProps {
  onOpenSnapshotModal: () => void;
}

export const SnapshotsTimeline: React.FC<SnapshotsTimelineProps> = ({ onOpenSnapshotModal }) => {
  const { profileSnapshots, deleteSnapshot, addSnapshot } = useFinance();

  // Sort descending by date
  const sorted = [...profileSnapshots].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 p-5 xl:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
              Net Worth Milestones & Snapshots
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Monthly portfolio checkpoints
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSnapshotModal}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#2C6E49] to-emerald-700 hover:from-[#225739] hover:to-emerald-800 px-3.5 py-1.5 rounded-2xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Record Snapshot</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800/80 text-gray-400 font-mono">
              <th className="pb-2.5 font-medium">Month / Date</th>
              <th className="pb-2.5 font-medium text-right">Total Assets</th>
              <th className="pb-2.5 font-medium text-right">Liabilities</th>
              <th className="pb-2.5 font-medium text-right">Net Worth</th>
              <th className="pb-2.5 font-medium text-right">MoM Growth</th>
              <th className="pb-2.5 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {sorted.map((snp, index) => {
              const prev = sorted[index + 1];
              const diff = prev ? snp.netWorth - prev.netWorth : 0;
              const diffPct = prev && prev.netWorth > 0 ? ((diff / prev.netWorth) * 100).toFixed(1) : '0';
              const isPositive = diff >= 0;

              return (
                <tr key={snp.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-2.5 font-medium text-gray-900 dark:text-white">
                    {snp.monthLabel}
                    <span className="block text-[10px] text-gray-400 font-normal font-mono">{snp.date}</span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                    <PrivacyValue amountInINR={snp.totalAssets} compact={true} />
                  </td>
                  <td className="py-2.5 text-right font-mono text-rose-500">
                    <PrivacyValue amountInINR={snp.totalLiabilities} compact={true} />
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                    <PrivacyValue amountInINR={snp.netWorth} compact={true} />
                  </td>
                  <td className="py-2.5 text-right">
                    {prev ? (
                      <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium font-mono ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{diffPct}%
                      </span>
                    ) : (
                      <span className="text-gray-400 font-mono text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    <button
                      onClick={() => deleteSnapshot(snp.id)}
                      className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
