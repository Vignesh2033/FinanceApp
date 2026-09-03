import {
  Asset,
  EquitySector,
  SectorAllocationItem,
  SectorBenchmarkModel,
  SectorRebalanceOrder,
  SectorRecommendedStock,
  SectorValuationMetric,
  SectorShockScenario,
  SipRebalanceMonth,
  BrokerBasketOrder,
  MacroCyclePhase
} from '../types/finance';

export const SECTOR_COLORS: Record<EquitySector, string> = {
  'Banking & Financials': '#3b82f6',
  'Information Technology & AI': '#8b5cf6',
  'Energy & Conglomerate': '#f59e0b',
  'Automobile & EV': '#ef4444',
  'FMCG & Consumer Staples': '#10b981',
  'Healthcare & Pharma': '#ec4899',
  'Infra, Defence & Capex': '#06b6d4',
  'Metals & Mining': '#64748b',
  'Telecommunications & Internet': '#0ea5e9',
  'Retail & Discretionary': '#f97316',
  'Other / Diversified': '#a855f7'
};

export const SECTOR_VALUATION_METRICS: Record<EquitySector, SectorValuationMetric> = {
  'Banking & Financials': {
    sector: 'Banking & Financials',
    currentPE: 16.8,
    historical5YPE: 21.2,
    currentPB: 2.1,
    dividendYield: 1.4,
    roe: 17.5,
    beta: 1.15,
    valuationStatus: 'CHEAP',
    discountPremiumPercent: -20.8,
    catalyst: 'Credit expansion cycle, pristine asset quality, and expanding net interest margins.'
  },
  'Information Technology & AI': {
    sector: 'Information Technology & AI',
    currentPE: 33.4,
    historical5YPE: 26.5,
    currentPB: 7.8,
    dividendYield: 1.1,
    roe: 28.4,
    beta: 1.32,
    valuationStatus: 'EXPENSIVE',
    discountPremiumPercent: 26.0,
    catalyst: 'Enterprise GenAI infrastructure buildout, cloud hyper-scaler capex, and automation.'
  },
  'Energy & Conglomerate': {
    sector: 'Energy & Conglomerate',
    currentPE: 17.5,
    historical5YPE: 19.0,
    currentPB: 1.8,
    dividendYield: 2.8,
    roe: 14.2,
    beta: 0.95,
    valuationStatus: 'FAIR',
    discountPremiumPercent: -7.9,
    catalyst: 'Green hydrogen transition, domestic gas pricing stability, and telecom/retail spinoffs.'
  },
  'Automobile & EV': {
    sector: 'Automobile & EV',
    currentPE: 21.0,
    historical5YPE: 24.5,
    currentPB: 3.6,
    dividendYield: 1.6,
    roe: 22.0,
    beta: 1.18,
    valuationStatus: 'CHEAP',
    discountPremiumPercent: -14.3,
    catalyst: 'Electric vehicle adoption, premium SUV demand surge, and export expansion.'
  },
  'FMCG & Consumer Staples': {
    sector: 'FMCG & Consumer Staples',
    currentPE: 44.5,
    historical5YPE: 47.0,
    currentPB: 10.2,
    dividendYield: 2.6,
    roe: 34.0,
    beta: 0.62,
    valuationStatus: 'FAIR',
    discountPremiumPercent: -5.3,
    catalyst: 'Rural consumption recovery, direct raw-material deflation, and high pricing power.'
  },
  'Healthcare & Pharma': {
    sector: 'Healthcare & Pharma',
    currentPE: 28.5,
    historical5YPE: 32.0,
    currentPB: 4.2,
    dividendYield: 1.0,
    roe: 19.5,
    beta: 0.68,
    valuationStatus: 'CHEAP',
    discountPremiumPercent: -10.9,
    catalyst: 'US FDA specialty pipeline approvals, patent cliff unlocks, and domestic chronic therapies.'
  },
  'Infra, Defence & Capex': {
    sector: 'Infra, Defence & Capex',
    currentPE: 36.0,
    historical5YPE: 28.0,
    currentPB: 4.8,
    dividendYield: 1.2,
    roe: 18.0,
    beta: 1.24,
    valuationStatus: 'EXPENSIVE',
    discountPremiumPercent: 28.6,
    catalyst: 'Government Make-in-India mandates, multi-year defence export order books, and railway capex.'
  },
  'Metals & Mining': {
    sector: 'Metals & Mining',
    currentPE: 14.2,
    historical5YPE: 15.0,
    currentPB: 1.5,
    dividendYield: 3.8,
    roe: 12.5,
    beta: 1.45,
    valuationStatus: 'FAIR',
    discountPremiumPercent: -5.3,
    catalyst: 'Domestic infrastructure steel consumption and global aluminum beverage can demand.'
  },
  'Telecommunications & Internet': {
    sector: 'Telecommunications & Internet',
    currentPE: 48.0,
    historical5YPE: 42.0,
    currentPB: 5.4,
    dividendYield: 0.8,
    roe: 16.0,
    beta: 1.05,
    valuationStatus: 'EXPENSIVE',
    discountPremiumPercent: 14.3,
    catalyst: 'Tariff price hikes, 5G FWA broadband expansion, and quick-commerce hyper-growth.'
  },
  'Retail & Discretionary': {
    sector: 'Retail & Discretionary',
    currentPE: 78.0,
    historical5YPE: 68.0,
    currentPB: 12.0,
    dividendYield: 0.6,
    roe: 24.5,
    beta: 1.12,
    valuationStatus: 'EXPENSIVE',
    discountPremiumPercent: 14.7,
    catalyst: 'Demographic disposable income surge, premium organized jewelry, and fast fashion retail.'
  },
  'Other / Diversified': {
    sector: 'Other / Diversified',
    currentPE: 22.0,
    historical5YPE: 22.0,
    currentPB: 2.5,
    dividendYield: 1.5,
    roe: 15.0,
    beta: 1.0,
    valuationStatus: 'FAIR',
    discountPremiumPercent: 0,
    catalyst: 'Multi-asset holding.'
  }
};

