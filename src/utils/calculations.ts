/**
 * Financial Calculation Engines for FinBoom
 */

// 1. SIP Calculator
export interface SipResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyBreakdown: { year: number; invested: number; total: number }[];
}

export function calculateSip(monthlyInvestment: number, annualRate: number, years: number): SipResult {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  
  let totalValue = 0;
  if (monthlyRate === 0) {
    totalValue = monthlyInvestment * months;
  } else {
    totalValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  }

  const investedAmount = monthlyInvestment * months;
  const estimatedReturns = Math.max(0, totalValue - investedAmount);

  const yearlyBreakdown: { year: number; invested: number; total: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    const inv = monthlyInvestment * m;
    const tot = monthlyRate === 0
      ? inv
      : monthlyInvestment * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
    yearlyBreakdown.push({ year: y, invested: Math.round(inv), total: Math.round(tot) });
  }

  return {
    investedAmount: Math.round(investedAmount),
    estimatedReturns: Math.round(estimatedReturns),
    totalValue: Math.round(totalValue),
    yearlyBreakdown
  };
}

// 2. Lumpsum Compound Growth
export interface LumpsumResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyBreakdown: { year: number; invested: number; total: number }[];
}

export function calculateLumpsum(principal: number, annualRate: number, years: number): LumpsumResult {
  const rate = annualRate / 100;
  const totalValue = principal * Math.pow(1 + rate, years);
  const estimatedReturns = Math.max(0, totalValue - principal);

  const yearlyBreakdown: { year: number; invested: number; total: number }[] = [];
  for (let y = 1; y <= years; y++) {
    yearlyBreakdown.push({
      year: y,
      invested: Math.round(principal),
      total: Math.round(principal * Math.pow(1 + rate, y))
    });
  }

  return {
    investedAmount: Math.round(principal),
    estimatedReturns: Math.round(estimatedReturns),
    totalValue: Math.round(totalValue),
    yearlyBreakdown
  };
}

// 3. XIRR Calculation (Extended Internal Rate of Return)
export interface CashflowDateItem {
  amount: number; // Negative for investment, Positive for redemption/current value
  date: string; // YYYY-MM-DD
}

export function calculateXirr(cashflows: CashflowDateItem[]): number | null {
  if (cashflows.length < 2) return null;
  const sorted = [...cashflows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const startDate = new Date(sorted[0].date).getTime();
  const datesInYears = sorted.map(cf => (new Date(cf.date).getTime() - startDate) / (365.25 * 24 * 3600 * 1000));
  const amounts = sorted.map(cf => cf.amount);

  // Newton-Raphson approximation
  let rate = 0.1; // Initial 10% guess
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let iter = 0; iter < maxIterations; iter++) {
    let fValue = 0;
    let fDerivative = 0;

    for (let i = 0; i < amounts.length; i++) {
      const dt = datesInYears[i];
      const denom = Math.pow(1 + rate, dt);
      if (denom === 0) continue;
      fValue += amounts[i] / denom;
      fDerivative -= (dt * amounts[i]) / (denom * (1 + rate));
    }

    if (Math.abs(fValue) < tolerance) {
      return Number((rate * 100).toFixed(2));
    }

    if (Math.abs(fDerivative) < 1e-12) break;

    const newRate = rate - fValue / fDerivative;
    if (newRate <= -0.999) {
      rate = -0.999;
    } else {
      rate = newRate;
    }
  }

  return isNaN(rate) ? null : Number((rate * 100).toFixed(2));
}

// 4. Loan EMI & Prepayment Amortization
export interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  prepayment: number;
  closingBalance: number;
}

export interface LoanCalculationResult {
  monthlyEmi: number;
  totalInterestWithoutPrepayment: number;
  totalAmountWithoutPrepayment: number;
  totalInterestWithPrepayment: number;
  totalAmountWithPrepayment: number;
  interestSaved: number;
  monthsSaved: number;
  schedule: AmortizationRow[];
  yearlySchedule: { year: number; principalPaid: number; interestPaid: number; endingBalance: number }[];
}

