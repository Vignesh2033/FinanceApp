import {
  SentimentZone,
  MarketPillarScore,
  FearGreedData,
  TacticalAllocationAdvice,
  ValuationBandPoint,
  EquitySector
} from '../types/finance';

/**
 * Institutional 5-Year Nifty 50 Historical Valuation Data Points
 * Tracks Trailing P/E against ±1 Standard Deviation Valuation Bands (17.5x to 24.5x)
 */
export const HISTORICAL_VALUATION_SERIES: ValuationBandPoint[] = [
  { date: '2021-03', yearMonth: 'Mar 2021', niftyPE: 33.2, niftyPrice: 14690, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'Post-COVID EPS Distortions' },
  { date: '2021-09', yearMonth: 'Sep 2021', niftyPE: 27.4, niftyPrice: 17618, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'Liquidity Peak (Greed)' },
  { date: '2022-03', yearMonth: 'Mar 2022', niftyPE: 22.8, niftyPrice: 17464, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5 },
  { date: '2022-06', yearMonth: 'Jun 2022', niftyPE: 19.3, niftyPrice: 15780, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'Global Rate Hike Panic (Fear)' },
  { date: '2022-12', yearMonth: 'Dec 2022', niftyPE: 21.8, niftyPrice: 18105, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5 },
  { date: '2023-03', yearMonth: 'Mar 2023', niftyPE: 20.1, niftyPrice: 17359, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'SVB Crisis Dip (Fair Value)' },
  { date: '2023-09', yearMonth: 'Sep 2023', niftyPE: 22.2, niftyPrice: 19638, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5 },
  { date: '2023-12', yearMonth: 'Dec 2023', niftyPE: 22.9, niftyPrice: 21731, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'Year-End Rally (Greed)' },
  { date: '2024-03', yearMonth: 'Mar 2024', niftyPE: 22.7, niftyPrice: 22326, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5 },
  { date: '2024-06', yearMonth: 'Jun 2024', niftyPE: 21.6, niftyPrice: 23290, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'Election Results Volatility' },
  { date: '2024-09', yearMonth: 'Sep 2024', niftyPE: 23.8, niftyPrice: 25810, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'Nifty 26,000 Milestone' },
  { date: '2024-12', yearMonth: 'Dec 2024', niftyPE: 22.4, niftyPrice: 24180, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5 },
  { date: '2025-03', yearMonth: 'Mar 2025', niftyPE: 21.9, niftyPrice: 24650, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5 },
  { date: '2025-09', yearMonth: 'Sep 2025', niftyPE: 22.3, niftyPrice: 25420, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5 },
  { date: '2026-03', yearMonth: 'Mar 2026', niftyPE: 22.1, niftyPrice: 25890, upperBand: 24.5, medianBand: 20.5, lowerBand: 17.5, eventLabel: 'Current Market Equilibrium' },
];

export interface SectorSentimentItem {
  sector: EquitySector;
  sentiment: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  pe: number;
  historicalPE: number;
  discountOrPremium: number; // percentage
  statusLabel: string;
  badgeColor: string;
  recommendedAction: string;
}

