import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { Asset, AssetCategory, CurrencyCode, YahooSearchResult } from '../../types/finance';
import { CURRENCY_CONFIGS } from '../../data/initialData';
import { searchYahooFinance, fetchYahooQuote } from '../../utils/yahooFinance';
import { Search, Globe, Zap, Loader2, Check } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
}

const CATEGORIES: { id: AssetCategory; label: string; subCategories: string[]; defaultInstitutions: string[] }[] = [
  {
    id: 'Equity',
    label: 'Equity (Stocks & ESOPs)',
    subCategories: ['Direct Stock (Large Cap)', 'Direct Stock (Mid/Small Cap)', 'US Equities', 'ESOPs / RSUs', 'Unlisted Shares'],
    defaultInstitutions: ['Zerodha Kite', 'Groww', 'Indmoney / Vested', 'Upstox', 'Angel One', 'Direct']
  },
  {
    id: 'Mutual Funds',
    label: 'Mutual Funds & ETFs',
    subCategories: ['Flexi Cap / Multi Cap', 'Large Cap / Index Fund', 'Small / Mid Cap Fund', 'Debt / Hybrid Fund', 'International Fund'],
    defaultInstitutions: ['Zerodha Coin', 'Groww', 'Kuvera', 'Indmoney', 'MF Central', 'CAMS']
  },
  {
    id: 'Govt & EPF/PPF',
    label: 'Govt & EPF / PPF / NPS',
    subCategories: ['EPF (Employee Provident Fund)', 'PPF (Public Provident Fund)', 'NPS (Tier I & II)', 'SSY (Sukanya Samriddhi)', 'VPF / Gratuity', 'RBI Floating Bonds'],
    defaultInstitutions: ['EPFO India', 'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Post Office', 'Protean / KFintech']
  },
  {
    id: 'Precious Metals',
    label: 'Precious Metals & Gold',
    subCategories: ['Sovereign Gold Bonds (SGB)', 'Physical 24K Gold / Bullion', 'Digital Gold', 'Physical / Digital Silver'],
    defaultInstitutions: ['RBI / Zerodha', 'Tanishq / MMTC', 'Bank Locker', 'Jar / SafeGold']
  },
  {
    id: 'Real Estate',
    label: 'Real Estate & REITs',
    subCategories: ['Residential Apartment / Villa', 'Commercial Property', 'Plot / Agricultural Land', 'Commercial REIT'],
    defaultInstitutions: ['Self / Property Registry', 'Embassy REIT', 'Mindspace REIT', 'Nexus REIT']
  },
  {
    id: 'Fixed Income & Deposits',
    label: 'Fixed Deposits & Bonds',
    subCategories: ['Bank Fixed Deposit (FD)', 'Recurring Deposit (RD)', 'Corporate Bond / NCD', 'Senior Citizen Savings Scheme'],
    defaultInstitutions: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Bajaj Finance', 'Shriram Finance']
  },
  {
    id: 'Cash & Bank',
    label: 'Cash & Liquid Bank Accounts',
    subCategories: ['Savings Account', 'Liquid Mutual Fund', 'Emergency Cash Reserve', 'Current Account'],
    defaultInstitutions: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Kotak Bank', 'Axis Bank']
  },
  {
    id: 'Crypto & Alternate',
    label: 'Crypto & Alternative Assets',
    subCategories: ['Cryptocurrency (Cold Storage / Hardware)', 'Crypto Exchange Holding', 'P2P Lending', 'Startup Angel Investment'],
    defaultInstitutions: ['Ledger / Trezor', 'CoinDCX', 'WazirX', 'Binance', '13Karat / Faircent']
  },
  {
    id: 'Other Assets',
    label: 'Other Assets & Collectibles',
    subCategories: ['Vehicle (Car / Bike)', 'Jewellery & Watches', 'Art & Collectibles', 'Life Insurance Surrender Value'],
    defaultInstitutions: ['Self', 'Insurance Policy', 'Direct Registry']
  }
];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  assetToEdit
}) => {
  const { addAsset, updateAsset, activeProfile } = useFinance();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Equity');
  const [subCategory, setSubCategory] = useState('Direct Stock (Large Cap)');
  const [institution, setInstitution] = useState('Zerodha Kite');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [investedValue, setInvestedValue] = useState<string>('');
  const [units, setUnits] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [notes, setNotes] = useState('');
  const [yahooTicker, setYahooTicker] = useState('');

  // Live Yahoo Ticker Lookup in Modal
  const [tickerQuery, setTickerQuery] = useState('');
  const [isSearchingYahoo, setIsSearchingYahoo] = useState(false);
  const [yahooResults, setYahooResults] = useState<YahooSearchResult[]>([]);
  const [selectedLivePrice, setSelectedLivePrice] = useState<number | null>(null);

  // Debounced search on Yahoo Finance
  useEffect(() => {
    if (!tickerQuery.trim() || tickerQuery.trim().length < 2) {
      setYahooResults([]);
      setIsSearchingYahoo(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingYahoo(true);
      try {
        const results = await searchYahooFinance(tickerQuery.trim());
        setYahooResults(results);
      } catch {
        setYahooResults([]);
      } finally {
        setIsSearchingYahoo(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [tickerQuery]);

  // Populate form if editing
  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setCategory(assetToEdit.category);
      setSubCategory(assetToEdit.subCategory);
      setInstitution(assetToEdit.institution);
      setCurrentValue(String(assetToEdit.currentValue));
      setInvestedValue(String(assetToEdit.investedValue));
      setUnits(assetToEdit.units ? String(assetToEdit.units) : '');
      setCurrency(assetToEdit.currency);
      setNotes(assetToEdit.notes || '');
      setYahooTicker(assetToEdit.yahooTicker || '');
      setTickerQuery('');
      setYahooResults([]);
      setSelectedLivePrice(assetToEdit.nav || null);
    } else {
      setName('');
      setCategory('Equity');
      setSubCategory('Direct Stock (Large Cap)');
      setInstitution('Zerodha Kite');
      setCurrentValue('');
      setInvestedValue('');
      setUnits('');
      setCurrency('INR');
      setNotes('');
      setYahooTicker('');
      setTickerQuery('');
      setYahooResults([]);
      setSelectedLivePrice(null);
    }
  }, [assetToEdit, isOpen]);

  // Handle selecting a ticker result
  const handleSelectYahooTicker = async (res: YahooSearchResult) => {
    setName(res.name);
    setYahooTicker(res.symbol);
    setCurrency(res.currency);
    setTickerQuery('');
    setYahooResults([]);

    // Fetch quote
    try {
      const quote = await fetchYahooQuote(res.symbol);
      if (quote && quote.currentPrice > 0) {
        setSelectedLivePrice(quote.currentPrice);
        if (units && parseFloat(units) > 0) {
          const computed = Math.round(parseFloat(units) * quote.currentPrice * 100) / 100;
          setCurrentValue(String(computed));
          if (!investedValue) setInvestedValue(String(computed));
        } else {
          setCurrentValue(String(quote.currentPrice));
          if (!investedValue) setInvestedValue(String(quote.currentPrice));
        }
      }
    } catch {
      //
    }
  };

  // Recompute current value when units changes if live price is known
  const handleUnitsChange = (newUnits: string) => {
    setUnits(newUnits);
    const parsed = parseFloat(newUnits);
    if (!isNaN(parsed) && parsed > 0 && selectedLivePrice && selectedLivePrice > 0) {
      const computed = Math.round(parsed * selectedLivePrice * 100) / 100;
      setCurrentValue(String(computed));
    }
  };

  // Handle category change to update subcategories
  const handleCategoryChange = (cat: AssetCategory) => {
    setCategory(cat);
    const catConfig = CATEGORIES.find(c => c.id === cat);
    if (catConfig) {
      setSubCategory(catConfig.subCategories[0] || '');
      setInstitution(catConfig.defaultInstitutions[0] || 'Direct');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const curVal = parseFloat(currentValue) || 0;
    const invVal = parseFloat(investedValue) || curVal;
    const parsedUnits = units ? parseFloat(units) : undefined;

    if (assetToEdit) {
      updateAsset({
        ...assetToEdit,
        name: name.trim(),
        category,
        subCategory,
        institution: institution.trim() || 'Direct',
        currentValue: curVal,
        investedValue: invVal,
        units: parsedUnits,
        nav: selectedLivePrice || assetToEdit.nav,
        currency,
        notes: notes.trim(),
        yahooTicker: yahooTicker.trim() || undefined,
        updatedAt: new Date().toISOString().split('T')[0]
      });
    } else {
      addAsset({
        name: name.trim(),
        category,
        subCategory,
        institution: institution.trim() || 'Direct',
        currentValue: curVal,
        investedValue: invVal,
        units: parsedUnits,
        nav: selectedLivePrice || undefined,
        currency,
        notes: notes.trim(),
        profileId: activeProfile,
        yahooTicker: yahooTicker.trim() || undefined
      });
    }

    onClose();
  };

  const activeCatConfig = CATEGORIES.find(c => c.id === category);
  const isMarketLinked = ['Equity', 'Mutual Funds', 'Crypto & Alternate', 'Precious Metals'].includes(category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assetToEdit ? 'Edit Asset' : 'Add New Asset'}
      subtitle="Track stocks, mutual funds, EPF, gold, real estate, and deposits"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Asset Class / Category
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as AssetCategory)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Yahoo Finance Ticker Lookup Helper for Market-Linked Assets */}
        {isMarketLinked && (
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Yahoo Finance Live Ticker (Optional)</span>
              </label>
              {yahooTicker && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 font-bold">
                  Linked: {yahooTicker}
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search symbol e.g. RELIANCE, TCS, AAPL, GOLDBEES, BTC-USD..."
                value={tickerQuery}
                onChange={(e) => setTickerQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-xl border border-emerald-300/80 dark:border-emerald-700 bg-white dark:bg-[#161f1a] text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {isSearchingYahoo && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                </div>
              )}
            </div>

            {/* Dropdown search matches */}
            {yahooResults.length > 0 && (
              <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141a17]">
                {yahooResults.map(res => (
                  <div
                    key={res.symbol}
                    onClick={() => handleSelectYahooTicker(res)}
                    className="p-2 px-3 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer text-xs"
                  >
                    <div>
                      <span className="font-bold font-mono text-gray-900 dark:text-white">{res.symbol}</span>{' '}
                      <span className="text-gray-500 text-[11px] truncate">{res.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {res.exchDisp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Asset Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Asset Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. HDFC Bank, Parag Parikh Flexi Cap, EPF Balance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Sub Category & Institution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Sub-Category
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {activeCatConfig?.subCategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Institution / Platform
            </label>
            <input
              type="text"
              placeholder="e.g. Zerodha, Groww, EPFO"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Values: Current & Invested */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Current Market Value ({currency === 'USD' ? '$' : '₹'}) *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 500000"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Invested Amount ({currency === 'USD' ? '$' : '₹'})
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 400000"
              value={investedValue}
              onChange={(e) => setInvestedValue(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Units & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Units / Quantity (Optional)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 100 shares or grams"
              value={units}
              onChange={(e) => handleUnitsChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {Object.values(CURRENCY_CONFIGS).map(curr => (
                <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code} - {curr.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Notes / Account Tag (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly SIP ₹15k, Folio #12345, Maturity 2029"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {assetToEdit ? 'Save Changes' : 'Add Asset'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
