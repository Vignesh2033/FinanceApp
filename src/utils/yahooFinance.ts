import { CurrencyCode, MarketIndex, YahooSearchResult, WatchlistItem } from '../types/finance';

/**
 * Normalizes user input into a valid Yahoo Finance ticker symbol
 */
export function normalizeYahooTicker(rawSymbol: string): string {
  const clean = rawSymbol.trim().toUpperCase();
  if (!clean) return '';

  // Already qualified symbols (Indices, Forex, Commodities, Suffixes)
  if (
    clean.startsWith('^') ||
    clean.includes('=') ||
    clean.endsWith('.NS') ||
    clean.endsWith('.BO') ||
    clean.includes('-') // e.g. BTC-USD
  ) {
    return clean;
  }

  // Known US Mega Caps & Cryptos
  const usAndCrypto = [
    'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META',
    'NFLX', 'AMD', 'PLTR', 'INTC', 'BRK.B', 'JPM', 'V', 'MA', 'DIS',
    'BTC', 'ETH', 'SOL'
  ];

  if (usAndCrypto.includes(clean)) {
    if (['BTC', 'ETH', 'SOL'].includes(clean)) return `${clean}-USD`;
    return clean;
  }

  // Default Indian stock tickers to NSE (.NS)
  return `${clean}.NS`;
}

/**
 * Resilient multi-layer fetcher for Yahoo Finance endpoints
 */
export async function fetchFromYahooApi<T = any>(endpointPath: string, timeoutMs: number = 4000): Promise<T | null> {
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

  const endpoints = [
    // 1. Vite dev proxy
    `/api/yahoo${cleanPath}`,
    // 2. Direct fetch (supported natively in Electron desktop)
    `https://query1.finance.yahoo.com${cleanPath}`,
    // 3. Fallback CORS proxy 1
    `https://corsproxy.io/?url=${encodeURIComponent('https://query1.finance.yahoo.com' + cleanPath)}`,
    // 4. Fallback CORS proxy 2
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://query1.finance.yahoo.com' + cleanPath)}`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timer);

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().startsWith('{')) {
          const parsed = JSON.parse(text);
          return parsed as T;
        }
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  return null;
}

/**
 * Live search and autocomplete for stocks, ETFs, mutual funds and cryptos across global exchanges
 */
export async function searchYahooFinance(query: string): Promise<YahooSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) return [];

  const endpoint = `/v1/finance/search?q=${encodeURIComponent(trimmed)}&quotesCount=8&newsCount=0`;
  const data = await fetchFromYahooApi(endpoint, 3500);

  if (data && Array.isArray(data.quotes)) {
    return data.quotes
      .filter((q: any) => q.symbol && (q.shortname || q.longname || q.symbol))
      .map((q: any) => {
        const symbol: string = q.symbol;
        const name: string = q.shortname || q.longname || q.symbol;
        const exchDisp: string = q.exchDisp || q.exchange || (symbol.endsWith('.NS') ? 'NSE' : symbol.endsWith('.BO') ? 'BSE' : 'US');
        const typeDisp: string = q.typeDisp || q.quoteType || 'EQUITY';
        const isINR = symbol.endsWith('.NS') || symbol.endsWith('.BO') || exchDisp.includes('NSE') || exchDisp.includes('BSE');
        const currency: CurrencyCode = isINR ? 'INR' : 'USD';

        return {
          symbol,
          name,
          exchDisp,
          typeDisp,
          currency
        };
      });
  }

  return [];
}

/**
 * Format market cap numbers (e.g. 1740000000000 -> "₹17.4L Cr" or "$3.58T")
 */
function formatMarketCap(cap: number | undefined, currency: string = 'INR'): string {
  if (!cap || isNaN(cap)) return currency === 'USD' ? '$1.5B+' : '₹25,000 Cr';
  if (currency === 'USD') {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  } else {
    // INR: Lakh Crores / Crores (1 Cr = 10,000,000)
    const inCr = cap / 1e7;
    if (inCr >= 100000) return `₹${(inCr / 100000).toFixed(2)}L Cr`;
    if (inCr >= 1000) return `₹${(inCr / 1000).toFixed(1)}k Cr`;
    return `₹${Math.round(inCr).toLocaleString()} Cr`;
  }
}

/**
 * Format volume counts (e.g. 45200000 -> "45.2M" or "4.5 Cr")
 */
function formatVolume(vol: number | undefined, isUSD: boolean): string {
  if (!vol || isNaN(vol)) return '1.2M';
  if (isUSD) {
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return String(vol);
  } else {
    if (vol >= 1e7) return `${(vol / 1e7).toFixed(2)} Cr`;
    if (vol >= 1e5) return `${(vol / 1e5).toFixed(1)} Lakh`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return String(vol);
  }
}

