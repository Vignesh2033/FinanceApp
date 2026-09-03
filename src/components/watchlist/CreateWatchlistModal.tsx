import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { FolderPlus, Flame, ShieldCheck, Coins, Sparkles, Layers, Briefcase } from 'lucide-react';

interface CreateWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOLDER_PRESETS = [
  { name: '⚡ High Growth & AI', icon: 'Flame', desc: 'Fast-growing tech, semis & momentum stocks' },
  { name: '💰 High Dividend Cash Cows', icon: 'Coins', desc: 'Consistent dividend payers with high yield' },
  { name: '🏛️ Bluechip Core Titans', icon: 'ShieldCheck', desc: 'Indisputable large-cap market leaders' },
  { name: '🔋 EV & Energy Transition', icon: 'Sparkles', desc: 'Electric vehicles, batteries & green power' },
  { name: '🪙 Crypto & Digital Store', icon: 'Coins', desc: 'Bitcoin, Ethereum & Layer-1 crypto assets' },
  { name: '💼 Value & Special Situations', icon: 'Briefcase', desc: 'Undervalued low P/E turnaround bets' }
];

export const CreateWatchlistModal: React.FC<CreateWatchlistModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createWatchlistFolder } = useFinance();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Flame');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createWatchlistFolder(name.trim(), icon, description.trim());
    setName('');
    setDescription('');
    onClose();
  };

  const handleSelectPreset = (preset: typeof FOLDER_PRESETS[0]) => {
    setName(preset.name);
    setDescription(preset.desc);
    setIcon(preset.icon);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Thematic Watchlist"
      subtitle="Organize stocks, ETFs, and crypto by investment strategy or sector"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Preset quick picks */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 font-mono">
            Popular Themes & Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FOLDER_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="p-2 text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#141a17] hover:border-[#2C6E49] transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  {p.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Watchlist Name
            </label>
            <input
              type="text"
              placeholder="e.g. 🎯 Growth Compounders"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18201b] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Strategy Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Quality businesses with >20% ROE"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18201b] text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Watchlist Folder</span>
          </button>
        </form>
      </div>
    </Modal>
  );
};