export const MACRO_CYCLE_MODELS: Record<MacroCyclePhase, {
  name: string;
  phaseTitle: string;
  badge: string;
  description: string;
  topFavoredSectors: EquitySector[];
  weights: Record<EquitySector, number>;
}> = {
  EARLY_CYCLE: {
    name: '🌅 Early-Cycle / Economic Recovery',
    phaseTitle: 'Early Recovery',
    badge: 'High Beta / Growth',
    description: 'Interest rates falling, credit growth accelerating, consumer sentiment rebounding. Best for Cyclicals, Autos, Financials & Retail.',
    topFavoredSectors: ['Banking & Financials', 'Automobile & EV', 'Retail & Discretionary', 'Infra, Defence & Capex'],
    weights: {
      'Banking & Financials': 28,
      'Automobile & EV': 16,
      'Retail & Discretionary': 14,
      'Infra, Defence & Capex': 14,
      'Information Technology & AI': 14,
      'Energy & Conglomerate': 8,
      'FMCG & Consumer Staples': 6,
      'Healthcare & Pharma': 0,
      'Telecommunications & Internet': 0,
      'Metals & Mining': 0,
      'Other / Diversified': 0
    }
  },
  MID_CYCLE: {
    name: '☀️ Mid-Cycle / Peak Economic Growth',
    phaseTitle: 'Peak Expansion',
    badge: 'Tech & Capex',
    description: 'Corporate profits expanding at peak rates, enterprise capex at high levels, credit robust. Best for Tech/AI, Industrials & Financials.',
    topFavoredSectors: ['Information Technology & AI', 'Banking & Financials', 'Infra, Defence & Capex'],
    weights: {
      'Information Technology & AI': 32,
      'Banking & Financials': 22,
      'Infra, Defence & Capex': 16,
      'Automobile & EV': 12,
      'Retail & Discretionary': 8,
      'Energy & Conglomerate': 6,
      'FMCG & Consumer Staples': 4,
      'Healthcare & Pharma': 0,
      'Telecommunications & Internet': 0,
      'Metals & Mining': 0,
      'Other / Diversified': 0
    }
  },
  LATE_CYCLE: {
    name: '🍂 Late-Cycle / Inflation & High Rates',
    phaseTitle: 'Late Expansion',
    badge: 'Commodities & Energy',
    description: 'Capacity constraints, high inflation, tight monetary policy. Best for Energy, Commodities, Healthcare & Cash Flow leaders.',
    topFavoredSectors: ['Energy & Conglomerate', 'Metals & Mining', 'Healthcare & Pharma', 'Banking & Financials'],
    weights: {
      'Energy & Conglomerate': 24,
      'Banking & Financials': 18,
      'Metals & Mining': 16,
      'Healthcare & Pharma': 16,
      'FMCG & Consumer Staples': 12,
      'Information Technology & AI': 8,
      'Automobile & EV': 6,
      'Infra, Defence & Capex': 0,
      'Retail & Discretionary': 0,
      'Telecommunications & Internet': 0,
      'Other / Diversified': 0
    }
  },
  RECESSION: {
    name: '❄️ Recession / High Volatility & Crisis',
    phaseTitle: 'Contraction / Defensive',
    badge: 'Maximum Capital Protection',
    description: 'Economic contraction, earnings revisions downwards. Maximum focus on non-cyclical essentials, Healthcare, FMCG & Utilities.',
    topFavoredSectors: ['FMCG & Consumer Staples', 'Healthcare & Pharma', 'Energy & Conglomerate'],
    weights: {
      'FMCG & Consumer Staples': 34,
      'Healthcare & Pharma': 28,
      'Banking & Financials': 16,
      'Energy & Conglomerate': 12,
      'Telecommunications & Internet': 10,
      'Information Technology & AI': 0,
      'Automobile & EV': 0,
      'Infra, Defence & Capex': 0,
      'Metals & Mining': 0,
      'Retail & Discretionary': 0,
      'Other / Diversified': 0
    }
  }
};

