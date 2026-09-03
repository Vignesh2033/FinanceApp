export type AssetCategory =
  | 'Equity'
  | 'Mutual Funds'
  | 'Govt & EPF/PPF'
  | 'Precious Metals'
  | 'Real Estate'
  | 'Fixed Income & Deposits'
  | 'Cash & Bank'
  | 'Crypto & Alternate'
  | 'Other Assets';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'AED' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToINR: number; // 1 Unit of this Currency = X INR
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subCategory: string;
  institution: string; // e.g., Zerodha, Groww, EPFO, SBI, IndMoney
  currentValue: number;
  investedValue: number;
  units?: number;
  nav?: number;
  currency: CurrencyCode;
  purchaseDate?: string;
  notes?: string;
  profileId: string;
  updatedAt: string;
  yahooTicker?: string;
  lastSyncedAt?: string;
}

export type LiabilityType =
  | 'Home Loan'
  | 'Car Loan'
  | 'Education Loan'
  | 'Personal Loan'
  | 'Credit Card'
  | 'Other';

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  lender: string;
  originalPrincipal: number;
  outstandingBalance: number;
  interestRate: number; // Annual percentage e.g. 8.5%
  monthlyEmi: number;
  tenureMonthsRemaining: number;
  startDate: string;
  profileId: string;
  notes?: string;
}

export type CashflowType = 'income' | 'expense';

export type CashflowFrequency = 'monthly' | 'one-time' | 'annual';

export interface CashflowItem {
  id: string;
  type: CashflowType;
  category: string;
  title: string;
  amount: number;
  frequency: CashflowFrequency;
  profileId: string;
  date: string;
}

export type GoalCategory =
  | 'FIRE'
  | 'Emergency'
  | 'Education'
  | 'Home'
  | 'Travel'
  | 'Vehicle'
  | 'Custom';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number; // Target in today's money
  targetYear: number;
  currentAmount: number;
  monthlyContribution: number;
  expectedReturnRate: number; // % annual return e.g. 12
  expectedInflationRate: number; // % annual inflation e.g. 6
  profileId: string;
  icon?: string;
}

export interface Snapshot {
  id: string;
  date: string; // YYYY-MM-DD
  monthLabel: string; // e.g. "Feb 2026"
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  profileId: string;
  breakdown?: Record<string, number>;
}

export interface EssentialsCheck {
  termInsurance: {
    active: boolean;
    coverAmount: number;
    recommendedCover: number;
    insurer: string;
  };
  healthInsurance: {
    active: boolean;
    coverAmount: number;
    familyCovered: boolean;
    insurer: string;
  };
  emergencyFund: {
    targetMonths: number;
    currentMonthsCovered: number;
  };
  willDrafted: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  tagline: string;
  avatarBg: string;
}

export interface ShareholdingQuarter {
  quarter: string; // e.g. "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"
  promoter: number;
  fii: number;
  dii: number;
  public: number;
  pledge?: number;
}

export interface WatchlistPeer {
  symbol: string;
  name: string;
  pe: number;
  marketCap: string;
  changePercent: number;
  price?: number;
  currency?: CurrencyCode;
}

export interface WatchlistAlert {
  id: string;
  stockId: string;
  symbol: string;
  condition: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'RSI_BELOW' | 'RSI_ABOVE' | 'GOLDEN_CROSS';
  targetValue: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  notes?: string;
}

export interface WatchlistFolder {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  stockIds: string[];
  isDefault?: boolean;
}

export interface AIBullBear {
  bullCase: string[];
  bearCase: string[];
  sentimentScore: number; // 0 to 100
  sentimentLabel: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Cautious';
  keyCatalyst: string;
}

export interface FinancialStatements {
  years: string[];
  revenue: number[]; // in Cr or Millions
  netProfit: number[]; // in Cr or Millions
  operatingMargin: number[]; // percentages e.g. 24.5
  netMargin: number[]; // percentages e.g. 18.2
  currencyUnit: string;
  segments?: { name: string; percent: number }[];
}

export interface AnalystConsensus {
  totalAnalysts: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  targetLow: number;
  targetMedian: number;
  targetHigh: number;
  upsidePercent: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'CRYPTO' | 'COMMODITY';
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
  sector: string;
  targetPrice?: number;
  consensus?: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';
  description?: string;
  currency: CurrencyCode;
  notes?: string;
  alertPrice?: number;
  sparkline: number[];
  news?: { title: string; source: string; time: string; url?: string }[];
  addedAt: string;

  // Technical Indicators
  rsi?: number;
  dma50?: number;
  dma200?: number;
  dmaStatus?: 'Bullish' | 'Neutral' | 'Bearish' | 'Golden Cross';
  volumeMultiple?: number;
  beta?: number;

  // Fundamental & Financial Health
  pbRatio?: number;
  roe?: number;
  roce?: number;
  debtToEquity?: number;
  yoyQuarterlyProfitGrowth?: number;
  yoyQuarterlyRevenueGrowth?: number;
  freeCashFlow?: string;

  // Visual Statements & Margins
  financialStatements?: FinancialStatements;

  // AI Sentiment & Analysis
  aiBullBear?: AIBullBear;
  analystConsensus?: AnalystConsensus;

  // Shareholding & Ownership
  promoterHolding?: number;
  promoterPledge?: number;
  fiiHolding?: number;
  diiHolding?: number;
  publicHolding?: number;
  shareholdingTrend?: ShareholdingQuarter[];

  // Events & Corporate Calendar
  upcomingEarningsDate?: string;
  upcomingDividend?: { amount: number; exDate: string };

  // Peers & Timeframes
  peers?: WatchlistPeer[];
  timeframes?: {
    '1D': number[];
    '1W': number[];
    '1M': number[];
    '1Y': number[];
    '5Y': number[];
  };
}

export type ActiveTab =
  | 'dashboard'
  | 'assets'
  | 'watchlist'
  | 'liabilities'
  | 'cashflow'
  | 'goals'
  | 'calculators'
  | 'analytics'
  | 'settings';

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: CurrencyCode;
  lastUpdated: string;
}

export interface YahooSearchResult {
  symbol: string;
  name: string;
  exchDisp: string;
  typeDisp: string;
  currency: CurrencyCode;
}

