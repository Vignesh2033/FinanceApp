import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { WatchlistItem, WatchlistAlert } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Bell, Zap, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ShieldCheck, Check } from 'lucide-react';

interface SetStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: WatchlistItem | null;
}

export const SetStockAlertModal: React.FC<SetStockAlertModalProps> = ({
  isOpen,
  onClose,
  stock
}) => {
  const { addStockAlert, stockAlerts, removeStockAlert, toggleStockAlert } = useFinance();

  const [condition, setCondition] = useState<WatchlistAlert['condition']>('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState<number>(() => {
    return stock ? Math.round(stock.currentPrice * 1.05 * 100) / 100 : 1000;
  });
  const [notes, setNotes] = useState<string>('');

  if (!stock) return null;

  const handleConditionChange = (newCond: WatchlistAlert['condition']) => {
    setCondition(newCond);
    if (newCond === 'PRICE_ABOVE') setTargetValue(Math.round(stock.currentPrice * 1.06 * 100) / 100);
    else if (newCond === 'PRICE_BELOW') setTargetValue(Math.round(stock.currentPrice * 0.94 * 100) / 100);
    else if (newCond === 'RSI_BELOW') setTargetValue(35);
    else if (newCond === 'RSI_ABOVE') setTargetValue(75);
    else if (newCond === 'GOLDEN_CROSS') setTargetValue(0);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    addStockAlert({
      stockId: stock.id,
      symbol: stock.symbol,
      condition,
      targetValue,
      isActive: true,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  const currentStockAlerts = stockAlerts.filter(
    a => a.stockId === stock.id || a.symbol.toUpperCase() === stock.symbol.toUpperCase()
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Price & Technical Alerts · ${stock.symbol}`}
      subtitle={`LTP: ${stock.currency === 'USD' ? '$' : '₹'}${stock.currentPrice.toLocaleString()}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 font-mono">
              Alert Trigger Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleConditionChange('PRICE_ABOVE')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 cursor-pointer transition-all ${
                  condition === 'PRICE_ABOVE'
                    ? 'border-[#2C6E49] bg-emerald-50 dark:bg-emerald-950/40 text-[#2C6E49] dark:text-emerald-300 font-bold'
                    : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>Price Crosses Above</span>
              </button>

              <button
                type="button"
                onClick={() => handleConditionChange('PRICE_BELOW')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 cursor-pointer transition-all ${
                  condition === 'PRICE_BELOW'
                    ? 'border-[#2C6E49] bg-emerald-50 dark:bg-emerald-950/40 text-[#2C6E49] dark:text-emerald-300 font-bold'
                    : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
                <span>Price Dips Below</span>
              </button>

              <button
                type="button"
                onClick={() => handleConditionChange('RSI_BELOW')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 cursor-pointer transition-all ${
                  condition === 'RSI_BELOW'
                    ? 'border-[#2C6E49] bg-emerald-50 dark:bg-emerald-950/40 text-[#2C6E49] dark:text-emerald-300 font-bold'
                    : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>RSI Oversold Dip (&lt; 35)</span>
              </button>

              <button
                type="button"
                onClick={() => handleConditionChange('GOLDEN_CROSS')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 cursor-pointer transition-all ${
                  condition === 'GOLDEN_CROSS'
                    ? 'border-[#2C6E49] bg-emerald-50 dark:bg-emerald-950/40 text-[#2C6E49] dark:text-emerald-300 font-bold'
                    : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>50/200 DMA Breakout</span>
              </button>
            </div>
          </div>

          {condition !== 'GOLDEN_CROSS' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-mono">
                {condition.startsWith('RSI') ? 'Target RSI Value' : `Target Price (${stock.currency === 'USD' ? '$' : '₹'})`}
              </label>
              <input
                type="number"
                step={condition.startsWith('RSI') ? '1' : '0.5'}
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                required
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18201b] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-mono">
              Alert Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Accumulate 50 shares on breakout"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18201b] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Set Alert Notification</span>
          </button>
        </form>

        {/* Existing Alerts on this Stock */}
        {currentStockAlerts.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <h4 className="text-[11px] font-bold uppercase font-mono text-gray-400">
              Active Alerts for {stock.symbol} ({currentStockAlerts.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {currentStockAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#141a17] border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {alert.condition === 'PRICE_ABOVE' && `Price ≥ ${stock.currency === 'USD' ? '$' : '₹'}${alert.targetValue}`}
                      {alert.condition === 'PRICE_BELOW' && `Price ≤ ${stock.currency === 'USD' ? '$' : '₹'}${alert.targetValue}`}
                      {alert.condition === 'RSI_BELOW' && `RSI ≤ ${alert.targetValue}`}
                      {alert.condition === 'RSI_ABOVE' && `RSI ≥ ${alert.targetValue}`}
                      {alert.condition === 'GOLDEN_CROSS' && `50/200 DMA Breakout`}
                    </span>
                    {alert.notes && (
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5">{alert.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStockAlert(alert.id)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                        alert.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {alert.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => removeStockAlert(alert.id)}
                      className="text-gray-400 hover:text-rose-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