export function calculateLoanAmortization(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  extraMonthlyPrepayment: number = 0,
  lumpsumPrepaymentMonth: number = 0,
  lumpsumPrepaymentAmount: number = 0
): LoanCalculationResult {
  const monthlyRate = annualRate / 12 / 100;
  
  // Standard EMI calculation
  const emi = monthlyRate === 0
    ? principal / tenureMonths
    : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  // Baseline without prepayment
  let baseBalance = principal;
  let baseTotalInterest = 0;
  for (let m = 1; m <= tenureMonths; m++) {
    const interest = baseBalance * monthlyRate;
    const principalPaid = Math.min(baseBalance, emi - interest);
    baseTotalInterest += interest;
    baseBalance -= principalPaid;
    if (baseBalance <= 0) break;
  }

  // Simulation with Prepayments
  let balance = principal;
  let totalInterestPaid = 0;
  const schedule: AmortizationRow[] = [];
  let month = 0;

  while (balance > 1 && month < tenureMonths + 24) {
    month++;
    const openingBalance = balance;
    const interest = balance * monthlyRate;
    let regularPrincipal = Math.min(balance, emi - interest);
    let extra = extraMonthlyPrepayment;
    
    if (month === lumpsumPrepaymentMonth) {
      extra += lumpsumPrepaymentAmount;
    }

    const totalPrincipal = Math.min(balance, regularPrincipal + extra);
    balance = Math.max(0, balance - totalPrincipal);
    totalInterestPaid += interest;

    schedule.push({
      month,
      openingBalance: Math.round(openingBalance),
      emi: Math.round(emi),
      principal: Math.round(regularPrincipal),
      interest: Math.round(interest),
      prepayment: Math.round(extra),
      closingBalance: Math.round(balance)
    });

    if (balance <= 0) break;
  }

  // Aggregate Yearly Schedule
  const yearlySchedule: { year: number; principalPaid: number; interestPaid: number; endingBalance: number }[] = [];
  let curYearPrincipal = 0;
  let curYearInterest = 0;

  schedule.forEach((row) => {
    curYearPrincipal += row.principal + row.prepayment;
    curYearInterest += row.interest;
    if (row.month % 12 === 0 || row.month === schedule.length) {
      yearlySchedule.push({
        year: Math.ceil(row.month / 12),
        principalPaid: Math.round(curYearPrincipal),
        interestPaid: Math.round(curYearInterest),
        endingBalance: Math.round(row.closingBalance)
      });
      curYearPrincipal = 0;
      curYearInterest = 0;
    }
  });

  const monthsSaved = Math.max(0, tenureMonths - schedule.length);
  const interestSaved = Math.max(0, baseTotalInterest - totalInterestPaid);

  return {
    monthlyEmi: Math.round(emi),
    totalInterestWithoutPrepayment: Math.round(baseTotalInterest),
    totalAmountWithoutPrepayment: Math.round(principal + baseTotalInterest),
    totalInterestWithPrepayment: Math.round(totalInterestPaid),
    totalAmountWithPrepayment: Math.round(principal + totalInterestPaid),
    interestSaved: Math.round(interestSaved),
    monthsSaved,
    schedule,
    yearlySchedule
  };
}

// 5. FIRE & Retirement Engine
export interface FireResult {
  targetCorpus: number;
  leanFireCorpus: number;
  fatFireCorpus: number;
  coastFireCorpus: number;
  futureMonthlyExpense: number;
  monthlySipNeeded: number;
  currentProgressPercent: number;
  yearsToFire: number;
}