export const STRESS_TEST_SCENARIOS: SectorShockScenario[] = [
  {
    id: 'scen-tech-crash',
    name: '📉 Global Tech & AI Valuation Bubble Pullback (-22%)',
    description: 'US semiconductor export curbs and enterprise AI capex pause triggers high-valuation multiple compression in IT/AI stocks.',
    icon: 'TrendingDown',
    sectorShocks: {
      'Information Technology & AI': -22,
      'Retail & Discretionary': -10,
      'Telecommunications & Internet': -8,
      'Automobile & EV': -6,
      'Banking & Financials': -3,
      'Infra, Defence & Capex': -2,
      'Metals & Mining': -4,
      'Energy & Conglomerate': 2,
      'Healthcare & Pharma': 6,
      'FMCG & Consumer Staples': 8,
      'Other / Diversified': 0
    }
  },
  {
    id: 'scen-oil-shock',
    name: '🛢️ Geopolitical Middle-East Conflict & Crude Oil Spike ($110/bbl)',
    description: 'Brent crude surges 35%, boosting upstream energy producers while compressing margins for auto, paints, and airlines.',
    icon: 'Flame',
    sectorShocks: {
      'Energy & Conglomerate': 18,
      'Metals & Mining': 8,
      'Healthcare & Pharma': 2,
      'FMCG & Consumer Staples': -4,
      'Information Technology & AI': -5,
      'Banking & Financials': -8,
      'Infra, Defence & Capex': -10,
      'Retail & Discretionary': -12,
      'Automobile & EV': -16,
      'Telecommunications & Internet': -3,
      'Other / Diversified': 0
    }
  },
  {
    id: 'scen-rbi-rate-cut',
    name: '🏦 RBI 50 bps Surprise Repo Rate Cut & Credit Boom',
    description: 'Central bank pivots to aggressive dovish easing, triggering a massive liquidity surge into rate-sensitive banking, real estate, and auto stocks.',
    icon: 'Landmark',
    sectorShocks: {
      'Banking & Financials': 14,
      'Automobile & EV': 12,
      'Retail & Discretionary': 10,
      'Infra, Defence & Capex': 9,
      'Metals & Mining': 6,
      'Telecommunications & Internet': 5,
      'Information Technology & AI': 4,
      'Energy & Conglomerate': 3,
      'Healthcare & Pharma': -2,
      'FMCG & Consumer Staples': -3,
      'Other / Diversified': 0
    }
  },
  {
    id: 'scen-global-tariff-war',
    name: '🌍 Global Trade Protectionism & Export Tariff Escalation',
    description: 'Universal 20% import tariffs disrupt global supply chains, hurting US tech hardware, auto exports, and commodity shipping.',
    icon: 'ShieldAlert',
    sectorShocks: {
      'Information Technology & AI': -15,
      'Metals & Mining': -14,
      'Automobile & EV': -12,
      'Infra, Defence & Capex': 4,
      'FMCG & Consumer Staples': 6,
      'Healthcare & Pharma': 5,
      'Banking & Financials': -6,
      'Energy & Conglomerate': -2,
      'Telecommunications & Internet': 3,
      'Retail & Discretionary': -8,
      'Other / Diversified': 0
    }
  }
];