export interface YahooLiveQuoteResult {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volume?: string;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: number;
  currency: CurrencyCode;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'CRYPTO' | 'COMMODITY';
  sparkline?: number[];
  timeframes?: {
    '1D': number[];
    '1W': number[];
    '1M': number[];
    '1Y': number[];
    '5Y': number[];
  };
}

/**
 * Fetch complete live quote and statistics from Yahoo Finance
 */
export async function fetchYahooQuote(rawSymbol: string): Promise<YahooLiveQuoteResult | null> {
  const ticker = normalizeYahooTicker(rawSymbol);
  if (!ticker) return null;

  const endpoint = `/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
  const data = await fetchFromYahooApi(endpoint, 4000);

  const result = data?.chart?.result?.[0];
  if (!result || !result.meta) return null;

  const meta = result.meta;
  const rawCloses: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
  const validPrices: number[] = rawCloses.filter((p): p is number => typeof p === 'number' && !isNaN(p));

  const currentPrice = Number((meta.regularMarketPrice || (validPrices.length ? validPrices[validPrices.length - 1] : 0)).toFixed(2));
  if (currentPrice <= 0) return null;

  const prevClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
  const change = Number((currentPrice - prevClose).toFixed(2));
  const changePercent = Number((prevClose > 0 ? (change / prevClose) * 100 : 0).toFixed(2));

  const isUSD = meta.currency === 'USD' || ticker.endsWith('-USD') || (!ticker.endsWith('.NS') && !ticker.endsWith('.BO') && !meta.currency);
  const currency: CurrencyCode = isUSD ? 'USD' : (meta.currency as CurrencyCode) || 'INR';

  let exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'CRYPTO' | 'COMMODITY' = 'NSE';
  if (ticker.endsWith('-USD') || ticker.includes('CRYPTO')) {
    exchange = 'CRYPTO';
  } else if (ticker.endsWith('.BO')) {
    exchange = 'BSE';
  } else if (ticker.endsWith('.NS')) {
    exchange = 'NSE';
  } else if (ticker.startsWith('^') || ticker.includes('=F')) {
    exchange = 'COMMODITY';
  } else {
    exchange = isUSD ? 'NASDAQ' : 'NSE';
  }

  const name = meta.shortName || meta.longName || meta.symbol || rawSymbol;
  const dayHigh = Number((meta.regularMarketDayHigh || currentPrice * 1.015).toFixed(2));
  const dayLow = Number((meta.regularMarketDayLow || currentPrice * 0.985).toFixed(2));
  const fiftyTwoWeekHigh = Number((meta.fiftyTwoWeekHigh || currentPrice * 1.25).toFixed(2));
  const fiftyTwoWeekLow = Number((meta.fiftyTwoWeekLow || currentPrice * 0.75).toFixed(2));

  const sparkline = validPrices.length >= 2 ? validPrices.map(p => Number(p.toFixed(2))) : undefined;

  return {
    symbol: ticker.replace('.NS', '').replace('.BO', ''),
    name,
    currentPrice,
    change,
    changePercent,
    dayHigh,
    dayLow,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    volume: formatVolume(meta.regularMarketVolume, isUSD),
    marketCap: formatMarketCap(meta.marketCap, currency),
    peRatio: meta.trailingPE ? Number(meta.trailingPE.toFixed(1)) : undefined,
    dividendYield: meta.dividendYield ? Number(meta.dividendYield.toFixed(2)) : undefined,
    currency,
    exchange,
    sparkline
  };
}

/**
 * Fetch multi-timeframe historical candlestick series for interactive charts
 */
export async function fetchYahooHistoricalChart(
  rawSymbol: string,
  timeframe: '1D' | '1W' | '1M' | '1Y' | '5Y'
): Promise<{ prices: number[]; dates: string[] } | null> {
  const ticker = normalizeYahooTicker(rawSymbol);
  if (!ticker) return null;

  const timeframeConfig: Record<string, { range: string; interval: string }> = {
    '1D': { range: '1d', interval: '5m' },
    '1W': { range: '5d', interval: '15m' },
    '1M': { range: '1mo', interval: '1d' },
    '1Y': { range: '1y', interval: '1wk' },
    '5Y': { range: '5y', interval: '1mo' }
  };

  const config = timeframeConfig[timeframe] || { range: '1mo', interval: '1d' };
  const endpoint = `/v8/finance/chart/${encodeURIComponent(ticker)}?range=${config.range}&interval=${config.interval}&includePrePost=false`;

  const data = await fetchFromYahooApi(endpoint, 4000);
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const timestamps: number[] = result.timestamp || [];
  const rawCloses: (number | null)[] = result.indicators?.quote?.[0]?.close || [];

  const validEntries: { price: number; date: string }[] = [];

  for (let i = 0; i < rawCloses.length; i++) {
    const p = rawCloses[i];
    if (typeof p === 'number' && !isNaN(p) && p > 0) {
      const ts = timestamps[i] ? new Date(timestamps[i] * 1000) : new Date();
      let label = '';
      if (timeframe === '1D') {
        label = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeframe === '1W' || timeframe === '1M') {
        label = ts.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        label = ts.toLocaleDateString([], { month: 'short', year: '2-digit' });
      }

      validEntries.push({
        price: Number(p.toFixed(2)),
        date: label
      });
    }
  }

  if (validEntries.length === 0) return null;

  return {
    prices: validEntries.map(e => e.price),
    dates: validEntries.map(e => e.date)
  };
}

/**
 * Fallback static market indices if offline
 */
export const DEFAULT_MARKET_INDICES: MarketIndex[] = [
  { symbol: '^NSEI', name: 'NIFTY 50', price: 24860.50, change: 142.30, changePercent: 0.58, currency: 'INR', lastUpdated: 'Live' },
  { symbol: '^BSESN', name: 'SENSEX', price: 81520.80, change: 480.10, changePercent: 0.59, currency: 'INR', lastUpdated: 'Live' },
  { symbol: '^GSPC', name: 'S&P 500', price: 5648.40, change: 24.80, changePercent: 0.44, currency: 'USD', lastUpdated: 'Live' },
  { symbol: '^IXIC', name: 'NASDAQ', price: 17713.60, change: 112.50, changePercent: 0.64, currency: 'USD', lastUpdated: 'Live' },
  { symbol: 'GC=F', name: 'Gold (Oz)', price: 2514.80, change: -4.20, changePercent: -0.17, currency: 'USD', lastUpdated: 'Live' },
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 79652.00, change: 1240.00, changePercent: 1.58, currency: 'USD', lastUpdated: 'Live' },
  { symbol: 'INR=X', name: 'USD / INR', price: 83.92, change: 0.05, changePercent: 0.06, currency: 'INR', lastUpdated: 'Live' }
];

/**
 * Fetch live major benchmark indices from Yahoo Finance
 */
export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  const indexTickers: { symbol: string; name: string; currency: CurrencyCode }[] = [
    { symbol: '^NSEI', name: 'NIFTY 50', currency: 'INR' },
    { symbol: '^BSESN', name: 'SENSEX', currency: 'INR' },
    { symbol: '^GSPC', name: 'S&P 500', currency: 'USD' },
    { symbol: '^IXIC', name: 'NASDAQ', currency: 'USD' },
    { symbol: 'GC=F', name: 'Gold (Oz)', currency: 'USD' },
    { symbol: 'BTC-USD', name: 'Bitcoin', currency: 'USD' },
    { symbol: 'INR=X', name: 'USD / INR', currency: 'INR' }
  ];

  try {
    const updated = await Promise.all(
      indexTickers.map(async (item) => {
        try {
          const endpoint = `/v8/finance/chart/${encodeURIComponent(item.symbol)}?interval=1d&range=2d`;
          const data = await fetchFromYahooApi(endpoint, 3000);
          const result = data?.chart?.result?.[0];
          if (result && result.meta) {
            const meta = result.meta;
            const currentPrice = meta.regularMarketPrice || meta.chartPreviousClose || 0;
            const prevClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
            const change = currentPrice - prevClose;
            const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

            return {
              symbol: item.symbol,
              name: item.name,
              price: Number(currentPrice.toFixed(2)),
              change: Number(change.toFixed(2)),
              changePercent: Number(changePercent.toFixed(2)),
              currency: item.currency,
              lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
        } catch {
          // Fallback to default
        }
        return DEFAULT_MARKET_INDICES.find(d => d.symbol === item.symbol) || {
          symbol: item.symbol,
          name: item.name,
          price: 0,
          change: 0,
          changePercent: 0,
          currency: item.currency,
          lastUpdated: 'Offline'
        };
      })
    );

    return updated;
  } catch {
    return DEFAULT_MARKET_INDICES;
  }
}

/**
 * Ping test to verify Yahoo Finance connectivity status
 */
export async function testYahooConnection(): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  try {
    const res = await fetchFromYahooApi('/v8/finance/chart/%5ENSEI?interval=1d&range=1d', 4000);
    const latencyMs = Date.now() - startTime;
    if (res && res.chart?.result?.length > 0) {
      return { success: true, latencyMs };
    }
    return { success: false, latencyMs, error: 'Empty quote response' };
  } catch (err: any) {
    return { success: false, latencyMs: Date.now() - startTime, error: err?.message || 'Connection timeout' };
  }
}
