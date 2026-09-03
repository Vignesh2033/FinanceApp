import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { WatchlistItem } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';

interface BuyHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: WatchlistItem | null;
}

export const BuyHoldingModal: React.FC<BuyHoldingModalProps> = ({
  isOpen,
  onClose,
  stock
}) => {
  const { convertWatchlistToAsset, setActiveTab } = useFinance();
  const [quantity, setQuantity] = useState<number>(10);
  const [buyPrice, setBuyPrice] = useState<number>(stock?.currentPrice || 100);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (stock) {
      setBuyPrice(stock.currentPrice);
    }
  }, [stock]);

  if (!stock) return null;

  const totalInvestment = quantity * buyPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    convertWatchlistToAsset(stock, quantity, buyPrice);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setActiveTab('assets');
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${stock.symbol} to Portfolio`}
      subtitle={`Convert watched stock directly into an active portfolio asset`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-600 dark:text-gray-400">Current Market Price:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {stock.currency === 'USD' ? '$' : '₹'}{stock.currentPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono mt-1">
            <span className="text-gray-600 dark:text-gray-400">Total Capital Required:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {stock.currency === 'USD' ? '$' : '₹'}{Math.round(totalInvestment).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Shares / Quantity *
            </label>
            <input
              type="number"
              step="any"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Purchase Price ({stock.currency === 'USD' ? '$' : '₹'}) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={buyPrice}
              onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2C6E49] hover:bg-[#23583a] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Added to Assets!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Confirm Holding</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
