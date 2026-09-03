import React, { useState } from 'react';
import {
  calculateSip,
  calculateLumpsum,
  calculateXirr,
  calculateFire,
  calculateLoanAmortization,
  calculateSgb,
  calculatePpf,
  CashflowDateItem
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';
import { PrivacyValue } from '../common/PrivacyValue';
import {
  Calculator,
  TrendingUp,
  Flame,
  Landmark,
  ShieldCheck,
  Coins,
  PiggyBank,
  Plus,
  Trash2,
  Sparkles,
  PieChart as ChartIcon,
  Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type CalculatorTab = 'sip' | 'lumpsum' | 'xirr' | 'fire' | 'loan' | 'emergency' | 'sgb' | 'ppf';

export const CalculatorSuite: React.FC = () => {
  const { currency, isPrivacyMode, isDarkMode, totalMonthlyExpenses, netWorth } = useFinance();
  const [activeTab, setActiveTab] = useState<CalculatorTab>('sip');

  // 1. SIP State
  const [sipMonthly, setSipMonthly] = useState<number>(25000);
  const [sipRate, setSipRate] = useState<number>(12);
  const [sipYears, setSipYears] = useState<number>(10);
  const sipResult = calculateSip(sipMonthly, sipRate, sipYears);

  // 2. Lumpsum State
  const [lumpPrincipal, setLumpPrincipal] = useState<number>(500000);
  const [lumpRate, setLumpRate] = useState<number>(12);
  const [lumpYears, setLumpYears] = useState<number>(10);
  const lumpsumResult = calculateLumpsum(lumpPrincipal, lumpRate, lumpYears);

  // 3. XIRR State
  const [xirrCashflows, setXirrCashflows] = useState<CashflowDateItem[]>([
    { amount: -100000, date: '2023-01-15' },
    { amount: -50000, date: '2023-07-20' },
    { amount: -75000, date: '2024-02-10' },
    { amount: 310000, date: '2026-02-28' }, // Current valuation
  ]);
  const xirrResult = calculateXirr(xirrCashflows);

  // 4. FIRE State
  const [fireExpense, setFireExpense] = useState<number>(totalMonthlyExpenses || 80000);
  const [fireCurrentAge, setFireCurrentAge] = useState<number>(30);
  const [fireTargetAge, setFireTargetAge] = useState<number>(45);
  const [fireCurrentCorpus, setFireCurrentCorpus] = useState<number>(netWorth || 20000000);
  const [fireInflation, setFireInflation] = useState<number>(6);
  const [fireReturnRate, setFireReturnRate] = useState<number>(12);
  const [fireSwr, setFireSwr] = useState<number>(4.0); // 4% rule = 25x
  const fireResult = calculateFire(fireExpense, fireCurrentAge, fireTargetAge, fireCurrentCorpus, fireInflation, fireReturnRate, fireSwr);

  // 5. Loan EMI State
  const [loanPrincipal, setLoanPrincipal] = useState<number>(3000000);
  const [loanRate, setLoanRate] = useState<number>(8.5);
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(180);
  const [loanExtraMonthly, setLoanExtraMonthly] = useState<number>(5000);
  const loanResult = calculateLoanAmortization(loanPrincipal, loanRate, loanTenureMonths, loanExtraMonthly);

  // 6. Emergency Fund State
  const [emMonthlyBurn, setEmMonthlyBurn] = useState<number>(totalMonthlyExpenses || 70000);
  const [emMonthsTarget, setEmMonthsTarget] = useState<number>(6);
  const emTargetCorpus = emMonthlyBurn * emMonthsTarget;

  // 7. SGB State
  const [sgbGrams, setSgbGrams] = useState<number>(50); // 50 grams
  const [sgbIssuePrice, setSgbIssuePrice] = useState<number>(6200);
  const [sgbMaturityPrice, setSgbMaturityPrice] = useState<number>(12500);
  const sgbResult = calculateSgb(sgbGrams, sgbIssuePrice, sgbMaturityPrice);

  // 8. PPF State
  const [ppfAnnualDeposit, setPpfAnnualDeposit] = useState<number>(150000);
  const [ppfRate, setPpfRate] = useState<number>(7.1);
  const ppfResult = calculatePpf(ppfAnnualDeposit, ppfRate, 15);

  // Add/remove XIRR cashflows
  const addXirrRow = () => {
    setXirrCashflows(prev => [...prev, { amount: -25000, date: new Date().toISOString().split('T')[0] }]);
  };
  const removeXirrRow = (idx: number) => {
    setXirrCashflows(prev => prev.filter((_, i) => i !== idx));
  };
  const updateXirrRow = (idx: number, field: 'amount' | 'date', val: any) => {
    setXirrCashflows(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const calculatorsList: { id: CalculatorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
    { id: 'lumpsum', label: 'Lumpsum Compounding', icon: Calculator },
    { id: 'xirr', label: 'XIRR Annualized Return', icon: ChartIcon },
    { id: 'fire', label: 'FIRE & Retirement', icon: Flame },
    { id: 'loan', label: 'Loan EMI & Prepayment', icon: Landmark },
    { id: 'emergency', label: 'Emergency Fund', icon: ShieldCheck },
    { id: 'sgb', label: 'SGB Gold Return', icon: Coins },
    { id: 'ppf', label: 'PPF / EPF Maturity', icon: PiggyBank },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/10 via-white to-gray-50 dark:from-[#101914] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2C6E49] to-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Financial Calculators Suite
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Privacy-focused calculation engines for compounding, loan prepayments, SGB gold, and FIRE roadmaps
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {calculatorsList.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#2C6E49] text-white shadow-xs'
                  : 'bg-white dark:bg-[#141a17] text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SIP CALCULATOR */}
      {activeTab === 'sip' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
              Systematic Investment Plan (SIP)
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 dark:text-gray-300">Monthly Investment</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatCurrency(sipMonthly, currency, false, isPrivacyMode)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={sipMonthly}
                onChange={(e) => setSipMonthly(Number(e.target.value))}
                className="w-full accent-[#2C6E49]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 dark:text-gray-300">Expected Annual Return Rate</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{sipRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={sipRate}
                onChange={(e) => setSipRate(Number(e.target.value))}
                className="w-full accent-[#2C6E49]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 dark:text-gray-300">Time Period</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{sipYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={sipYears}
                onChange={(e) => setSipYears(Number(e.target.value))}
                className="w-full accent-[#2C6E49]"
              />
            </div>
          </div>

          {/* Results & Visuals */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111614] border border-gray-100 dark:border-gray-800/80">
                <span className="text-[10px] uppercase font-mono text-gray-400">Total Invested</span>
                <div className="text-base font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                  <PrivacyValue amountInINR={sipResult.investedAmount} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] uppercase font-mono text-emerald-700 dark:text-emerald-300">Est. Returns</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  +<PrivacyValue amountInINR={sipResult.estimatedReturns} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-mono text-emerald-800 dark:text-emerald-300">Future Value</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5">
                  <PrivacyValue amountInINR={sipResult.totalValue} />
                </div>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sipResult.yearlyBreakdown}>
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} tickFormatter={(y) => `Yr ${y}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v, currency, true, isPrivacyMode)} />
                  <Tooltip />
                  <Area type="monotone" dataKey="invested" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. LUMPSUM CALCULATOR */}
      {activeTab === 'lumpsum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
              Lumpsum One-Time Compounding
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 dark:text-gray-300">Total Investment Amount</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatCurrency(lumpPrincipal, currency, false, isPrivacyMode)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={lumpPrincipal}
                onChange={(e) => setLumpPrincipal(Number(e.target.value))}
                className="w-full accent-[#2C6E49]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 dark:text-gray-300">Expected Annual Return Rate</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{lumpRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={lumpRate}
                onChange={(e) => setLumpRate(Number(e.target.value))}
                className="w-full accent-[#2C6E49]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 dark:text-gray-300">Time Period</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{lumpYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={lumpYears}
                onChange={(e) => setLumpYears(Number(e.target.value))}
                className="w-full accent-[#2C6E49]"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111614] border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400">Principal</span>
                <div className="text-base font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                  <PrivacyValue amountInINR={lumpsumResult.investedAmount} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] uppercase font-mono text-emerald-700 dark:text-emerald-300">Wealth Gained</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  +<PrivacyValue amountInINR={lumpsumResult.estimatedReturns} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-mono text-emerald-800 dark:text-emerald-300">Maturity Value</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5">
                  <PrivacyValue amountInINR={lumpsumResult.totalValue} />
                </div>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lumpsumResult.yearlyBreakdown}>
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} tickFormatter={(y) => `Yr ${y}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v, currency, true, isPrivacyMode)} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. XIRR CALCULATOR */}
      {activeTab === 'xirr' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
                Extended Internal Rate of Return (XIRR)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Exact annualized performance for irregular SIP installments and redemptions
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono uppercase text-gray-400">Calculated XIRR</span>
              <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                {xirrResult !== null ? `${xirrResult}% p.a.` : 'Calculating...'}
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {xirrCashflows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121815]/50">
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => updateXirrRow(idx, 'date', e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
                />
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">₹</span>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateXirrRow(idx, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="Negative for SIP, Positive for Current Value"
                    className={`w-full h-8 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono font-bold ${
                      row.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  />
                </div>
                <button
                  onClick={() => removeXirrRow(idx)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addXirrRow}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2C6E49] dark:text-emerald-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cash Flow Date</span>
          </button>
        </div>
      )}

      {/* 4. FIRE & RETIREMENT CALCULATOR */}
      {activeTab === 'fire' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-display flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              FIRE Engine (Financial Independence)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Monthly Living Expenses (₹)
              </label>
              <input
                type="number"
                value={fireExpense}
                onChange={(e) => setFireExpense(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Age</label>
                <input
                  type="number"
                  value={fireCurrentAge}
                  onChange={(e) => setFireCurrentAge(parseInt(e.target.value) || 25)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target FIRE Age</label>
                <input
                  type="number"
                  value={fireTargetAge}
                  onChange={(e) => setFireTargetAge(parseInt(e.target.value) || 45)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expected Inflation %</label>
                <input
                  type="number"
                  step="0.5"
                  value={fireInflation}
                  onChange={(e) => setFireInflation(parseFloat(e.target.value) || 6)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Safe Withdrawal Rate (SWR %)</label>
                <input
                  type="number"
                  step="0.5"
                  value={fireSwr}
                  onChange={(e) => setFireSwr(parseFloat(e.target.value) || 4)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                <span className="text-[10px] font-mono uppercase text-purple-700 dark:text-purple-300">Target FIRE Number</span>
                <div className="text-xl font-bold font-display text-purple-600 dark:text-purple-400 mt-0.5">
                  <PrivacyValue amountInINR={fireResult.targetCorpus} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">25x annual future expense</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-300">Monthly SIP Needed</span>
                <div className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <PrivacyValue amountInINR={fireResult.monthlySipNeeded} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">To reach target in {fireResult.yearsToFire} years</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111614]">
                <span className="text-[10px] uppercase font-mono text-gray-400">Lean FIRE (75%)</span>
                <div className="text-sm font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                  <PrivacyValue amountInINR={fireResult.leanFireCorpus} compact={true} />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111614]">
                <span className="text-[10px] uppercase font-mono text-gray-400">Coast FIRE</span>
                <div className="text-sm font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                  <PrivacyValue amountInINR={fireResult.coastFireCorpus} compact={true} />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111614]">
                <span className="text-[10px] uppercase font-mono text-gray-400">Fat FIRE (135%)</span>
                <div className="text-sm font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                  <PrivacyValue amountInINR={fireResult.fatFireCorpus} compact={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. LOAN EMI PREPAYMENT CALCULATOR */}
      {activeTab === 'loan' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
            Loan EMI & Prepayment Advantage
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Loan Principal (₹)</label>
              <input
                type="number"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Interest Rate (% APR)</label>
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={(e) => setLoanRate(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tenure (Months)</label>
              <input
                type="number"
                value={loanTenureMonths}
                onChange={(e) => setLoanTenureMonths(parseInt(e.target.value) || 12)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Extra Monthly Prepayment (₹)</label>
              <input
                type="number"
                value={loanExtraMonthly}
                onChange={(e) => setLoanExtraMonthly(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111614] border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase font-mono text-gray-400">Regular Monthly EMI</span>
              <div className="text-base font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                <PrivacyValue amountInINR={loanResult.monthlyEmi} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
              <span className="text-[10px] uppercase font-mono text-emerald-700 dark:text-emerald-300">Interest Saved</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                +<PrivacyValue amountInINR={loanResult.interestSaved} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <span className="text-[10px] uppercase font-mono text-blue-700 dark:text-blue-300">Months Saved</span>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                {loanResult.monthsSaved} Months ({ (loanResult.monthsSaved/12).toFixed(1) } yrs)
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
              <span className="text-[10px] uppercase font-mono text-purple-700 dark:text-purple-300">Total Interest Paid</span>
              <div className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                <PrivacyValue amountInINR={loanResult.totalInterestWithPrepayment} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMERGENCY FUND CALCULATOR */}
      {activeTab === 'emergency' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
            Emergency Fund Reserve Calculator
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Monthly Essential Expenses (Rent, Food, EMIs, Utilities) (₹)
              </label>
              <input
                type="number"
                value={emMonthlyBurn}
                onChange={(e) => setEmMonthlyBurn(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Runway Coverage (Months)
              </label>
              <select
                value={emMonthsTarget}
                onChange={(e) => setEmMonthsTarget(parseInt(e.target.value) || 6)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm text-gray-900 dark:text-white"
              >
                <option value="3">3 Months (Dual income, highly stable job)</option>
                <option value="6">6 Months (Standard recommended buffer)</option>
                <option value="9">9 Months (Single earner + dependents)</option>
                <option value="12">12 Months (Freelancers, founders, business owners)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 font-mono uppercase">
                Recommended Emergency Corpus
              </span>
              <div className="text-2xl font-bold font-display text-emerald-700 dark:text-emerald-400 mt-1">
                <PrivacyValue amountInINR={emTargetCorpus} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs text-right">
              Keep 70% in high-yield bank FDs and 30% in instant redemption liquid funds.
            </p>
          </div>
        </div>
      )}

      {/* 7. SGB CALCULATOR */}
      {activeTab === 'sgb' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
            Sovereign Gold Bond (SGB) 8-Year Return Estimator
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Grams of Gold</label>
              <input
                type="number"
                value={sgbGrams}
                onChange={(e) => setSgbGrams(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Issue Price per Gram (₹)</label>
              <input
                type="number"
                value={sgbIssuePrice}
                onChange={(e) => setSgbIssuePrice(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Estimated Gold Price at 8-Yr Maturity (₹)</label>
              <input
                type="number"
                value={sgbMaturityPrice}
                onChange={(e) => setSgbMaturityPrice(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111614] border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase font-mono text-gray-400">Total Invested</span>
              <div className="text-base font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                <PrivacyValue amountInINR={sgbResult.investedAmount} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
              <span className="text-[10px] uppercase font-mono text-amber-700 dark:text-amber-300">2.5% Interest Payouts</span>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                +<PrivacyValue amountInINR={sgbResult.totalCouponInterest} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
              <span className="text-[10px] uppercase font-mono text-emerald-700 dark:text-emerald-300">Maturity Gold Value</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                <PrivacyValue amountInINR={sgbResult.expectedMaturityGoldValue} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-mono text-emerald-800 dark:text-emerald-300">Total 100% Tax-Free Value</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5">
                <PrivacyValue amountInINR={sgbResult.totalReturns} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. PPF / EPF CALCULATOR */}
      {activeTab === 'ppf' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a17] border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base font-display">
            Public Provident Fund (PPF) Compounding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Annual Deposit Amount (Max ₹1.5 Lakhs)
              </label>
              <input
                type="number"
                max="150000"
                value={ppfAnnualDeposit}
                onChange={(e) => setPpfAnnualDeposit(Math.min(150000, parseFloat(e.target.value) || 0))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Govt Interest Rate (% p.a. EEE Tax-Free)
              </label>
              <input
                type="number"
                step="0.1"
                value={ppfRate}
                onChange={(e) => setPpfRate(parseFloat(e.target.value) || 7.1)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#19221d] text-sm font-mono text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111614] border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] uppercase font-mono text-gray-400">Total 15-Yr Deposit</span>
              <div className="text-base font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                <PrivacyValue amountInINR={ppfResult.investedAmount} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
              <span className="text-[10px] uppercase font-mono text-emerald-700 dark:text-emerald-300">Total Tax-Free Interest</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                +<PrivacyValue amountInINR={ppfResult.totalInterest} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-mono text-emerald-800 dark:text-emerald-300">15-Year Maturity Corpus</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display mt-0.5">
                <PrivacyValue amountInINR={ppfResult.maturityAmount} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
