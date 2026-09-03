import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { parseSpreadsheetFile, parseBrokerCsv, exportAssetsToExcel } from '../../utils/csvParser';
import { Asset } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  FileCode
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importAssets, activeProfile, currency, isPrivacyMode } = useFinance();
  const [parsedAssets, setParsedAssets] = useState<Asset[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? 'Excel' : 'CSV');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const assets = await parseSpreadsheetFile(file, activeProfile);
      if (assets.length === 0) {
        setErrorMessage('No valid asset rows found. Please check column headers (Name, Current Value, Invested Value).');
      }
      setParsedAssets(assets);
    } catch (err: any) {
      console.error('File parse error:', err);
      setErrorMessage('Could not read spreadsheet. Please ensure it is a valid .csv, .xls, or .xlsx file.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleZerodhaData = () => {
    const sample = `Instrument,Qty.,Avg. cost,LTP,Cur. val,P&L,Net chg.
HDFCBANK,250,1520.00,1690.00,422500.00,42500.00,11.18%
INFY,400,1400.00,1820.00,728000.00,168000.00,30.00%
TCS,100,3200.00,3950.00,395000.00,75000.00,23.44%
GOLDBEES,1200,48.50,62.00,74400.00,16200.00,27.84%
SGBMAY29,50,4800.00,7100.00,355000.00,115000.00,47.92%`;
    setFileName('sample_zerodha_holdings.csv');
    setFileType('CSV Demo');
    setErrorMessage('');
    const assets = parseBrokerCsv(sample, activeProfile);
    setParsedAssets(assets);
  };

  const downloadExcelTemplate = () => {
    const sampleTemplateAssets: Asset[] = [
      {
        id: 'tpl-1',
        name: 'HDFC Bank Ltd',
        category: 'Equity',
        subCategory: 'Direct Stock (Large Cap)',
        institution: 'Zerodha Kite',
        currentValue: 845000,
        investedValue: 620000,
        currency: 'INR',
        profileId: 'personal',
        updatedAt: new Date().toISOString().split('T')[0]
      },
      {
        id: 'tpl-2',
        name: 'Parag Parikh Flexi Cap Fund',
        category: 'Mutual Funds',
        subCategory: 'Flexi Cap Direct',
        institution: 'Groww',
        currentValue: 1250000,
        investedValue: 900000,
        currency: 'INR',
        profileId: 'personal',
        updatedAt: new Date().toISOString().split('T')[0]
      },
      {
        id: 'tpl-3',
        name: 'Sovereign Gold Bonds (SGB)',
        category: 'Precious Metals',
        subCategory: 'SGB Series VII',
        institution: 'RBI / Zerodha',
        currentValue: 550000,
        investedValue: 350000,
        currency: 'INR',
        profileId: 'personal',
        updatedAt: new Date().toISOString().split('T')[0]
      }
    ];

    exportAssetsToExcel(sampleTemplateAssets, 'FinBoom_Asset_Import_Template.xlsx');
  };

  const handleImport = () => {
    if (parsedAssets.length === 0) return;
    importAssets(parsedAssets);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Spreadsheets (XLS, XLSX & CSV)"
      subtitle="Universal import support for Excel workbooks, CAMS/KFintech statements, and Zerodha/Groww exports"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Upload Zone */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#121815]/50 text-center relative hover:border-emerald-500 transition-colors">
          <input
            type="file"
            accept=".csv, .xls, .xlsx, .ods, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#2C6E49] dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {fileName ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {fileName} ({fileType})
              </span>
            ) : (
              'Click to upload or drag & drop .XLS, .XLSX, or .CSV file'
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Compatible with Microsoft Excel (.xls, .xlsx), Zerodha Kite, Groww, IndMoney, CAMS / KFintech statements
          </p>

          {/* Helper buttons */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); loadSampleZerodhaData(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Zerodha Holdings</span>
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); downloadExcelTemplate(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold hover:bg-blue-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xlsx) Template</span>
            </button>
          </div>
        </div>

        {/* Zerodha Quick Guide Accordion/Card */}
        <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-[#111614]/70 border border-gray-100 dark:border-gray-800/80 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            How to export from Zerodha:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
            <li><strong className="text-gray-700 dark:text-gray-300">Zerodha Kite:</strong> Go to <em>Holdings</em> tab $\to$ click the <em>Download XLSX/CSV</em> button.</li>
            <li><strong className="text-gray-700 dark:text-gray-300">Zerodha Console:</strong> Go to <em>Reports</em> $\to$ <em>Holdings</em> $\to$ click <em>Download XLSX</em>.</li>
            <li><strong className="text-gray-700 dark:text-gray-300">Auto-Categorization:</strong> Stocks, SGBs, Gold/Silver ETFs, Index ETFs (NIFTYBEES), Liquid ETFs, and REITs are detected automatically!</li>
          </ul>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="p-3 text-center text-xs text-gray-500 font-mono">
            Parsing Excel worksheet & reading data...
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Parsed Assets Preview */}
        {parsedAssets.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Detected {parsedAssets.length} Valid Holdings
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                Total Valuation: {formatCurrency(parsedAssets.reduce((s, a) => s + a.currentValue, 0), currency, false, isPrivacyMode)}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#111614] text-gray-400 font-mono sticky top-0">
                    <th className="py-2 px-3">Asset</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Invested</th>
                    <th className="py-2 px-3 text-right">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono">
                  {parsedAssets.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/50">
                      <td className="py-2 px-3 font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[160px]">{a.name}</td>
                      <td className="py-2 px-3 text-gray-500">{a.category}</td>
                      <td className="py-2 px-3 text-right text-gray-500">{formatCurrency(a.investedValue, currency, true, isPrivacyMode)}</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(a.currentValue, currency, true, isPrivacyMode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedAssets.length === 0 || isSuccess}
            onClick={handleImport}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Imported Successfully!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import {parsedAssets.length} Assets</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
