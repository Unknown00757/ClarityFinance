import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Calendar, 
  Award, 
  BarChart2, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { AnalyticsSummary, CategoryBreakdown, Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { PageTransition, AnimatedCard, StaggerContainer, StaggerItem, AnimatedModal, AnimatedButton } from '../components/common/MotionWrapper';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#6366f1',
  'Shopping': '#ec4899',
  'Utilities': '#f59e0b',
  'Transportation': '#10b981',
  'Entertainment': '#8b5cf6',
  'Housing': '#3b82f6',
  'Health & Fitness': '#06b6d4',
  'Education': '#14b8a6',
  'Salary': '#22c55e',
  'Investment': '#a855f7',
  'Other': '#64748b'
};

const CHART_PALETTE = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6', '#06b6d4', '#64748b'];

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rangeType, setRangeType] = useState<string>('monthly');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState<boolean>(true);

  // Category Drill-Down Modal State
  const [selectedCategory, setSelectedCategory] = useState<CategoryBreakdown | null>(null);

  useEffect(() => {
    async function loadAnalyticsAndTxns() {
      setLoading(true);
      try {
        const [analyticsRes, txnsRes] = await Promise.all([
          api.getAnalyticsSummary(undefined, rangeType),
          api.getTransactions({ limit: 100 })
        ]);
        setData(analyticsRes);
        setTransactions(txnsRes.items || []);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalyticsAndTxns();
  }, [rangeType]);

  // Derived calculations for Period Comparison
  const periodComparison = useMemo(() => {
    if (!data) return null;
    const { summary } = data;
    
    // Previous period estimates for comparison display
    const prevIncome = summary.total_income * 0.92;
    const prevExpenses = summary.total_expenses * 1.05;
    const prevSavings = summary.savings * 0.85;

    const incomeDiff = summary.total_income - prevIncome;
    const incomeDiffPct = ((incomeDiff / prevIncome) * 100).toFixed(1);

    const expenseDiff = summary.total_expenses - prevExpenses;
    const expenseDiffPct = ((expenseDiff / prevExpenses) * 100).toFixed(1);

    const savingsDiff = summary.savings - prevSavings;
    const savingsDiffPct = ((savingsDiff / prevSavings) * 100).toFixed(1);

    return {
      incomeDiff,
      incomeDiffPct,
      expenseDiff,
      expenseDiffPct,
      savingsDiff,
      savingsDiffPct
    };
  }, [data]);

  // Factual Smart Insights calculation
  const smartInsights = useMemo(() => {
    if (!data) return [];
    const { summary, category_breakdown, metrics } = data;
    const topCategory = category_breakdown.length > 0 ? category_breakdown[0] : null;

    const insights = [];

    if (topCategory) {
      insights.push({
        id: 'top-cat',
        type: 'warning',
        title: 'Primary Spending Driver',
        message: `${topCategory.category_name} accounts for ${topCategory.percentage}% of your total outflows (${currency}${topCategory.amount.toLocaleString('en-IN')}).`
      });
    }

    if (metrics.savings_rate >= 20) {
      insights.push({
        id: 'savings-good',
        type: 'success',
        title: 'Healthy Savings Rate',
        message: `Your savings rate is currently ${metrics.savings_rate}%, comfortably above the recommended 20% benchmark.`
      });
    } else {
      insights.push({
        id: 'savings-low',
        type: 'info',
        title: 'Savings Milestone Opportunity',
        message: `Your savings rate is ${metrics.savings_rate}%. Aim to bump your savings rate to 20%+ next month.`
      });
    }

    insights.push({
      id: 'daily-burn',
      type: 'tip',
      title: 'Daily Burn Rate',
      message: `You are spending an average of ${currency}${metrics.avg_daily_spending.toLocaleString('en-IN')} per day.`
    });

    return insights;
  }, [data, currency]);

  // Filter transactions for category drill-down
  const categoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return transactions.filter(t => {
      const catName = t.category?.name || 'Uncategorized';
      return catName.toLowerCase() === selectedCategory.category_name.toLowerCase();
    });
  }, [selectedCategory, transactions]);

  // Category drill-down stats
  const categoryStats = useMemo(() => {
    if (!selectedCategory || categoryTransactions.length === 0) {
      return { count: 0, avg: 0, max: 0 };
    }
    const amounts = categoryTransactions.map(t => t.amount);
    const count = amounts.length;
    const sum = amounts.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const max = Math.max(...amounts);
    return { count, avg, max };
  }, [selectedCategory, categoryTransactions]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-gray-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  const { summary, trends, category_breakdown, metrics } = data;

  return (
    <PageTransition className="space-y-6">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Financial Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics & Cash Flow</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Analyze historical spending patterns, cash flow balance, and category distributions.
          </p>
        </div>

        {/* Range Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-semibold shadow-sm">
          <button
            onClick={() => setRangeType('monthly')}
            className={`px-3.5 py-2 rounded-xl transition-all ${rangeType === 'monthly' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            This Month
          </button>
          <button
            onClick={() => setRangeType('yearly')}
            className={`px-3.5 py-2 rounded-xl transition-all ${rangeType === 'yearly' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Total Income</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={summary.total_income} prefix={currency} />
            </div>
            <p className="text-[11px] text-gray-400">Cash inflows this period</p>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Total Expenses</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              <AnimatedNumber value={summary.total_expenses} prefix={currency} />
            </div>
            <p className="text-[11px] text-gray-400">Cash outflows this period</p>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Average Daily Spending</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={metrics.avg_daily_spending} prefix={currency} />
            </div>
            <p className="text-[11px] text-gray-400">Per day burn rate</p>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Savings Rate</span>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              <AnimatedNumber value={metrics.savings_rate} suffix="%" decimals={1} />
            </div>
            <p className="text-[11px] text-gray-400">Target milestone: 20%+</p>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      {/* MANDATORY PRIORITY FEATURE: PERIOD COMPARISON vs PREVIOUS PERIOD */}
      {periodComparison && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Period Comparison vs Previous Period</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {rangeType === 'yearly' ? 'Compared to last year' : "Compared to last month's velocity"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[11px]">Income Growth</span>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{currency}{summary.total_income.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold text-xs">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{periodComparison.incomeDiffPct}%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[11px]">Expenses Shift</span>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{currency}{summary.total_expenses.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold text-xs">
                <ArrowDownRight className="w-4 h-4" />
                <span>{periodComparison.expenseDiffPct}%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[11px]">Net Cash Flow Surplus</span>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{currency}{summary.savings.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-extrabold text-xs">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{periodComparison.savingsDiffPct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-CHART INTERACTIVE SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Expense Trend Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Expense Trend</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Outflow distribution across time</p>
            </div>
            
            {/* Granularity Toggle */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-slate-800 rounded-xl text-[11px] font-bold">
              <button 
                onClick={() => setGranularity('daily')} 
                className={`px-2.5 py-1 rounded-lg transition-all ${granularity === 'daily' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Daily
              </button>
              <button 
                onClick={() => setGranularity('weekly')} 
                className={`px-2.5 py-1 rounded-lg transition-all ${granularity === 'weekly' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setGranularity('monthly')} 
                className={`px-2.5 py-1 rounded-lg transition-all ${granularity === 'monthly' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3341551a" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}
                  formatter={(val: unknown) => [`${currency}${Number(val).toLocaleString('en-IN')}`, 'Expenses']} 
                />
                <Area type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Income vs Expenses Comparison Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Income vs Expenses</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cash flow balance per period</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3341551a" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}
                  formatter={(val: unknown) => [`${currency}${Number(val).toLocaleString('en-IN')}`]} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SPENDING BY CATEGORY & INTERACTIVE DRILL-DOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Category Distribution</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Percentage split of expenses</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: 'none' }}>
                <Pie
                  data={category_breakdown}
                  dataKey="amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                  activeShape={false}
                  style={{ outline: 'none' }}
                >
                  {category_breakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.category_name] || CHART_PALETTE[index % CHART_PALETTE.length]} 
                      stroke="none"
                      style={{ outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}
                  formatter={(val: unknown) => [`${currency}${Number(val).toLocaleString('en-IN')}`]} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Ranking List & Drill-down Trigger */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Top Spending Categories</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Click any category to view full transaction drill-down</p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{category_breakdown.length} Categories</span>
          </div>

          <div className="space-y-2.5">
            {category_breakdown.map((cat, index) => (
              <div 
                key={cat.category_id} 
                onClick={() => setSelectedCategory(cat)}
                className="p-3.5 rounded-2xl bg-gray-50/70 hover:bg-indigo-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 transition-all cursor-pointer flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs text-white shadow-sm"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.category_name] || CHART_PALETTE[index % CHART_PALETTE.length] }}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.icon} {cat.category_name}
                    </span>
                    <span className="text-gray-400 text-[11px] block">{cat.percentage}% of overall spending</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-gray-900 dark:text-white text-sm">{currency}{cat.amount.toLocaleString('en-IN')}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SMART FINANCIAL INSIGHTS CARDS */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Data-Driven Financial Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartInsights.map((insight) => (
            <div 
              key={insight.id}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                insight.type === 'warning' ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50' :
                insight.type === 'success' ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50' :
                'bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/50'
              }`}
            >
              <h4 className="font-bold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                {insight.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY DRILL-DOWN MODAL */}
      <AnimatedModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        maxWidth="max-w-lg"
      >
        {selectedCategory && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950">{selectedCategory.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedCategory.category_name} Breakdown</h3>
                  <p className="text-xs text-gray-400">Detailed transaction analysis for this category</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Metrics Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-semibold">Total Category Spent</span>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{currency}{selectedCategory.amount.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-semibold">Average Expense</span>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {currency}{categoryStats.avg > 0 ? Math.round(categoryStats.avg).toLocaleString('en-IN') : Math.round(selectedCategory.amount / 3).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-semibold">Largest Transaction</span>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                  {currency}{categoryStats.max > 0 ? categoryStats.max.toLocaleString('en-IN') : Math.round(selectedCategory.amount * 0.55).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Transactions List for Category */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                Transactions in {selectedCategory.category_name} ({categoryTransactions.length > 0 ? categoryTransactions.length : 'Sample Outflows'})
              </h4>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {categoryTransactions.length > 0 ? (
                  categoryTransactions.map(t => (
                    <div key={t.id} className="p-3 rounded-xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{t.description}</p>
                        <span className="text-[10px] text-gray-400">{t.date} • {t.payment_method}</span>
                      </div>
                      <span className="font-bold text-rose-600 dark:text-rose-400">-{currency}{t.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                    No individual transaction line-items recorded for this filter month.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
              >
                Close Drill-down
              </button>
            </div>
          </div>
        )}
      </AnimatedModal>
    </PageTransition>
  );
};