export function calculateFire(
  currentMonthlyExpense: number,
  currentAge: number,
  targetAge: number,
  currentNetWorth: number,
  expectedInflation: number = 6.0,
  expectedReturnPreRetirement: number = 12.0,
  safeWithdrawalRate: number = 4.0 // 4% rule = 25x annual expenses
): FireResult {
  const yearsToRetire = Math.max(1, targetAge - currentAge);
  
  // Future monthly expense adjusted for inflation
  const futureMonthlyExpense = currentMonthlyExpense * Math.pow(1 + expectedInflation / 100, yearsToRetire);
  const futureAnnualExpense = futureMonthlyExpense * 12;

  // Standard FIRE = 100 / SWR multiplier (e.g. 25x or 30x)
  const multiplier = 100 / safeWithdrawalRate;
  const targetCorpus = futureAnnualExpense * multiplier;
  const leanFireCorpus = targetCorpus * 0.75; // 75% baseline essentials
  const fatFireCorpus = targetCorpus * 1.35; // 135% luxury buffer

  // Coast FIRE: Amount needed TODAY that will grow to Target Corpus without adding another penny
  const coastFireCorpus = targetCorpus / Math.pow(1 + expectedReturnPreRetirement / 100, yearsToRetire);

  // Future value of current portfolio
  const futureValueOfCurrentNetWorth = currentNetWorth * Math.pow(1 + expectedReturnPreRetirement / 100, yearsToRetire);
  const remainingGap = Math.max(0, targetCorpus - futureValueOfCurrentNetWorth);

  // Required monthly SIP to bridge the gap
  const monthlyRate = expectedReturnPreRetirement / 12 / 100;
  const months = yearsToRetire * 12;
  const monthlySipNeeded = monthlyRate === 0
    ? remainingGap / months
    : remainingGap / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

  const currentProgressPercent = Math.min(100, Number(((currentNetWorth / targetCorpus) * 100).toFixed(1)));

  return {
    targetCorpus: Math.round(targetCorpus),
    leanFireCorpus: Math.round(leanFireCorpus),
    fatFireCorpus: Math.round(fatFireCorpus),
    coastFireCorpus: Math.round(coastFireCorpus),
    futureMonthlyExpense: Math.round(futureMonthlyExpense),
    monthlySipNeeded: Math.round(monthlySipNeeded),
    currentProgressPercent,
    yearsToFire: yearsToRetire
  };
}

// 6. Sovereign Gold Bond (SGB) Calculator
export interface SgbResult {
  investedAmount: number;
  semiAnnualCouponPayout: number;
  totalCouponInterest: number;
  expectedMaturityGoldValue: number;
  totalReturns: number;
  cagr: number;
}

export function calculateSgb(
  grams: number,
  issuePricePerGram: number,
  expectedMaturityPricePerGram: number,
  years: number = 8
): SgbResult {
  const investedAmount = grams * issuePricePerGram;
  const annualCouponRate = 0.025; // 2.5% fixed sovereign interest
  const semiAnnualCouponPayout = (investedAmount * annualCouponRate) / 2;
  const totalCouponInterest = semiAnnualCouponPayout * (years * 2);
  const expectedMaturityGoldValue = grams * expectedMaturityPricePerGram;
  const totalReturns = expectedMaturityGoldValue + totalCouponInterest;
  
  const totalGain = totalReturns - investedAmount;
  const cagr = investedAmount > 0 ? (Math.pow(totalReturns / investedAmount, 1 / years) - 1) * 100 : 0;

  return {
    investedAmount: Math.round(investedAmount),
    semiAnnualCouponPayout: Math.round(semiAnnualCouponPayout),
    totalCouponInterest: Math.round(totalCouponInterest),
    expectedMaturityGoldValue: Math.round(expectedMaturityGoldValue),
    totalReturns: Math.round(totalReturns),
    cagr: Number(cagr.toFixed(2))
  };
}

// 7. PPF Calculator
export interface PpfResult {
  investedAmount: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakdown: { year: number; deposit: number; interest: number; balance: number }[];
}

export function calculatePpf(annualDeposit: number, annualInterestRate: number = 7.1, years: number = 15): PpfResult {
  const rate = annualInterestRate / 100;
  let balance = 0;
  let totalDeposit = 0;
  let totalInterest = 0;
  const yearlyBreakdown: { year: number; deposit: number; interest: number; balance: number }[] = [];

  for (let y = 1; y <= years; y++) {
    totalDeposit += annualDeposit;
    const interest = (balance + annualDeposit) * rate;
    totalInterest += interest;
    balance = balance + annualDeposit + interest;
    
    yearlyBreakdown.push({
      year: y,
      deposit: Math.round(annualDeposit),
      interest: Math.round(interest),
      balance: Math.round(balance)
    });
  }

  return {
    investedAmount: Math.round(totalDeposit),
    totalInterest: Math.round(totalInterest),
    maturityAmount: Math.round(balance),
    yearlyBreakdown
  };
}