export const SECTOR_RECOMMENDED_STOCKS: Record<EquitySector, SectorRecommendedStock[]> = {
  'Banking & Financials': [
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', rationale: 'Industry-leading ROE (18.5%), superior deposit franchise and pristine asset quality.', peRatio: 18.4, price: 1224.80, currency: 'INR' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', rationale: 'India\'s largest private credit machine with robust CASA growth and post-merger synergies.', peRatio: 17.8, price: 720.30, currency: 'INR' },
    { symbol: 'SBIN', name: 'State Bank of India', rationale: 'Lowest valuation multiple among mega-banks (9.8x P/E) with massive corporate loan pipeline.', peRatio: 9.8, price: 835.60, currency: 'INR' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', rationale: 'Dominant consumer lending omnichannel platform compounding at 25%+ AUM growth.', peRatio: 31.4, price: 7150.00, currency: 'INR' }
  ],
  'Information Technology & AI': [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', rationale: 'Undisputed leader in AI enterprise datacenter compute GPUs with CUDA software moat.', peRatio: 48.6, price: 227.98, currency: 'USD' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', rationale: 'Zero long-term debt, massive $14B order book, and regular capital returns via buybacks.', peRatio: 29.5, price: 4120.50, currency: 'INR' },
    { symbol: 'INFY', name: 'Infosys Limited', rationale: 'Fortune 500 digital transformation leader expanding enterprise Topaz GenAI suite.', peRatio: 26.2, price: 1144.00, currency: 'INR' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', rationale: 'Azure cloud hyper-scaler and Copilot monetization across enterprise software.', peRatio: 36.4, price: 442.80, currency: 'USD' }
  ],
  'Energy & Conglomerate': [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', rationale: 'Dominant consumer and telecom (Jio) businesses with value-unlocking IPO tailwinds.', peRatio: 23.4, price: 1287.00, currency: 'INR' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', rationale: 'Generous 5.5% dividend yield with cheap single-digit P/E multiple.', peRatio: 7.2, price: 312.00, currency: 'INR' }
  ],
  'Automobile & EV': [
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', rationale: 'Electric vehicle market leadership in India and Jaguar Land Rover free cash flow turnaround.', peRatio: 11.2, price: 994.30, currency: 'INR' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra', rationale: 'Dominant SUV market share and agricultural tractor leadership with high ROE.', peRatio: 29.8, price: 2920.00, currency: 'INR' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India', rationale: 'Mass market volume leader with cash-rich balance sheet and expanding hybrid portfolio.', peRatio: 28.4, price: 12450.00, currency: 'INR' }
  ],
  'FMCG & Consumer Staples': [
    { symbol: 'ITC', name: 'ITC Limited', rationale: 'Defensive cash generator with 3.5%+ dividend yield, zero debt, and hotel demerger catalyst.', peRatio: 28.4, price: 512.75, currency: 'INR' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', rationale: 'Priceless domestic distribution moat across 9 million retail touchpoints.', peRatio: 58.2, price: 2740.00, currency: 'INR' },
    { symbol: 'NESTLEIND', name: 'Nestle India Ltd', rationale: 'High-margin packaged foods compounding with 100%+ ROCE.', peRatio: 72.0, price: 2480.00, currency: 'INR' }
  ],
  'Healthcare & Pharma': [
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', rationale: 'Global specialty pharma portfolio with strong pricing power and debt-free balance sheet.', peRatio: 36.5, price: 1810.00, currency: 'INR' },
    { symbol: 'CIPLA', name: 'Cipla Limited', rationale: 'Respiratory inhaler leadership in the US and dominant Indian chronic therapy presence.', peRatio: 28.2, price: 1540.00, currency: 'INR' },
    { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', rationale: 'Strong global biosimilars pipeline and attractive risk-reward valuation.', peRatio: 21.0, price: 6520.00, currency: 'INR' }
  ],
  'Infra, Defence & Capex': [
    { symbol: 'BEL', name: 'Bharat Electronics Ltd', rationale: 'Debt-free defence electronics leader with 5-year order book and 30%+ ROCE.', peRatio: 42.0, price: 308.40, currency: 'INR' },
    { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd', rationale: 'Monopoly in Indian fighter aircraft manufacturing and recurring MRO defence lifecycle contracts.', peRatio: 38.5, price: 4720.00, currency: 'INR' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', rationale: 'Record ₹5 Lakh Cr+ international & domestic EPC order book benefiting from mega-capex.', peRatio: 34.2, price: 3620.00, currency: 'INR' }
  ],
  'Metals & Mining': [
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', rationale: 'Lowest-cost integrated domestic steelmaker expanding capacity at Kalinganagar.', peRatio: 16.5, price: 154.00, currency: 'INR' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', rationale: 'Global aluminum beverage can packaging leadership via Novelis with strong margins.', peRatio: 13.8, price: 680.00, currency: 'INR' }
  ],
  'Telecommunications & Internet': [
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', rationale: 'Industry-best ARPU expansion, robust Africa growth, and expanding 5G FWA broadband.', peRatio: 44.0, price: 1542.00, currency: 'INR' },
    { symbol: 'ZOMATO', name: 'Zomato Ltd', rationale: 'Blinkit quick-commerce hyper-growth scaling operating profitability.', peRatio: 98.0, price: 264.50, currency: 'INR' }
  ],
  'Retail & Discretionary': [
    { symbol: 'TRENT', name: 'Trent Ltd', rationale: 'Phenomenal Zudio & Westside retail engine delivering 50%+ YoY profit compounding.', peRatio: 110.0, price: 7120.00, currency: 'INR' },
    { symbol: 'TITAN', name: 'Titan Company Ltd', rationale: 'Unstoppable organized jewelry (Tanishq) market share compounding and luxury expansion.', peRatio: 82.4, price: 3480.00, currency: 'INR' }
  ],
  'Other / Diversified': []
};

export const PRESET_SECTOR_MODELS: SectorBenchmarkModel[] = [
  {
    id: 'model-optimal-alpha',
    name: '🚀 Optimal Alpha Balanced (Recommended)',
    icon: 'Sparkles',
    description: 'Disciplined multi-sector growth model eliminating concentration risk while maximizing exposure to secular Indian megatrends.',
    weights: {
      'Information Technology & AI': 22,
      'Banking & Financials': 22,
      'Energy & Conglomerate': 12,
      'Automobile & EV': 10,
      'Healthcare & Pharma': 9,
      'FMCG & Consumer Staples': 9,
      'Infra, Defence & Capex': 8,
      'Retail & Discretionary': 6,
      'Telecommunications & Internet': 2,
      'Metals & Mining': 0,
      'Other / Diversified': 0
    }
  },
  {
    id: 'model-nifty50',
    name: '🏛️ Nifty 50 Index Benchmark',
    icon: 'ShieldCheck',
    description: 'Mirrors the actual institutional sector weighting of India\'s flagship Nifty 50 benchmark index.',
    weights: {
      'Banking & Financials': 32,
      'Information Technology & AI': 14,
      'Energy & Conglomerate': 12,
      'FMCG & Consumer Staples': 9,
      'Infra, Defence & Capex': 7,
      'Automobile & EV': 7,
      'Healthcare & Pharma': 5,
      'Telecommunications & Internet': 5,
      'Retail & Discretionary': 5,
      'Metals & Mining': 4,
      'Other / Diversified': 0
    }
  },
  {
    id: 'model-growth-tech',
    name: '⚡ High Growth, Tech & Consumer',
    icon: 'Flame',
    description: 'High-beta allocation tilted heavily towards AI compute, digital consumer platforms, and EV mobility.',
    weights: {
      'Information Technology & AI': 38,
      'Banking & Financials': 18,
      'Automobile & EV': 14,
      'Retail & Discretionary': 12,
      'Telecommunications & Internet': 8,
      'Healthcare & Pharma': 5,
      'Infra, Defence & Capex': 5,
      'Energy & Conglomerate': 0,
      'FMCG & Consumer Staples': 0,
      'Metals & Mining': 0,
      'Other / Diversified': 0
    }
  },
  {
    id: 'model-defensive-cashcow',
    name: '🛡️ Defensive & High Cash Flow',
    icon: 'Shield',
    description: 'Low-beta capital preservation strategy focused on non-cyclical essentials, healthcare, and high-yield dividends.',
    weights: {
      'FMCG & Consumer Staples': 28,
      'Healthcare & Pharma': 22,
      'Banking & Financials': 22,
      'Energy & Conglomerate': 18,
      'Telecommunications & Internet': 10,
      'Information Technology & AI': 0,
      'Automobile & EV': 0,
      'Infra, Defence & Capex': 0,
      'Metals & Mining': 0,
      'Retail & Discretionary': 0,
      'Other / Diversified': 0
    }
  },
  {
    id: 'model-india-capex',
    name: '🏗️ India Capex & Manufacturing',
    icon: 'Hammer',
    description: 'Focused on industrial expansion, Make-in-India defence indigenization, and transportation infrastructure.',
    weights: {
      'Infra, Defence & Capex': 32,
      'Automobile & EV': 22,
      'Banking & Financials': 18,
      'Energy & Conglomerate': 14,
      'Metals & Mining': 10,
      'Information Technology & AI': 4,
      'FMCG & Consumer Staples': 0,
      'Healthcare & Pharma': 0,
      'Telecommunications & Internet': 0,
      'Retail & Discretionary': 0,
      'Other / Diversified': 0
    }
  }
];

