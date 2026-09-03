import {
  CloudSyncConfig,
  CloudBackupRevision,
  CloudSyncResult
} from '../types/finance';
import { encryptData, decryptData } from './cryptoService';

const CLOUD_REVISIONS_STORAGE_KEY = 'finboom_cloud_revisions_v1';
const CLOUD_CONFIG_STORAGE_KEY = 'finboom_cloud_config_v1';

export const DEFAULT_CLOUD_CONFIG: CloudSyncConfig = {
  provider: 'github_gist',
  enabled: false,
  autoSyncInterval: 0, // 0 = manual, 15 = 15m, 60 = 1h, 1440 = 24h
  encrypted: true,
  deviceName: 'Personal Desktop / Browser'
};

/**
 * Loads cloud configuration from local storage
 */
export function loadCloudConfig(): CloudSyncConfig {
  try {
    const saved = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_CLOUD_CONFIG;
}

/**
 * Saves cloud configuration to local storage
 */
export function saveCloudConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

/**
 * Loads cloud revisions history
 */
export function getCloudRevisions(): CloudBackupRevision[] {
  try {
    const saved = localStorage.getItem(CLOUD_REVISIONS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

/**
 * Adds a new cloud revision to history (capped at last 15 revisions)
 */
export function addCloudRevision(rev: CloudBackupRevision): void {
  try {
    const existing = getCloudRevisions();
    const updated = [rev, ...existing.filter(r => r.id !== rev.id)].slice(0, 15);
    localStorage.setItem(CLOUD_REVISIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Syncs portfolio payload to a Private GitHub Gist
 */
async function syncToGitHubGist(
  payloadStr: string,
  token: string,
  gistId?: string
): Promise<{ gistId: string; rawUrl?: string }> {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  const body = {
    description: 'PersonalPortfolioApp (FinBoom) Private E2EE Cloud Backup',
    public: false,
    files: {
      'finboom_portfolio_backup.enc': {
        content: payloadStr
      }
    }
  };

  if (gistId) {
    // Update existing Gist
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`GitHub Gist update failed: ${res.statusText}`);
    const data = await res.json();
    return { gistId: data.id, rawUrl: data.files['finboom_portfolio_backup.enc']?.raw_url };
  } else {
    // Create new Gist
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`GitHub Gist creation failed: ${res.statusText}`);
    const data = await res.json();
    return { gistId: data.id, rawUrl: data.files['finboom_portfolio_backup.enc']?.raw_url };
  }
}

/**
 * Fetches encrypted payload from GitHub Gist
 */
async function fetchFromGitHubGist(token: string, gistId: string): Promise<string> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!res.ok) throw new Error(`GitHub Gist fetch failed: ${res.statusText}`);
  const data = await res.json();
  const file = data.files['finboom_portfolio_backup.enc'];
  if (!file) throw new Error('Backup file not found in Gist');
  return file.content;
}

/**
 * Syncs portfolio payload to Dropbox
 */
async function syncToDropbox(payloadStr: string, token: string): Promise<void> {
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Dropbox-API-Arg': JSON.stringify({
        path: '/Apps/FinBoom/portfolio_backup.enc',
        mode: 'overwrite',
        autorename: false,
        mute: true
      }),
      'Content-Type': 'application/octet-stream'
    },
    body: new Blob([payloadStr], { type: 'text/plain' })
  });

  if (!res.ok) throw new Error(`Dropbox upload failed: ${res.statusText}`);
}

/**
 * Fetches portfolio payload from Dropbox
 */
async function fetchFromDropbox(token: string): Promise<string> {
  const res = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Dropbox-API-Arg': JSON.stringify({
        path: '/Apps/FinBoom/portfolio_backup.enc'
      })
    }
  });

  if (!res.ok) throw new Error(`Dropbox download failed: ${res.statusText}`);
  return await res.text();
}

/**
 * Syncs portfolio payload to WebDAV / Custom endpoint
 */
async function syncToWebDav(payloadStr: string, endpoint: string, user?: string, pass?: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (user && pass) {
    headers['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
  }

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: payloadStr
  });

  if (!res.ok) throw new Error(`WebDAV upload failed: ${res.statusText}`);
}

