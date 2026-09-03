import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Download,
  Upload,
  FileText,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ isOpen, onClose }) => {
  const {
    assets,
    liabilities,
    cashflow,
    goals,
    snapshots,
    essentials,
    restoreBackup,
    resetToDemoData,
    clearAllData,
    netWorth,
    totalAssetValue,
    totalLiabilityValue,
    profileAssets,
    currency
  } = useFinance();

  const [restoreStatus, setRestoreStatus] = useState<string>('');

  // 1. Export JSON Backup
  const handleExportJson = () => {
    const backupData = {
      version: '2.4',
      exportDate: new Date().toISOString(),
      netWorth,
      assets,
      liabilities,
      cashflow,
      goals,
      snapshots,
      essentials
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `FinBoom_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 2. Restore JSON Backup
  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        restoreBackup(parsed);
        setRestoreStatus('Portfolio restored successfully!');
        setTimeout(() => {
          setRestoreStatus('');
          onClose();
        }, 1500);
      } catch (err) {
        setRestoreStatus('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  // 3. Generate PDF Wealth Statement
  const handleGeneratePdf = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(44, 110, 73); // FinBoom Green
    doc.text('FinBoom · Confidential Wealth Statement', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })} · 100% Client-Side Private Report`, 14, 28);

    // Summary Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 248);
    doc.roundedRect(14, 34, 182, 26, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Consolidated Net Worth: ${formatCurrency(netWorth, currency, false, false)}`, 20, 44);
    doc.text(`Total Assets: ${formatCurrency(totalAssetValue, currency, false, false)}   |   Total Liabilities: ${formatCurrency(totalLiabilityValue, currency, false, false)}`, 20, 52);

    // Assets Table
    const tableData = profileAssets.map(a => [
      a.name,
      a.category,
      a.institution,
      formatCurrency(a.investedValue, currency, false, false),
      formatCurrency(a.currentValue, currency, false, false),
      `${a.investedValue > 0 ? (((a.currentValue - a.investedValue) / a.investedValue) * 100).toFixed(1) : 0}%`
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['Asset Name', 'Category', 'Institution', 'Invested', 'Current Value', 'Gain %']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [44, 110, 73] },
      styles: { fontSize: 8 }
    });

    doc.save(`FinBoom_Wealth_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Portability & Backup"
      subtitle="Complete offline privacy. Backup, restore, or export printable PDF statements"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Export JSON Backup */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Full JSON Backup</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Download your entire encrypted local database
            </p>
          </div>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2C6E49] text-white text-xs font-semibold hover:bg-[#23583a] shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>

        {/* Generate Printable PDF Statement */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Printable PDF Statement</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Generate executive wealth summary with tables
            </p>
          </div>
          <button
            onClick={handleGeneratePdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17] flex items-center justify-between relative">
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Restore from Backup</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Upload a previously downloaded .json file
            </p>
          </div>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreJson}
              className="hidden"
            />
          </label>
        </div>

        {restoreStatus && (
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{restoreStatus}</span>
          </div>
        )}

        {/* Danger Zone / Sample Reset */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => { resetToDemoData(); onClose(); }}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reload Showcase Demo Data</span>
          </button>

          <button
            onClick={() => { if (confirm('Are you sure you want to clear all personal data?')) { clearAllData(); onClose(); } }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Local Data</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