/**
 * Intelligent classifier mapping any asset name or ticker to its proper Equity Sector
 */
export function classifyAssetSector(asset: Asset): EquitySector {
  const name = asset.name.toUpperCase();
  const subCat = (asset.subCategory || '').toUpperCase();
  const ticker = (asset.yahooTicker || '').toUpperCase();

  // 1. Tech & AI
  if (
    name.includes('NVIDIA') || name.includes('NVDA') ||
    name.includes('APPLE') || name.includes('AAPL') ||
    name.includes('MICROSOFT') || name.includes('MSFT') ||
    name.includes('INFOSYS') || name.includes('INFY') ||
    name.includes('TCS') || name.includes('TATA CONSULTANCY') ||
    name.includes('HCL') || name.includes('WIPRO') ||
    name.includes('TECH MAHINDRA') || name.includes('LTIMINDTREE') ||
    name.includes('GOOGLE') || name.includes('ALPHABET') ||
    name.includes('NASDAQ') || name.includes('MON100') ||
    subCat.includes('US EQUITIES') || subCat.includes('TECH')
  ) {
    return 'Information Technology & AI';
  }

  // 2. Banking & Financials
  if (
    name.includes('HDFC BANK') || name.includes('HDFCBANK') ||
    name.includes('ICICI BANK') || name.includes('ICICIBANK') ||
    name.includes('STATE BANK') || name.includes('SBIN') ||
    name.includes('KOTAK') || name.includes('AXIS BANK') ||
    name.includes('BAJAJ FINANCE') || name.includes('BAJFINANCE') ||
    name.includes('JIO FINANCIAL') || name.includes('BANKBEES') ||
    subCat.includes('FLEXI CAP') || subCat.includes('INDEX FUND')
  ) {
    return 'Banking & Financials';
  }

  // 3. Energy & Conglomerate
  if (
    name.includes('RELIANCE') || name.includes('ONGC') ||
    name.includes('IOC') || name.includes('BPCL') ||
    name.includes('GAIL') || name.includes('NTPC') ||
    name.includes('POWER GRID') || name.includes('TATA POWER')
  ) {
    return 'Energy & Conglomerate';
  }

  // 4. Auto & EV
  if (
    name.includes('TATA MOTORS') || name.includes('TATAMOTORS') ||
    name.includes('MAHINDRA') || name.includes('M&M') ||
    name.includes('MARUTI') || name.includes('BAJAJ AUTO') ||
    name.includes('HERO MOTO') || name.includes('EICHER') ||
    name.includes('TESLA') || name.includes('TSLA')
  ) {
    return 'Automobile & EV';
  }

  // 5. FMCG & Consumer
  if (
    name.includes('ITC') || name.includes('HINDUSTAN UNILEVER') ||
    name.includes('HINDUNILVR') || name.includes('NESTLE') ||
    name.includes('BRITANNIA') || name.includes('DABUR') ||
    name.includes('MARICO') || name.includes('TATA CONSUMER') ||
    name.includes('COLPAL')
  ) {
    return 'FMCG & Consumer Staples';
  }

  // 6. Healthcare & Pharma
  if (
    name.includes('SUN PHARMA') || name.includes('SUNPHARMA') ||
    name.includes('CIPLA') || name.includes('DR REDDY') ||
    name.includes('DIVIS') || name.includes('APOLLO HOSP') ||
    name.includes('MANKIND') || name.includes('LUPIN')
  ) {
    return 'Healthcare & Pharma';
  }

  // 7. Infra, Defence & Capex
  if (
    name.includes('LARSEN') || name.includes('L&T') ||
    name.includes('BHARAT ELECTRONICS') || name.includes('BEL') ||
    name.includes('HINDUSTAN AERONAUTICS') || name.includes('HAL') ||
    name.includes('MAZAGON') || name.includes('SIEMENS') ||
    name.includes('ABB') || name.includes('BHEL') ||
    name.includes('GMR') || name.includes('ADANI PORTS')
  ) {
    return 'Infra, Defence & Capex';
  }

  // 8. Metals & Mining
  if (
    name.includes('TATA STEEL') || name.includes('JSW STEEL') ||
    name.includes('HINDALCO') || name.includes('VEDANTA') ||
    name.includes('COAL INDIA') || name.includes('NMDC')
  ) {
    return 'Metals & Mining';
  }

  // 9. Telecom & Internet
  if (
    name.includes('BHARTI AIRTEL') || name.includes('AIRTEL') ||
    name.includes('ZOMATO') || name.includes('SWIGGY') ||
    name.includes('NAUKRI') || name.includes('INFO EDGE')
  ) {
    return 'Telecommunications & Internet';
  }

  // 10. Retail & Discretionary
  if (
    name.includes('TITAN') || name.includes('TRENT') ||
    name.includes('AMAZON') || name.includes('AMZN') ||
    name.includes('NYKAA') || name.includes('DMART') ||
    name.includes('AVENUE SUPERMARTS')
  ) {
    return 'Retail & Discretionary';
  }

  return 'Other / Diversified';
}