export const SECTOR_SENTIMENT_BREAKDOWN: SectorSentimentItem[] = [
  {
    sector: 'Banking & Financials',
    sentiment: 'FEAR',
    pe: 16.8,
    historicalPE: 21.2,
    discountOrPremium: -20.8,
    statusLabel: '🟢 Bargain Accumulation',
    badgeColor: '#10b981',
    recommendedAction: 'Aggressively accumulate large private & PSU lenders (HDFC, ICICI, SBI) at heavy 20% discount.'
  },
  {
    sector: 'Healthcare & Pharma',
    sentiment: 'FEAR',
    pe: 28.5,
    historicalPE: 32.0,
    discountOrPremium: -10.9,
    statusLabel: '🟢 Defensive Discount',
    badgeColor: '#10b981',
    recommendedAction: 'Ideal shock-absorber sector. Accumulate Sun Pharma, Cipla for steady dividend and dollar export tailwinds.'
  },
  {
    sector: 'Automobile & EV',
    sentiment: 'FEAR',
    pe: 21.0,
    historicalPE: 24.5,
    discountOrPremium: -14.3,
    statusLabel: '🟢 Value Zone',
    badgeColor: '#10b981',
    recommendedAction: 'Accumulate commercial and PV leaders (Tata Motors, M&M, Maruti) ahead of rural demand recovery.'
  },
  {
    sector: 'FMCG & Consumer Staples',
    sentiment: 'NEUTRAL',
    pe: 42.0,
    historicalPE: 44.0,
    discountOrPremium: -4.5,
    statusLabel: '⚪ Fair Value Anchor',
    badgeColor: '#64748b',
    recommendedAction: 'Maintain target weights in ITC, HUL. Good low-beta stability anchor during market volatility.'
  },
  {
    sector: 'Energy & Conglomerate',
    sentiment: 'NEUTRAL',
    pe: 17.5,
    historicalPE: 18.2,
    discountOrPremium: -3.8,
    statusLabel: '⚪ Fair Equilibrium',
    badgeColor: '#64748b',
    recommendedAction: 'Hold core conglomerate anchors (Reliance, ONGC, NTPC) for robust cash generation and green capex.'
  },
  {
    sector: 'Information Technology & AI',
    sentiment: 'GREED',
    pe: 33.4,
    historicalPE: 26.5,
    discountOrPremium: +26.0,
    statusLabel: '🟡 Valuation Premium',
    badgeColor: '#f59e0b',
    recommendedAction: 'Trim overextended speculative tech positions. Maintain core Tier-1 giants (TCS, Infosys) via staggered SIPs only.'
  },
  {
    sector: 'Telecommunications & Internet',
    sentiment: 'NEUTRAL',
    pe: 27.5,
    historicalPE: 29.0,
    discountOrPremium: -5.2,
    statusLabel: '⚪ Steady Growth',
    badgeColor: '#64748b',
    recommendedAction: 'Hold Bharti Airtel. Benefit from 5G ARPU tariff hikes and expanding enterprise digital cloud revenues.'
  },
  {
    sector: 'Retail & Discretionary',
    sentiment: 'GREED',
    pe: 55.0,
    historicalPE: 48.0,
    discountOrPremium: +14.6,
    statusLabel: '🟡 High Growth Premium',
    badgeColor: '#f59e0b',
    recommendedAction: 'Selective stock picking. Avoid high-multiple consumer durables; prefer omnichannel retailers (Trent, DMart).'
  },
  {
    sector: 'Metals & Mining',
    sentiment: 'NEUTRAL',
    pe: 14.5,
    historicalPE: 15.0,
    discountOrPremium: -3.3,
    statusLabel: '⚪ Cyclical Middle',
    badgeColor: '#64748b',
    recommendedAction: 'Hold Tata Steel, Hindalco. Play global infrastructure and copper demand with tight trailing stop losses.'
  },
  {
    sector: 'Infra, Defence & Capex',
    sentiment: 'EXTREME_GREED',
    pe: 36.0,
    historicalPE: 28.0,
    discountOrPremium: +28.6,
    statusLabel: '🔴 Euphoria Zone',
    badgeColor: '#ef4444',
    recommendedAction: 'Exercise caution on PSU defence & railway stocks. Take partial profits on multi-bagger runs; deploy into undervalued Banking.'
  }
];

/**
 * Calculates Tactical Asset Allocation & SIP Staggering Guidance based on Score
 */