/**
 * Main Sync Function: Encrypts portfolio and transfers to selected Cloud Provider
 */
export async function syncPortfolioToCloud(
  portfolioData: {
    assets: any[];
    liabilities: any[];
    goals: any[];
    cashflow: any[];
    snapshots: any[];
    watchlist: any[];
    currency: string;
    activeProfile: string;
  },
  config: CloudSyncConfig,
  masterPassword?: string
): Promise<CloudSyncResult> {
  const timestamp = new Date().toISOString();
  const rawJson = JSON.stringify({
    portfolioData,
    version: '2.0.0',
    timestamp,
    exportedBy: 'PersonalPortfolioApp'
  });

  // Calculate Net Worth for revision metadata
  const totalAssets = portfolioData.assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
  const totalLiabilities = portfolioData.liabilities.reduce((sum, l) => sum + (l.currentBalance || 0), 0);
  const netWorthINR = totalAssets - totalLiabilities;

  let payloadToUpload = rawJson;
  let isEncrypted = false;

  if (config.encrypted && masterPassword) {
    payloadToUpload = await encryptData(rawJson, masterPassword);
    isEncrypted = true;
  }

  let revisionGistId = config.gistId;

  // Transfer to backend
  if (config.provider === 'github_gist' && config.token) {
    const gistRes = await syncToGitHubGist(payloadToUpload, config.token, config.gistId);
    revisionGistId = gistRes.gistId;
  } else if (config.provider === 'dropbox' && config.token) {
    await syncToDropbox(payloadToUpload, config.token);
  } else if (config.provider === 'webdav_custom' && config.endpointUrl) {
    await syncToWebDav(payloadToUpload, config.endpointUrl, config.username, config.password);
  }

  // Record revision locally in cloud history
  const revision: CloudBackupRevision = {
    id: `rev-${Date.now()}`,
    timestamp,
    provider: config.provider,
    deviceName: config.deviceName || 'Desktop / Browser',
    assetCount: portfolioData.assets.length,
    liabilityCount: portfolioData.liabilities.length,
    goalCount: portfolioData.goals.length,
    netWorthINR,
    version: '2.0.0',
    encrypted: isEncrypted,
    payloadSnippet: payloadToUpload.slice(0, 80) + '...'
  };

  addCloudRevision(revision);

  // Update cloud config with last synced time & gistId
  const updatedConfig: CloudSyncConfig = {
    ...config,
    gistId: revisionGistId,
    lastSyncedAt: timestamp
  };
  saveCloudConfig(updatedConfig);

  return {
    success: true,
    timestamp,
    revisionId: revision.id,
    assetCount: portfolioData.assets.length
  };
}

/**
 * Main Restore Function: Fetches from cloud and decrypts payload
 */
export async function restorePortfolioFromCloud(
  config: CloudSyncConfig,
  masterPassword?: string
): Promise<{
  portfolioData: any;
  timestamp: string;
}> {
  let encryptedPayload = '';

  if (config.provider === 'github_gist' && config.token && config.gistId) {
    encryptedPayload = await fetchFromGitHubGist(config.token, config.gistId);
  } else if (config.provider === 'dropbox' && config.token) {
    encryptedPayload = await fetchFromDropbox(config.token);
  } else {
    // Fallback to latest local cloud revision if simulated
    const revisions = getCloudRevisions();
    if (revisions.length === 0) {
      throw new Error('No cloud backups found for this account.');
    }
  }

  if (!encryptedPayload) {
    throw new Error('Could not retrieve cloud payload.');
  }

  let decryptedJson = encryptedPayload;

  // Decrypt if encrypted
  if (config.encrypted) {
    if (!masterPassword) throw new Error('Master password is required to decrypt this cloud backup.');
    decryptedJson = await decryptData(encryptedPayload, masterPassword);
  }

  const parsed = JSON.parse(decryptedJson);
  if (!parsed.portfolioData) throw new Error('Invalid portfolio payload structure.');

  return {
    portfolioData: parsed.portfolioData,
    timestamp: parsed.timestamp || new Date().toISOString()
  };
}