/**
 * Calculates current sector allocation from equity assets
 */
export function calculateSectorAllocations(
  assets: Asset[],
  targetWeights: Record<EquitySector, number>
): {
  items: SectorAllocationItem[];
  totalEquityValue: number;
  activeSectorsCount: number;
  maxConcentrationPercent: number;
  maxConcentratedSector: EquitySector;
  portfolioWeightedBeta: number;
} {
  const equityAssets = assets.filter(
    a => a.category === 'Equity' || a.category === 'Mutual Funds'
  );

  const totalEquityValue = equityAssets.reduce((sum, a) => sum + a.currentValue, 0);

  const allSectors: EquitySector[] = [
    'Banking & Financials',
    'Information Technology & AI',
    'Energy & Conglomerate',
    'Automobile & EV',
    'FMCG & Consumer Staples',
    'Healthcare & Pharma',
    'Infra, Defence & Capex',
    'Metals & Mining',
    'Telecommunications & Internet',
    'Retail & Discretionary'
  ];

  const sectorValueMap: Record<EquitySector, { value: number; holdings: { name: string; symbol: string; value: number }[] }> = {
    'Banking & Financials': { value: 0, holdings: [] },
    'Information Technology & AI': { value: 0, holdings: [] },
    'Energy & Conglomerate': { value: 0, holdings: [] },
    'Automobile & EV': { value: 0, holdings: [] },
    'FMCG & Consumer Staples': { value: 0, holdings: [] },
    'Healthcare & Pharma': { value: 0, holdings: [] },
    'Infra, Defence & Capex': { value: 0, holdings: [] },
    'Metals & Mining': { value: 0, holdings: [] },
    'Telecommunications & Internet': { value: 0, holdings: [] },
    'Retail & Discretionary': { value: 0, holdings: [] },
    'Other / Diversified': { value: 0, holdings: [] }
  };

  equityAssets.forEach(asset => {
    const sector = classifyAssetSector(asset);
    sectorValueMap[sector].value += asset.currentValue;
    sectorValueMap[sector].holdings.push({
      name: asset.name,
      symbol: asset.yahooTicker || asset.name.split(' ')[0],
      value: asset.currentValue
    });
  });

  let maxConcentrationPercent = 0;
  let maxConcentratedSector: EquitySector = 'Information Technology & AI';
  let activeSectorsCount = 0;
  let weightedBetaSum = 0;

  const items: SectorAllocationItem[] = allSectors.map(sector => {
    const data = sectorValueMap[sector];
    const value = data.value;
    const percentage = totalEquityValue > 0 ? Number(((value / totalEquityValue) * 100).toFixed(1)) : 0;
    const targetPercentage = targetWeights[sector] ?? 0;
    const driftPercent = Number((percentage - targetPercentage).toFixed(1));

    const sectorBeta = SECTOR_VALUATION_METRICS[sector]?.beta || 1.0;
    if (totalEquityValue > 0) {
      weightedBetaSum += (value / totalEquityValue) * sectorBeta;
    }

    if (value > 0) activeSectorsCount++;
    if (percentage > maxConcentrationPercent) {
      maxConcentrationPercent = percentage;
      maxConcentratedSector = sector;
    }

    let driftStatus: 'OVERWEIGHT' | 'UNDERWEIGHT' | 'BALANCED' = 'BALANCED';
    if (driftPercent > 3.0) driftStatus = 'OVERWEIGHT';
    else if (driftPercent < -3.0) driftStatus = 'UNDERWEIGHT';

    const holdingsWithPct = data.holdings.map(h => ({
      ...h,
      percentageOfSector: value > 0 ? Number(((h.value / value) * 100).toFixed(1)) : 0
    }));

    return {
      sector,
      value,
      percentage,
      targetPercentage,
      driftPercent,
      driftStatus,
      holdings: holdingsWithPct,
      recommendedStocks: SECTOR_RECOMMENDED_STOCKS[sector] || [],
      color: SECTOR_COLORS[sector]
    };
  });

  const portfolioWeightedBeta = Number(weightedBetaSum.toFixed(2)) || 1.0;

  return {
    items,
    totalEquityValue,
    activeSectorsCount,
    maxConcentrationPercent,
    maxConcentratedSector,
    portfolioWeightedBeta
  };
}

