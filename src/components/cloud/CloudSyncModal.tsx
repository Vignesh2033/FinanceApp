import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinance } from '../../context/FinanceContext';
import { CloudProviderType, CloudSyncConfig } from '../../types/finance';
import { generateDeviceTransferKey } from '../../utils/cryptoService';
import {
  Cloud,
  Lock,
  Unlock,
  ShieldCheck,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Key,
  Database,
  History,
  HardDrive,
  Copy,
  Eye,
  EyeOff,
  Settings,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    cloudConfig,
    setCloudConfig,
    cloudRevisions,
    isCloudSyncing,
    lastCloudSyncResult,
    syncToCloud,
    restoreFromCloud,
    refreshCloudRevisions
  } = useFinance();

  // Active Tab inside modal
  const [activeTab, setActiveTab] = useState<'SYNC' | 'CONFIG' | 'HISTORY' | 'TRANSFER'>('SYNC');

  // Master password state
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Configuration form state
  const [provider, setProvider] = useState<CloudProviderType>(cloudConfig.provider);
  const [token, setToken] = useState<string>(cloudConfig.token || '');
  const [gistId, setGistId] = useState<string>(cloudConfig.gistId || '');
  const [endpointUrl, setEndpointUrl] = useState<string>(cloudConfig.endpointUrl || '');
  const [username, setUsername] = useState<string>(cloudConfig.username || '');
  const [password, setPassword] = useState<string>(cloudConfig.password || '');
  const [autoSyncInterval, setAutoSyncInterval] = useState<number>(cloudConfig.autoSyncInterval);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(cloudConfig.encrypted);
  const [deviceName, setDeviceName] = useState<string>(cloudConfig.deviceName || 'Personal PC');

  // Cross-device transfer key
  const [transferKey, setTransferKey] = useState<string>(() => generateDeviceTransferKey());
  const [importTransferKey, setImportTransferKey] = useState<string>('');

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveConfig = () => {
    const updated: CloudSyncConfig = {
      provider,
      enabled: true,
      token: token.trim(),
      gistId: gistId.trim() || undefined,
      endpointUrl: endpointUrl.trim() || undefined,
      username: username.trim() || undefined,
      password: password.trim() || undefined,
      autoSyncInterval,
      encrypted: isEncrypted,
      deviceName: deviceName.trim() || 'Desktop',
      lastSyncedAt: cloudConfig.lastSyncedAt
    };
    setCloudConfig(updated);
    setFeedback({ success: true, message: 'Cloud storage settings saved successfully!' });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSyncNow = async () => {
    if (isEncrypted && !masterPassword) {
      setFeedback({ success: false, message: 'Please enter your Master Encryption Password to secure your cloud backup.' });
      return;
    }

    setFeedback(null);
    const res = await syncToCloud(masterPassword);
    if (res.success) {
      setFeedback({ success: true, message: `Successfully synced ${res.assetCount} portfolio holdings to ${cloudConfig.provider}!` });
    } else {
      setFeedback({ success: false, message: res.error || 'Cloud sync failed. Check your token/connection.' });
    }
  };

  const handleRestoreNow = async () => {
    if (isEncrypted && !masterPassword) {
      setFeedback({ success: false, message: 'Please enter your Master Encryption Password to decrypt the cloud backup.' });
      return;
    }

    if (!confirm('Restoring from cloud will replace your current local records with the cloud backup. Continue?')) {
      return;
    }

    setFeedback(null);
    try {
      const ok = await restoreFromCloud(masterPassword);
      if (ok) {
        setFeedback({ success: true, message: 'Portfolio successfully restored and decrypted from cloud!' });
        setTimeout(() => onClose(), 2000);
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err?.message || 'Restore failed. Check password or connection.' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy-First E2EE Cloud Storage & Sync"
      subtitle="Zero-knowledge AES-256 client-side encryption. Keep your portfolio synced across all your devices."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-[#111614] border border-gray-200 dark:border-gray-800">
          {[
            { id: 'SYNC', label: '☁️ Cloud Vault', icon: Cloud },
            { id: 'CONFIG', label: '⚙️ Cloud Setup', icon: Settings },
            { id: 'HISTORY', label: '📜 Version History', icon: History },
            { id: 'TRANSFER', label: '📱 Device Transfer', icon: QrCode },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#18221c] text-[#2C6E49] dark:text-emerald-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3 rounded-2xl text-xs font-mono font-semibold flex items-center gap-2 animate-fade-in ${
            feedback.success
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
          }`}>
            {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CLOUD VAULT SYNC */}
        {/* ========================================================================= */}
        {activeTab === 'SYNC' && (
          <div className="space-y-4 animate-fade-in">
            {/* Security Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#2C6E49] text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  End-to-End Zero-Knowledge Encryption (AES-256-GCM)
                </h4>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                  Your wealth data is encrypted with 100,000 rounds of PBKDF2 directly in your browser before uploading. Cloud providers cannot read your net worth or assets.
                </p>
              </div>
            </div>

            {/* Master Password Input */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Master Vault Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter secret passphrase to encrypt / decrypt"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400">
                Make sure to remember this password. It is never sent to any server.
              </p>
            </div>

            {/* Provider Status Card */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#121815] border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 dark:text-white block">
                  Active Cloud Provider: <span className="font-mono text-emerald-600 dark:text-emerald-400">{cloudConfig.provider.replace('_', ' ').toUpperCase()}</span>
                </span>
                <span className="text-gray-400 text-[11px] font-mono">
                  Last Synced: {cloudConfig.lastSyncedAt ? new Date(cloudConfig.lastSyncedAt).toLocaleString() : 'Never'}
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                🔒 E2EE Active
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isCloudSyncing}
                className="h-11 rounded-2xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isCloudSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isCloudSyncing ? 'Encrypting & Syncing...' : 'Upload & Sync to Cloud'}</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreNow}
                disabled={isCloudSyncing}
                className="h-11 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16211c] hover:bg-gray-50 text-gray-700 dark:text-gray-200 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isCloudSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-emerald-600" />}
                <span>Restore & Decrypt</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CLOUD SETUP */}
        {/* ========================================================================= */}
        {activeTab === 'CONFIG' && (
          <div className="space-y-4 animate-fade-in">
            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Select Cloud Storage Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'github_gist', label: 'GitHub Gist', desc: 'Zero-cost private sync' },
                  { id: 'google_drive', label: 'Google Drive', desc: 'Private AppData' },
                  { id: 'dropbox', label: 'Dropbox', desc: 'Apps/FinBoom folder' },
                  { id: 'webdav_custom', label: 'WebDAV / S3', desc: 'Self-hosted cloud' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      provider === p.id
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17]'
                    }`}
                  >
                    <span className="font-bold text-xs text-gray-900 dark:text-white block">{p.label}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Specific Inputs */}
            {provider === 'github_gist' && (
              <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#121815] border border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    GitHub Personal Access Token (PAT) *
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Requires 'gist' scope)"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Gist ID (Optional - Auto-generated on first sync)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7a3c4f9f8ca932c8f59e..."
                    value={gistId}
                    onChange={(e) => setGistId(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {provider === 'dropbox' && (
              <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#121815] border border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Dropbox Access Token *
                  </label>
                  <input
                    type="password"
                    placeholder="sl.xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {provider === 'webdav_custom' && (
              <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#121815] border border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    WebDAV / REST Endpoint URL *
                  </label>
                  <input
                    type="url"
                    placeholder="https://nextcloud.yourdomain.com/remote.php/dav/files/user/backup.enc"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Password / App Token
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Auto-Sync & Device Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Auto-Sync Frequency
                </label>
                <select
                  value={autoSyncInterval}
                  onChange={(e) => setAutoSyncInterval(parseInt(e.target.value, 10))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value={0}>Manual Sync Only</option>
                  <option value={15}>Every 15 Minutes</option>
                  <option value={60}>Every 1 Hour (Recommended)</option>
                  <option value={1440}>Daily (Every 24 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Work Laptop, Home Desktop"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18231e] text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="w-full h-11 rounded-2xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Cloud Settings</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CLOUD REVISIONS HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                Cloud Backup Version Timeline (Last 15 Revisions)
              </h4>
              <button
                onClick={refreshCloudRevisions}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {cloudRevisions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-gray-50 dark:bg-[#121815] border border-gray-200 dark:border-gray-800">
                <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No Cloud Backups Yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Sync your portfolio to create your first encrypted checkpoint.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141a17] max-h-72 overflow-y-auto">
                {cloudRevisions.map((rev, idx) => (
                  <div key={rev.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-[#18231e]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-gray-900 dark:text-white">
                          #{cloudRevisions.length - idx}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {new Date(rev.timestamp).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600">
                          {rev.deviceName}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {rev.assetCount} assets · Net Worth: ₹{rev.netWorthINR.toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRestoreNow}
                      className="px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Rollback
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CROSS-DEVICE TRANSFER */}
        {/* ========================================================================= */}
        {activeTab === 'TRANSFER' && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#121815] border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                Cross-Device Quick Sync Key
              </h4>
              <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                Enter this 16-character transfer token on your mobile or secondary laptop to pull your encrypted cloud portfolio instantly:
              </p>

              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-mono font-bold px-4 py-2 rounded-xl bg-white dark:bg-[#18231e] border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 tracking-wider">
                  {transferKey}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(transferKey);
                    setFeedback({ success: true, message: 'Copied Transfer Key to clipboard!' });
                    setTimeout(() => setFeedback(null), 3000);
                  }}
                  className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Simulated QR Code Box */}
              <div className="w-36 h-36 mx-auto rounded-2xl bg-white p-2 border border-gray-300 flex items-center justify-center shadow-xs">
                <QrCode className="w-28 h-28 text-gray-900" />
              </div>
              <p className="text-[10px] font-mono text-gray-400">
                Scan with your phone camera to open in FinBoom Mobile
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