export function getTacticalAdvice(score: number): TacticalAllocationAdvice {
  if (score <= 25) {
    return {
      zone: 'EXTREME_FEAR',
      headline: 'Generational Value Buying Opportunity',
      sipMultiplier: 1.4, // +40% step-up
      sipAdvice: '⚡ Supercharge monthly equity SIP by +40%. Accelerate DCA while valuations are oversold.',
      cashDeploymentPercent: 25,
      cashAdvice: 'Deploy 25% of liquid cash reserves into broad Nifty 50 / Large-Cap index funds.',
      equityStance: 'AGGRESSIVE_BUY',
      keyAction: 'Aggressively Buy & Accumulate Discount Sectors',
      rationale: 'Markets are heavily oversold with extreme pessimism. Historically, buying at these levels delivers superior 3-5 year CAGR (>18%).'
    };
  } else if (score <= 45) {
    return {
      zone: 'FEAR',
      headline: 'Selective Value Accumulation Zone',
      sipMultiplier: 1.2, // +20% step-up
      sipAdvice: '🟢 Step up monthly SIP by +20% across undervalued sectors (Banking, Pharma, Auto).',
      cashDeploymentPercent: 15,
      cashAdvice: 'Deploy 10% to 15% of surplus cash reserves on 3% to 5% market pullbacks.',
      equityStance: 'SELECTIVE_ACCUMULATION',
      keyAction: 'Accumulate Quality Leaders on Market Dips',
      rationale: 'Risk-reward is highly favorable. Valuations are trading below 10-year historical medians with low downside risk.'
    };
  } else if (score <= 55) {
    return {
      zone: 'NEUTRAL',
      headline: 'Fair Value Equilibrium',
      sipMultiplier: 1.0, // Standard SIP
      sipAdvice: '⚖️ Continue standard SIP investments strictly according to your strategic target asset allocation.',
      cashDeploymentPercent: 0,
      cashAdvice: 'Keep emergency and dry powder cash parked in Arbitrage / Liquid funds (yielding ~6.8%).',
      equityStance: 'HOLD_REBALANCE',
      keyAction: 'Maintain Disciplined Asset Allocation & Rebalance Drift',
      rationale: 'Markets are trading near fair value equilibrium (Nifty P/E ~20.5x to 22.5x). Focus on portfolio hygiene and sector balance.'
    };
  } else if (score <= 75) {
    return {
      zone: 'GREED',
      headline: 'Elevated Optimism & Valuation Caution',
      sipMultiplier: 0.9, // -10% step-down
      sipAdvice: '🟡 Moderate fresh equity lump sums. Continue steady SIPs but do not chase overextended momentum stocks.',
      cashDeploymentPercent: 0,
      cashAdvice: 'Accumulate dry powder cash reserves in High-Yield Liquid funds to prepare for upcoming pullbacks.',
      equityStance: 'TRIM_EUPHORIA',
      keyAction: 'Build Cash Buffers & Trim Overextended Winners',
      rationale: 'Valuations are trading in the top 30th percentile (+1 SD above median). Maintain discipline and tighten trailing stop losses.'
    };
  } else {
    return {
      zone: 'EXTREME_GREED',
      headline: 'Market Euphoria & High Valuation Risk',
      sipMultiplier: 0.75, // -25% step-down
      sipAdvice: '🔴 Reduce fresh equity lump-sum deployments. Divert 25% of fresh savings into Arbitrage & Short-Term Debt.',
      cashDeploymentPercent: 0,
      cashAdvice: 'Preserve cash. Take partial profits on multi-bagger high-beta stocks and rebalance back to safe asset targets.',
      equityStance: 'DEFENSIVE_CASH',
      keyAction: 'Enforce Rigorous Profit-Taking & Rebalance to Debt',
      rationale: 'Buffett Indicator (>125%) and Nifty P/E (>24.5x) signal extreme euphoria and heightened risk of a sharp 8% to 15% correction.'
    };
  }
}

/**
 * Calculates Composite Indian Market Sentiment & Valuation Radar
 */