/**
 * Calculates stock-level rebalancing orders for both Smart Cash Injection & Full Realignment
 */
export function calculateSectorRebalancingOrders(
  items: SectorAllocationItem[],
  totalEquityValue: number,
  freshCapital: number,
  mode: 'CASH_INJECTION' | 'FULL_REBALANCE'
): SectorRebalanceOrder[] {
  const orders: SectorRebalanceOrder[] = [];

  if (mode === 'CASH_INJECTION') {
    const newTotalEquity = totalEquityValue + freshCapital;
    
    const deficits = items.map(item => {
      const idealValue = (item.targetPercentage / 100) * newTotalEquity;
      const deficit = idealValue - item.value;
      return {
        sector: item.sector,
        currentPercent: item.percentage,
        targetPercent: item.targetPercentage,
        deficit: Math.max(0, deficit),
        recommended: item.recommendedStocks
      };
    }).filter(d => d.deficit > 0 && d.targetPercent > 0);

    const totalDeficit = deficits.reduce((sum, d) => sum + d.deficit, 0);

    deficits.forEach(d => {
      const allocationRatio = totalDeficit > 0 ? d.deficit / totalDeficit : 0;
      const allocatedAmount = Math.round(freshCapital * allocationRatio);

      if (allocatedAmount > 500) {
        const suggestedTickers = d.recommended.slice(0, 2).map(s => s.symbol);
        orders.push({
          sector: d.sector,
          action: 'BUY',
          amount: allocatedAmount,
          currentPercent: d.currentPercent,
          targetPercent: d.targetPercent,
          suggestedStocks: suggestedTickers,
          rationale: `Deploy ₹${allocatedAmount.toLocaleString()} to close sector deficit from ${d.currentPercent}% to ${d.targetPercent}%. Zero tax drag.`
        });
      }
    });

    return orders.sort((a, b) => b.amount - a.amount);
  } else {
    items.forEach(item => {
      const targetVal = (item.targetPercentage / 100) * totalEquityValue;
      const diff = targetVal - item.value;

      if (Math.abs(diff) > 2000) {
        if (diff > 0) {
          orders.push({
            sector: item.sector,
            action: 'BUY',
            amount: Math.round(diff),
            currentPercent: item.percentage,
            targetPercent: item.targetPercentage,
            suggestedStocks: item.recommendedStocks.slice(0, 2).map(s => s.symbol),
            rationale: `Accumulate ₹${Math.round(diff).toLocaleString()} in ${item.sector} leaders to reach ${item.targetPercentage}% target.`
          });
        } else {
          const trimAmount = Math.round(Math.abs(diff));
          const currentHoldings = item.holdings.map(h => h.symbol);
          orders.push({
            sector: item.sector,
            action: 'TRIM',
            amount: trimAmount,
            currentPercent: item.percentage,
            targetPercent: item.targetPercentage,
            suggestedStocks: currentHoldings.length > 0 ? currentHoldings : ['Holdings in sector'],
            rationale: `Trim ₹${trimAmount.toLocaleString()} from ${item.sector} (${item.percentage}% vs ${item.targetPercentage}% target) to reallocate into underweight sectors.`
          });
        }
      }
    });

    return orders.sort((a, b) => (a.action === 'TRIM' ? -1 : 1));
  }
}

/**
 * Calculates stress test P&L simulation on portfolio
 */
export function calculateStressTestImpact(
  items: SectorAllocationItem[],
  totalEquityValue: number,
  scenario: SectorShockScenario
): {
  newTotalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  sectorImpacts: { sector: EquitySector; shockPercent: number; pnl: number; isPositive: boolean }[];
} {
  let newTotal = 0;
  const sectorImpacts = items.map(item => {
    const shock = scenario.sectorShocks[item.sector] ?? 0;
    const pnl = item.value * (shock / 100);
    newTotal += (item.value + pnl);
    return {
      sector: item.sector,
      shockPercent: shock,
      pnl: Math.round(pnl),
      isPositive: pnl >= 0
    };
  });

  const totalPnL = Math.round(newTotal - totalEquityValue);
  const totalPnLPercent = totalEquityValue > 0 ? Number(((totalPnL / totalEquityValue) * 100).toFixed(2)) : 0;

  return {
    newTotalValue: Math.round(newTotal),
    totalPnL,
    totalPnLPercent,
    sectorImpacts: sectorImpacts.sort((a, b) => a.pnl - b.pnl)
  };
}

/**
 * Generates phased 3 to 6-month SIP rebalancing roadmap
 */
