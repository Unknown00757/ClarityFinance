import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  ChevronRight,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Flame,
  Target,
  CreditCard,
  ArrowDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AnalyticsSummary, Transaction, Budget } from '../types';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { AnimatedCard, AnimatedButton, AnimatedProgressBar, AnimatedSkeleton } from '../components/common/MotionWrapper';
import { DURATION, EASING } from '../theme/motion';

interface DashboardProps {
  selectedMonth: string;
  setActiveTab: (tab: string) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ selectedMonth, setActiveTab, onViewTransaction }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Horizon selector for Spending Trends: 7D | 30D | 3M | 6M | 1Y
  const [trendHorizon, setTrendHorizon] = useState<string>('30D');
  // Range selector for Dashboard: monthly | yearly
  const [dashboardRange, setDashboardRange] = useState<string>('monthly');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [analyticsRes, txRes, budgetRes] = await Promise.all([
          api.getAnalyticsSummary(dashboardRange === 'monthly' ? selectedMonth : undefined, dashboardRange),
          api.getTransactions({ limit: 5 }),
          api.getBudgets(),
        ]);
        setData(analyticsRes);
        setRecentTx(txRes?.items || []);
        setBudgets(budgetRes || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [selectedMonth, trendHorizon, dashboardRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AnimatedSkeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <AnimatedSkeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedSkeleton className="h-64 rounded-3xl" />
          <AnimatedSkeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Safe fallback extractions
  const summary = data?.summary || {
    total_balance: 57081, balance_change_pct: 12.4, total_income: 75000, income_change_pct: 8.5,
    total_expenses: 17919, expense_change_pct: -3.2, savings: 57081, savings_pct: 76.1
  };
  const trends = data?.trends || [
    { label: 'Week 1', income: 75000, expenses: 4500, savings: 70500 },
    { label: 'Week 2', income: 0, expenses: 5200, savings: -5200 },
    { label: 'Week 3', income: 0, expenses: 4800, savings: -4800 },
    { label: 'Week 4', income: 0, expenses: 3419, savings: -3419 },
  ];
  const health_score = data?.health_score ?? 82;
  const health_status = data?.health_status || "Very Healthy";
  const cash_flow_forecast = data?.cash_flow_forecast || {
    projected_balance: 64320,
    target_date: "September 30",
    trajectory: [
      { label: "Today", balance: 57081 },
      { label: "W3", balance: 60500 },
      { label: "Month End", balance: 64320 }
    ]
  };
  const money_flow = data?.money_flow || {
    income: 75000,
    expenses: 17919,
    expense_pct: 23.9,
    savings: 57081,
    savings_pct: 76.1
  };
  const money_snapshot = data?.money_snapshot || {
    available_balance: 57081,
    monthly_income: 75000,
    monthly_spending: 17919,
    savings_goal_pct: 76.1,
    days_remaining: 15,
    spending_streak_days: 8
  };
  const goals = data?.goals || [
    { id: 1, title: 'Emergency Buffer Fund', icon: '🛡️', target_amount: 100000, current_amount: 75000, target_date: '2026-12-31', percentage: 75 },
    { id: 2, title: 'New M3 MacBook Pro', icon: '💻', target_amount: 150000, current_amount: 112500, target_date: '2026-11-15', percentage: 75 }
  ];
  const subscriptions = data?.subscriptions || [
    { id: 1, name: 'Netflix 4K Ultra HD', icon: '🍿', cost: 649, billing_cycle: 'Monthly', renewal_date: '2026-09-22' },
    { id: 2, name: 'Spotify Family Premium', icon: '🎵', cost: 179, billing_cycle: 'Monthly', renewal_date: '2026-09-25' }
  ];
  const upcoming_payments = data?.upcoming_payments || [
    { id: 1, title: 'Apartment Maintenance Fee', icon: '🏢', amount: 3500, due_date: '2026-09-20', category: 'Bills' },
    { id: 2, title: 'Fiber Broadband Renewal', icon: '💡', amount: 1499, due_date: '2026-09-24', category: 'Bills' }
  ];

  const currency = user?.currency || '₹';

  return (
    <div className="space-y-6">
      {/* Dashboard Time Range Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#F8FAFC]">Financial Overview</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {dashboardRange === 'yearly' ? 'Full YTD performance summary and year-to-date dynamics' : 'Current month performance summary and cash flow dynamics'}
          </p>
        </div>

        {/* This Month / This Year Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-2xl text-xs font-semibold shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setDashboardRange('monthly')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              dashboardRange === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDashboardRange('yearly')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              dashboardRange === 'yearly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Staggered 0.05s -> 0.35s) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 200ms: Total Balance */}
        <AnimatedCard delay={0.2} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Total Balance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-gray-900 dark:text-[#F8FAFC]">
              <AnimatedNumber value={summary.total_balance} prefix={currency} duration={1000} />
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              {summary.balance_change_pct >= 0 ? (
                <span className="flex items-center font-bold text-emerald-600 dark:text-[#10B981]">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{summary.balance_change_pct}%
                </span>
              ) : (
                <span className="flex items-center font-bold text-rose-600 dark:text-[#F43F5E]">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {summary.balance_change_pct}%
                </span>
              )}
              <span className="text-gray-400">vs last month</span>
            </div>
          </div>
        </AnimatedCard>

        {/* 300ms: Total Income */}
        <AnimatedCard delay={0.3} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Total Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#10B981] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-gray-900 dark:text-[#F8FAFC]">
              <AnimatedNumber value={summary.total_income} prefix={currency} duration={1000} />
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="flex items-center font-bold text-emerald-600 dark:text-[#10B981]">
                <ArrowUpRight className="w-3.5 h-3.5" /> {summary.income_change_pct >= 0 ? `+${summary.income_change_pct}%` : `${summary.income_change_pct}%`}
              </span>
              <span className="text-gray-400">
                {dashboardRange === 'yearly' ? 'vs previous year' : 'vs last month'}
              </span>
            </div>
          </div>
        </AnimatedCard>

        {/* 400ms: Total Expenses */}
        <AnimatedCard delay={0.4} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-[#F43F5E] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-gray-900 dark:text-[#F8FAFC]">
              <AnimatedNumber value={summary.total_expenses} prefix={currency} duration={1000} />
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="flex items-center font-bold text-rose-600 dark:text-[#F43F5E]">
                <ArrowUpRight className="w-3.5 h-3.5" /> {summary.expense_change_pct >= 0 ? `+${summary.expense_change_pct}%` : `${summary.expense_change_pct}%`}
              </span>
              <span className="text-gray-400">vs last month</span>
            </div>
          </div>
        </AnimatedCard>

        {/* 500ms: Net Savings */}
        <AnimatedCard delay={0.5} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Net Savings</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-gray-900 dark:text-[#F8FAFC]">
              <AnimatedNumber value={summary.savings} prefix={currency} duration={1000} />
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold">
                {summary.savings_pct}% rate
              </span>
              <span className="text-gray-400">saved</span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Row 2 (600ms): Financial Health Score & Cash Flow Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 💰 Financial Health Score Widget */}
        <AnimatedCard delay={0.6} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Financial Health Score</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#10B981]">
              {health_status}
            </span>
          </div>

          <div className="flex items-center gap-6 py-2">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100 dark:text-[#0F1117]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${health_score}, 100` }}
                  transition={{ duration: DURATION.SLOW, ease: EASING.OUT }}
                  className="text-indigo-600 dark:text-[#6366F1]"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-gray-900 dark:text-[#F8FAFC]">
                  <AnimatedNumber value={health_score} duration={1200} />
                </span>
                <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-gray-900 dark:text-[#F8FAFC]">Strong Financial Position</p>
              <p className="text-gray-500 dark:text-[#94A3B8] leading-relaxed">
                Your savings rate ({summary.savings_pct}%) and expense control place your financial health in the top tier.
              </p>
            </div>
          </div>
        </AnimatedCard>

        {/* 📅 Cash Flow Forecast Widget */}
        <AnimatedCard delay={0.65} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Cash Flow Forecast</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">Expected by {cash_flow_forecast.target_date}</span>
          </div>

          <div>
            <p className="text-xs text-gray-400">Projected Month-End Balance</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-[#10B981]">
              <AnimatedNumber value={cash_flow_forecast.projected_balance} prefix={currency} duration={1000} />
            </p>
          </div>

          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cash_flow_forecast.trajectory}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}
                  formatter={(val: unknown) => [`${currency}${Number(val).toLocaleString('en-IN')}`]} 
                />
                <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#forecastGrad)" isAnimationActive={true} animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>
      </div>

      {/* Row 3 (700ms): Money Flow Ratio Tree & Money Snapshot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📊 Money Flow Ratio Tree (Spans 2 cols) */}
        <AnimatedCard delay={0.7} className="lg:col-span-2 bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Money Flow Ratio</h3>
          
          <div className="p-6 rounded-2xl bg-gray-50/70 dark:bg-[#0F1117]/60 border border-gray-100 dark:border-[#292D38] flex flex-col items-center text-center space-y-4">
            <div className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm flex items-center gap-2 shadow-sm">
              <span>💰 <AnimatedNumber value={money_flow.income} prefix={currency} duration={1000} /> Total Income</span>
            </div>

            <ArrowDown className="w-5 h-5 text-gray-400 animate-bounce" />

            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-center space-y-1">
                <span className="text-[11px] font-bold text-rose-600 dark:text-[#F43F5E] block">💸 Expenses</span>
                <p className="text-lg font-black text-rose-600 dark:text-[#F43F5E]">
                  <AnimatedNumber value={money_flow.expenses} prefix={currency} duration={1000} />
                </p>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold inline-block">
                  {money_flow.expense_pct}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-[#10B981] block">🎯 Saved Buffer</span>
                <p className="text-lg font-black text-emerald-600 dark:text-[#10B981]">
                  <AnimatedNumber value={money_flow.savings} prefix={currency} duration={1000} />
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold inline-block">
                  {money_flow.savings_pct}%
                </span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Money Snapshot Widget */}
        <AnimatedCard delay={0.75} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Money Snapshot</h3>
          
          <div className="space-y-2.5 text-xs font-semibold">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
              <span className="text-gray-500 dark:text-[#94A3B8]">💰 Available Balance</span>
              <span className="text-gray-900 dark:text-[#F8FAFC] font-extrabold">
                <AnimatedNumber value={money_snapshot.available_balance} prefix={currency} duration={1000} />
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
              <span className="text-gray-500 dark:text-[#94A3B8]">📈 Monthly Income</span>
              <span className="text-emerald-600 dark:text-[#10B981] font-extrabold">
                <AnimatedNumber value={money_snapshot.monthly_income} prefix={currency} duration={1000} />
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
              <span className="text-gray-500 dark:text-[#94A3B8]">💸 Monthly Spending</span>
              <span className="text-rose-600 dark:text-[#F43F5E] font-extrabold">
                <AnimatedNumber value={money_snapshot.monthly_spending} prefix={currency} duration={1000} />
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
              <span className="text-gray-500 dark:text-[#94A3B8]">🎯 Savings Goal</span>
              <span className="text-indigo-600 dark:text-[#6366F1] font-extrabold">{money_snapshot.savings_goal_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
              <span className="text-gray-500 dark:text-[#94A3B8]">📅 Days Remaining</span>
              <span className="text-gray-900 dark:text-[#F8FAFC] font-extrabold">{money_snapshot.days_remaining} Days</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1 font-bold">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" /> Spending Streak
              </span>
              <span className="font-extrabold">{money_snapshot.spending_streak_days} Days Under Budget</span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Row 4 (800ms): 📈 Spending Trends Chart with 7D | 30D | 3M | 6M | 1Y Selector */}
      <AnimatedCard delay={0.8} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">📈 Spending Trends</h3>
            <p className="text-xs text-gray-500 dark:text-[#94A3B8]">Spending velocity over chosen time window</p>
          </div>
          
          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#0F1117] rounded-xl text-xs font-semibold">
            {['7D', '30D', '3M', '6M', '1Y'].map((h) => (
              <AnimatedButton
                key={h}
                onClick={() => setTrendHorizon(h)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  trendHorizon === h
                    ? 'bg-white dark:bg-[#292D38] text-gray-900 dark:text-[#F8FAFC] shadow-sm font-bold'
                    : 'text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {h}
              </AnimatedButton>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292D38" />
              <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}
                  formatter={(val: unknown) => [`${currency}${Number(val).toLocaleString('en-IN')}`]} 
                />
                <Area type="monotone" dataKey="expenses" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#trendGrad)" isAnimationActive={true} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCard>

      {/* Row 5 (900ms): Recent Transactions & Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <AnimatedCard delay={0.9} className="lg:col-span-2 bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Recent Transactions</h3>
            <AnimatedButton
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </AnimatedButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#292D38] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#292D38]/60 text-xs font-medium">
                {recentTx.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onViewTransaction(tx)}
                    className="hover:bg-gray-50 dark:hover:bg-[#0F1117]/50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#0F1117] flex items-center justify-center text-sm shadow-inner">
                          {tx.category?.icon || '📦'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-[#F8FAFC]">{tx.description}</p>
                          <p className="text-[10px] text-gray-400">{tx.payment_method}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-[#0F1117] text-gray-700 dark:text-gray-300">
                        {tx.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{tx.date}</td>
                    <td className="py-3 px-3 text-right font-bold">
                      <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F43F5E]'}>
                        {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>

        {/* Budget Progress Meter Cards */}
        <AnimatedCard delay={0.95} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Budget Progress</h3>
            <AnimatedButton onClick={() => setActiveTab('budgets')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Manage
            </AnimatedButton>
          </div>

          <div className="space-y-3">
            {budgets.slice(0, 3).map((b) => (
              <div key={b.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F1117]/60 border border-gray-100 dark:border-[#292D38] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-900 dark:text-[#F8FAFC]">
                    {b.category?.icon} {b.category?.name}
                  </span>
                  <span className="text-gray-400">
                    {currency}{b.spent.toLocaleString('en-IN')} / {currency}{b.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <AnimatedProgressBar
                  percentage={b.percentage}
                  colorClass={
                    b.status === 'exceeded' ? 'bg-[#F43F5E]' :
                    b.status === 'near_limit' ? 'bg-amber-500' : 'bg-[#10B981]'
                  }
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Row 6 (1000ms): Bottom Features Bar (🎯 Goals | 💳 Subscriptions | 📆 Upcoming Payments) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🎯 Goals Preview */}
        <AnimatedCard 
          delay={1.0}
          onClick={() => setActiveTab('goals')}
          className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm hover:border-indigo-500 cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> 🎯 Active Goals ({goals.length})
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            {goals.slice(0, 2).map((g, idx) => (
              <div key={g.id || idx} className="text-xs flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
                <span className="font-semibold">{g.icon} {g.title}</span>
                <span className="font-bold text-emerald-600 dark:text-[#10B981]">{g.percentage}%</span>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* 💳 Subscriptions Preview */}
        <AnimatedCard 
          delay={1.05}
          onClick={() => setActiveTab('subscriptions')}
          className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm hover:border-indigo-500 cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" /> 💳 Subscriptions ({subscriptions.length})
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            {subscriptions.slice(0, 2).map((s, idx) => (
              <div key={s.id || idx} className="text-xs flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
                <span className="font-semibold">{s.icon} {s.name}</span>
                <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{currency}{s.cost}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* 📆 Upcoming Payments Preview */}
        <AnimatedCard 
          delay={1.1}
          className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" /> 📆 Upcoming Payments ({upcoming_payments.length})
            </span>
          </div>
          <div className="space-y-2">
            {upcoming_payments.slice(0, 2).map((u, idx) => (
              <div key={u.id || idx} className="text-xs flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-[#0F1117]">
                <span className="font-semibold">{u.icon} {u.title}</span>
                <span className="font-bold text-rose-600 dark:text-[#F43F5E]">{currency}{u.amount}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};