export function calculateMarketSentiment(): FearGreedData {
  // Live / Benchmark Market Constants
  const niftyCurrentPrice = 25890;
  const niftyCurrentPE = 22.1;
  const indiaVix = 13.4;
  const buffettIndicatorPercent = 108.5; // Market Cap to GDP
  const gSec10YYield = 6.82;
  const niftyEarningsYield = (1 / niftyCurrentPE) * 100; // 4.52%
  const erpSpreadPercent = parseFloat((niftyEarningsYield - gSec10YYield).toFixed(2)); // -2.30%
  const stocksAbove200DMA = 64.2; // % of Nifty 500

  // 1. India VIX Volatility Pillar (Weight: 20%)
  // VIX 10-12: Greed (75), 12-15: Neutral (50), 15-20: Fear (30), >22: Extreme Fear (15)
  let vixScore = 52;
  let vixStatus: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED' = 'NEUTRAL';
  let vixStatusLabel = '⚪ Balanced Volatility';
  let vixColor = '#64748b';

  if (indiaVix < 12.0) {
    vixScore = 78;
    vixStatus = 'GREED';
    vixStatusLabel = '🟡 Low Volatility Complacency';
    vixColor = '#f59e0b';
  } else if (indiaVix <= 15.0) {
    vixScore = 52;
    vixStatus = 'NEUTRAL';
    vixStatusLabel = '⚪ Normal Volatility';
    vixColor = '#64748b';
  } else if (indiaVix <= 20.0) {
    vixScore = 32;
    vixStatus = 'FEAR';
    vixStatusLabel = '🟢 Elevated Panic (Accumulation)';
    vixColor = '#10b981';
  } else {
    vixScore = 15;
    vixStatus = 'EXTREME_FEAR';
    vixStatusLabel = '🟢 High Panic Washout';
    vixColor = '#10b981';
  }

  // 2. Nifty 50 Trailing P/E Pillar (Weight: 25%)
  // Historical 10Y Median = 20.5x, +1 SD = 24.5x, -1 SD = 17.5x
  let peScore = 58;
  let peStatus: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED' = 'NEUTRAL';
  let peStatusLabel = '⚪ Fair Valuation';
  let peColor = '#64748b';

  if (niftyCurrentPE < 17.5) {
    peScore = 12;
    peStatus = 'EXTREME_FEAR';
    peStatusLabel = '🟢 Deep Value (-1 SD)';
    peColor = '#10b981';
  } else if (niftyCurrentPE < 20.5) {
    peScore = 35;
    peStatus = 'FEAR';
    peStatusLabel = '🟢 Value Discount';
    peColor = '#10b981';
  } else if (niftyCurrentPE <= 22.8) {
    peScore = 58;
    peStatus = 'NEUTRAL';
    peStatusLabel = '⚪ Fair Value (22.1x)';
    peColor = '#64748b';
  } else if (niftyCurrentPE <= 24.5) {
    peScore = 74;
    peStatus = 'GREED';
    peStatusLabel = '🟡 Modest Premium';
    peColor = '#f59e0b';
  } else {
    peScore = 90;
    peStatus = 'EXTREME_GREED';
    peStatusLabel = '🔴 High Valuation Euphoria (+1 SD)';
    peColor = '#ef4444';
  }

  // 3. Buffett Indicator (Market Cap to GDP) (Weight: 15%)
  // India Total M-Cap ~₹425L Cr / GDP ~₹392L Cr = 108.5%
  let buffettScore = 65;
  let buffettStatus: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED' = 'GREED';
  let buffettStatusLabel = '🟡 Modestly Overvalued';
  let buffettColor = '#f59e0b';

  if (buffettIndicatorPercent < 80) {
    buffettScore = 20;
    buffettStatus = 'EXTREME_FEAR';
    buffettStatusLabel = '🟢 Undervalued (<80%)';
    buffettColor = '#10b981';
  } else if (buffettIndicatorPercent <= 95) {
    buffettScore = 45;
    buffettStatus = 'NEUTRAL';
    buffettStatusLabel = '⚪ Fair Value Band';
    buffettColor = '#64748b';
  } else if (buffettIndicatorPercent <= 115) {
    buffettScore = 65;
    buffettStatus = 'GREED';
    buffettStatusLabel = '🟡 Modest Premium (108%)';
    buffettColor = '#f59e0b';
  } else {
    buffettScore = 88;
    buffettStatus = 'EXTREME_GREED';
    buffettStatusLabel = '🔴 Extreme Euphoria (>115%)';
    buffettColor = '#ef4444';
  }

  // 4. Equity Risk Premium (ERP) Spread (Weight: 15%)
  let erpScore = 56;
  let erpStatus: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED' = 'NEUTRAL';
  let erpStatusLabel = '⚪ Healthy Yield Spread';
  let erpColor = '#64748b';

  if (erpSpreadPercent > -1.0) {
    erpScore = 25;
    erpStatus = 'FEAR';
    erpStatusLabel = '🟢 High Equity Reward Spread';
    erpColor = '#10b981';
  } else if (erpSpreadPercent >= -2.5) {
    erpScore = 56;
    erpStatus = 'NEUTRAL';
    erpStatusLabel = '⚪ Normal Indian Spread (-2.3%)';
    erpColor = '#64748b';
  } else {
    erpScore = 78;
    erpStatus = 'GREED';
    erpStatusLabel = '🟡 Low Equity Risk Cushion';
    erpColor = '#f59e0b';
  }

  // 5. Market Breadth & Momentum (% Stocks > 200-DMA) (Weight: 15%)
  let breadthScore = 60;
  let breadthStatus: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED' = 'GREED';
  let breadthStatusLabel = '🟡 Solid Bullish Momentum';
  let breadthColor = '#f59e0b';

  if (stocksAbove200DMA < 30) {
    breadthScore = 15;
    breadthStatus = 'EXTREME_FEAR';
    breadthStatusLabel = '🟢 Oversold Washout (<30%)';
    breadthColor = '#10b981';
  } else if (stocksAbove200DMA <= 45) {
    breadthScore = 35;
    breadthStatus = 'FEAR';
    breadthStatusLabel = '🟢 Weak Momentum (Dip Accumulation)';
    breadthColor = '#10b981';
  } else if (stocksAbove200DMA <= 60) {
    breadthScore = 50;
    breadthStatus = 'NEUTRAL';
    breadthStatusLabel = '⚪ Healthy Balanced Breadth';
    breadthColor = '#64748b';
  } else if (stocksAbove200DMA <= 75) {
    breadthScore = 60;
    breadthStatus = 'GREED';
    breadthStatusLabel = '🟡 Strong Bullish Breadth (64%)';
    breadthColor = '#f59e0b';
  } else {
    breadthScore = 85;
    breadthStatus = 'EXTREME_GREED';
    breadthStatusLabel = '🔴 Overbought Breadth (>75%)';
    breadthColor = '#ef4444';
  }

  // 6. Institutional Flow Dynamics (FII & DII 30D Trend) (Weight: 10%)
  const instScore = 54;
  const instStatus = 'NEUTRAL';
  const instStatusLabel = '⚪ DII Domestic SIP Absorption';
  const instColor = '#64748b';

  // Weighted Composite Fear & Greed Score (0 to 100)
  const compositeScore = Math.round(
    vixScore * 0.20 +
    peScore * 0.25 +
    buffettScore * 0.15 +
    erpScore * 0.15 +
    breadthScore * 0.15 +
    instScore * 0.10
  );

  let zone: SentimentZone = 'NEUTRAL';
  let label = 'Neutral Equilibrium';
  let description = 'Indian market is currently in a balanced consolidation phase. Large-cap valuations are fair while mid/small caps reflect moderate growth optimism.';

  if (compositeScore <= 25) {
    zone = 'EXTREME_FEAR';
    label = 'Extreme Fear (Generational Buy)';
    description = 'High panic and heavy selling across indices. Historically, this represents the highest reward-to-risk accumulation window.';
  } else if (compositeScore <= 45) {
    zone = 'FEAR';
    label = 'Fear (Value Accumulation)';
    description = 'Negative market sentiment with multiple sectors trading at attractive valuation discounts.';
  } else if (compositeScore <= 55) {
    zone = 'NEUTRAL';
    label = 'Neutral Equilibrium';
    description = 'Market is trading around long-term historical averages. Disciplined SIP asset allocation is optimal.';
  } else if (compositeScore <= 75) {
    zone = 'GREED';
    label = 'Greed (Elevated Optimism)';
    description = 'High investor confidence and low volatility. Moderate risk of mean-reverting sector rotations.';
  } else {
    zone = 'EXTREME_GREED';
    label = 'Extreme Greed (Euphoria Caution)';
    description = 'Overheated valuations and excessive speculation. Recommended to build dry powder and enforce rebalancing.';
  }

  const pillars: MarketPillarScore[] = [
    {
      id: 'pillar-pe',
      name: 'Nifty 50 Trailing P/E',
      category: 'Valuation Multiple',
      score: peScore,
      weight: 0.25,
      currentValStr: `${niftyCurrentPE}x`,
      benchmarkStr: '10Y Median: 20.5x (±1 SD: 17.5x - 24.5x)',
      status: peStatus,
      statusLabel: peStatusLabel,
      description: 'Nifty 50 Trailing 12-Month Price-to-Earnings ratio vs historical standard deviation bands.',
      badgeColor: peColor
    },
    {
      id: 'pillar-vix',
      name: 'India VIX Volatility',
      category: 'Market Sentiment',
      score: vixScore,
      weight: 0.20,
      currentValStr: `${indiaVix}`,
      benchmarkStr: 'Normal Band: 12.0 - 15.5',
      status: vixStatus,
      statusLabel: vixStatusLabel,
      description: 'Annualized 30-day expected market volatility derived from Nifty options order books.',
      badgeColor: vixColor
    },
    {
      id: 'pillar-buffett',
      name: 'Buffett Indicator',
      category: 'Macro Valuation',
      score: buffettScore,
      weight: 0.15,
      currentValStr: `${buffettIndicatorPercent}%`,
      benchmarkStr: 'Historical Fair Value: 85% - 95%',
      status: buffettStatus,
      statusLabel: buffettStatusLabel,
      description: 'Total Indian Listed Equities Market Capitalization as a percentage of Nominal GDP.',
      badgeColor: buffettColor
    },
    {
      id: 'pillar-erp',
      name: 'Equity Risk Premium (ERP)',
      category: 'Yield Spread',
      score: erpScore,
      weight: 0.15,
      currentValStr: `${erpSpreadPercent}%`,
      benchmarkStr: '10Y G-Sec: 6.82% vs Nifty Yield: 4.52%',
      status: erpStatus,
      statusLabel: erpStatusLabel,
      description: 'Yield compensation investors earn by holding equities over risk-free government bonds.',
      badgeColor: erpColor
    },
    {
      id: 'pillar-breadth',
      name: 'Market Breadth (>200-DMA)',
      category: 'Price Momentum',
      score: breadthScore,
      weight: 0.15,
      currentValStr: `${stocksAbove200DMA}%`,
      benchmarkStr: 'Bullish Threshold: >60%',
      status: breadthStatus,
      statusLabel: breadthStatusLabel,
      description: 'Percentage of Nifty 500 constituents holding above their long-term 200-day moving average.',
      badgeColor: breadthColor
    },
    {
      id: 'pillar-flows',
      name: 'Institutional FII & DII Flows',
      category: 'Liquidity Velocity',
      score: instScore,
      weight: 0.10,
      currentValStr: 'Net +₹15.5k Cr',
      benchmarkStr: 'DII: +₹24.0k Cr | FII: -₹8.5k Cr (30D)',
      status: instStatus,
      statusLabel: instStatusLabel,
      description: 'Domestic mutual fund SIP flows consistently absorbing foreign institutional volatility.',
      badgeColor: instColor
    }
  ];

  const tacticalAdvice = getTacticalAdvice(compositeScore);

  return {
    compositeScore,
    zone,
    label,
    description,
    pillars,
    tacticalAdvice,
    lastUpdated: new Date().toISOString(),
    niftyCurrentPrice,
    niftyCurrentPE,
    indiaVix,
    buffettIndicatorPercent,
    erpSpreadPercent
  };
}