export function generateSipRoadmap(
  items: SectorAllocationItem[],
  totalEquityValue: number,
  monthlySipAmount: number,
  months: number = 4
): SipRebalanceMonth[] {
  const roadmap: SipRebalanceMonth[] = [];
  const totalFreshInjected = monthlySipAmount * months;
  const targetTotal = totalEquityValue + totalFreshInjected;

  // Calculate sector deficits
  const deficits = items.map(item => {
    const idealVal = (item.targetPercentage / 100) * targetTotal;
    const deficit = Math.max(0, idealVal - item.value);
    return {
      sector: item.sector,
      deficit,
      recommended: item.recommendedStocks
    };
  }).filter(d => d.deficit > 0).sort((a, b) => b.deficit - a.deficit);

  const totalDeficit = deficits.reduce((sum, d) => sum + d.deficit, 0);

  for (let m = 1; m <= months; m++) {
    const monthAllocations = deficits.map(d => {
      const share = totalDeficit > 0 ? d.deficit / totalDeficit : 0;
      const amt = Math.round(monthlySipAmount * share);
      return {
        sector: d.sector,
        amount: amt,
        percentage: monthlySipAmount > 0 ? Number(((amt / monthlySipAmount) * 100).toFixed(1)) : 0,
        suggestedStocks: d.recommended.slice(0, 2).map(s => s.symbol),
        rationale: `Phase ${m} SIP tranche accumulating ${d.sector} leaders.`
      };
    }).filter(a => a.amount > 500);

    roadmap.push({
      month: m,
      title: `Month ${m} Execution Plan`,
      monthlyAmount: monthlySipAmount,
      sectorAllocations: monthAllocations
    });
  }

  return roadmap;
}

/**
 * Formats orders as a Zerodha Kite Basket JSON and Groww CSV
 */
export function generateBrokerBaskets(
  orders: SectorRebalanceOrder[]
): {
  zerodhaJson: string;
  growwCsv: string;
  basketCount: number;
} {
  const buyOrders = orders.filter(o => o.action === 'BUY');
  const basketItems: BrokerBasketOrder[] = [];

  buyOrders.forEach(o => {
    o.suggestedStocks.forEach(sym => {
      const stockMeta = SECTOR_RECOMMENDED_STOCKS[o.sector]?.find(s => s.symbol === sym);
      const price = stockMeta?.price || 1000;
      const allocatedPerStock = Math.round(o.amount / Math.max(1, o.suggestedStocks.length));
      const qty = Math.max(1, Math.floor(allocatedPerStock / price));

      basketItems.push({
        tradingsymbol: sym,
        exchange: sym.includes('.') || !['AAPL', 'NVDA', 'MSFT'].includes(sym) ? 'NSE' : 'NASDAQ',
        transaction_type: 'BUY',
        order_type: 'MARKET',
        product: 'CNC',
        quantity: qty,
        price,
        sector: o.sector
      });
    });
  });

  const zerodhaPayload = basketItems.map(item => ({
    variety: 'regular',
    tradingsymbol: item.tradingsymbol,
    exchange: item.exchange,
    transaction_type: item.transaction_type,
    order_type: item.order_type,
    quantity: item.quantity,
    price: 0,
    product: item.product,
    validity: 'DAY'
  }));

  let growwCsv = `Symbol,Exchange,OrderType,Action,Quantity,EstimatedPrice,Sector\n`;
  basketItems.forEach(item => {
    growwCsv += `${item.tradingsymbol},${item.exchange},MARKET,BUY,${item.quantity},${item.price},"${item.sector}"\n`;
  });

  return {
    zerodhaJson: JSON.stringify(zerodhaPayload, null, 2),
    growwCsv,
    basketCount: basketItems.length
  };
}

/**
 * Calculates sector diversification health score (0 to 100)
 */
export function calculateSectorHealthScore(
  items: SectorAllocationItem[],
  maxConcentration: number
): { score: number; label: 'Optimal' | 'Good' | 'Moderate Risk' | 'High Risk'; summary: string } {
  let score = 100;

  if (maxConcentration > 45) score -= 35;
  else if (maxConcentration > 35) score -= 20;
  else if (maxConcentration > 28) score -= 10;

  const missingCore = items.filter(
    i => (i.sector === 'Healthcare & Pharma' || i.sector === 'FMCG & Consumer Staples' || i.sector === 'Banking & Financials') && i.value === 0
  );
  score -= missingCore.length * 12;

  const totalDrift = items.reduce((sum, i) => sum + Math.abs(i.driftPercent), 0);
  if (totalDrift > 60) score -= 20;
  else if (totalDrift > 35) score -= 10;

  score = Math.max(10, Math.min(100, Math.round(score)));

  let label: 'Optimal' | 'Good' | 'Moderate Risk' | 'High Risk' = 'Optimal';
  if (score < 50) label = 'High Risk';
  else if (score < 70) label = 'Moderate Risk';
  else if (score < 85) label = 'Good';

  let summary = 'Well-diversified across multiple economic growth pillars.';
  if (maxConcentration > 40) {
    summary = `High concentration detected (${maxConcentration}% in single sector). Add defensive & capex sectors.`;
  } else if (missingCore.length > 0) {
    summary = `Missing ${missingCore.map(m => m.sector).join(', ')}. Add defensive shock absorbers.`;
  }

  return { score, label, summary };
}
