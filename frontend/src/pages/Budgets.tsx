import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart as PieIcon, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Trash2, 
  X,
  ShieldCheck,
  Calendar,
  Zap,
  Edit2,
  Clock,
  ArrowUpRight,
  Filter,
  Check,
  Info,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { Budget, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { AnimatedCard, AnimatedProgressBar } from '../components/common/MotionWrapper';
import { VARIANTS, DURATION, EASING } from '../theme/motion';

export const Budgets: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, on_track, near_limit, over_budget

  // Toast & Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [notes, setNotes] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        api.getBudgets(),
        api.getCategories()
      ]);
      setBudgets(bRes || []);
      const expenseCats = (cRes || []).filter(c => c.type === 'expense');
      setCategories(expenseCats);
      if (expenseCats.length > 0 && !categoryId) {
        setCategoryId(expenseCats[0].id);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setModalError(null);
    setAmount('');
    setNotes('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setShowModal(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setModalError(null);
    setCategoryId(b.category_id);
    setAmount(String(b.amount));
    setStartDate(b.start_date || '2026-09-01');
    setEndDate(b.end_date || '2026-09-30');
    setShowModal(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const numAmt = parseFloat(amount);
    if (!categoryId || categoryId === 0) {
      setModalError('Please select a category.');
      return;
    }
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      setModalError('Budget amount must be a number greater than ₹0.');
      return;
    }

    // Duplicate Check for new budgets
    if (!editingBudget) {
      const existing = budgets.find(b => b.category_id === categoryId);
      if (existing) {
        setModalError(`${existing.category?.name || 'Category'} already has an active budget for this period.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (editingBudget) {
        await api.updateBudget(editingBudget.id, {
          category_id: categoryId,
          amount: numAmt,
          start_date: startDate,
          end_date: endDate,
        });
        triggerToast('✓ Budget updated successfully');
      } else {
        await api.createBudget({
          category_id: categoryId,
          amount: numAmt,
          start_date: startDate,
          end_date: endDate,
        });
        triggerToast('✓ Budget created successfully');
      }
      setShowModal(false);
      fetchBudgets();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to save budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      await api.deleteBudget(id);
      setDeleteConfirmId(null);
      triggerToast('✓ Budget deleted successfully');
      fetchBudgets();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete budget.');
    }
  };

  const currency = user?.currency || '₹';

  // Dynamic Metrics Calculations
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  // Days Remaining calculation (for Sept 2026)
  const today = new Date('2026-09-17');
  const monthEnd = new Date('2026-09-30');
  const daysRemaining = Math.max(1, Math.ceil((monthEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = 30 - daysRemaining;
  const monthElapsedPct = Math.round((daysElapsed / 30) * 100);

  // Spending Pace calculation
  let paceStatus: 'on_track' | 'faster' | 'slower' = 'on_track';
  if (overallPercentage > monthElapsedPct + 8) paceStatus = 'faster';
  else if (overallPercentage < monthElapsedPct - 15) paceStatus = 'slower';

  // Budget Health Score calculation (0 - 100)
  let healthScore = 100;
  const overBudgetCount = budgets.filter(b => b.spent > b.amount).length;
  const nearLimitCount = budgets.filter(b => b.spent <= b.amount && b.percentage >= 80).length;
  
  healthScore -= (overBudgetCount * 18);
  healthScore -= (nearLimitCount * 8);
  if (overallPercentage > 85) healthScore -= 12;
  if (paceStatus === 'faster') healthScore -= 8;
  healthScore = Math.max(25, Math.min(100, healthScore));

  let healthBadge = { label: 'Healthy', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' };
  if (healthScore < 60) healthBadge = { label: 'At Risk', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' };
  else if (healthScore < 80) healthBadge = { label: 'Needs Attention', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' };

  // Filtered Budgets
  const filteredBudgets = budgets.filter(b => {
    if (filterStatus === 'on_track') return b.percentage <= 75;
    if (filterStatus === 'near_limit') return b.percentage > 75 && b.percentage <= 100;
    if (filterStatus === 'over_budget') return b.percentage > 100;
    return true;
  });

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={VARIANTS.staggerContainer}
      className="space-y-6 pb-8"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: DURATION.FAST, ease: EASING.OUT }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={VARIANTS.card} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
            <PieIcon className="w-3.5 h-3.5" />
            <span>Personal Budget Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC] tracking-tight">Budgets</h1>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium">
            Plan, track, and maintain complete control over category spending limits.
          </p>
        </div>

        <motion.button
          onClick={handleOpenAdd}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </motion.button>
      </motion.div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budgeted */}
        <AnimatedCard delay={0.1} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Total Budgeted</span>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-[#F8FAFC] mt-1">
            <AnimatedNumber value={totalBudgeted} prefix={currency} duration={1000} />
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">September 2026</span>
        </AnimatedCard>

        {/* Amount Spent */}
        <AnimatedCard delay={0.15} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Amount Spent</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            <AnimatedNumber value={totalSpent} prefix={currency} duration={1000} />
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{overallPercentage}% of total limit</span>
        </AnimatedCard>

        {/* Remaining Buffer */}
        <AnimatedCard delay={0.2} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Remaining Buffer</span>
          <p className={`text-2xl font-extrabold mt-1 ${totalRemaining >= 0 ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F43F5E]'}`}>
            <AnimatedNumber value={Math.abs(totalRemaining)} prefix={totalRemaining < 0 ? `-${currency}` : currency} duration={1000} />
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{totalRemaining >= 0 ? 'Unspent capacity' : 'Over budget'}</span>
        </AnimatedCard>

        {/* Active Budgets */}
        <AnimatedCard delay={0.25} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Active Budgets</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            <AnimatedNumber value={budgets.length} duration={800} />
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Configured categories</span>
        </AnimatedCard>
      </div>

      {/* Row 2: Budget Health Score, Days Remaining & Overall Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Health Score */}
        <AnimatedCard delay={0.3} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-sm">Budget Health</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${healthBadge.color}`}>
              {healthBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
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
                  animate={{ strokeDasharray: `${healthScore}, 100` }}
                  transition={{ duration: DURATION.SLOW, ease: EASING.OUT }}
                  className="text-indigo-600 dark:text-indigo-400"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-gray-900 dark:text-[#F8FAFC]">
                  <AnimatedNumber value={healthScore} duration={1000} />
                </span>
                <span className="text-[9px] text-gray-400 font-bold">/ 100</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-[#F8FAFC]">
                {healthScore >= 80 ? "On-track spending" : healthScore >= 60 ? "Moderate category pressure" : "High overspending risk"}
              </p>
              <p className="text-gray-500 dark:text-[#94A3B8] leading-relaxed text-[11px]">
                Calculated from category utilization, over-budget limits, and remaining period velocity.
              </p>
            </div>
          </div>
        </AnimatedCard>

        {/* Days Remaining & Spending Pace */}
        <AnimatedCard delay={0.35} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-sm">Budget Period & Pace</h3>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              📅 {daysRemaining} days left
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-[#94A3B8]">Overall Budget Used:</span>
              <span className="font-extrabold text-gray-900 dark:text-[#F8FAFC]">{overallPercentage}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-[#94A3B8]">Month Elapsed:</span>
              <span className="font-extrabold text-gray-900 dark:text-[#F8FAFC]">{monthElapsedPct}%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0F1117] text-xs flex items-center gap-2">
              {paceStatus === 'on_track' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">On Track: Spending is aligned with elapsed time.</span>
                </>
              )}
              {paceStatus === 'faster' && (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">Spending Faster Than Planned vs month velocity.</span>
                </>
              )}
              {paceStatus === 'slower' && (
                <>
                  <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Spending Slower Than Planned (Good buffer).</span>
                </>
              )}
            </div>
          </div>
        </AnimatedCard>

        {/* Overall Budget Progress */}
        <AnimatedCard delay={0.4} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-sm">Overall Budget Utilization</h3>
            <span className="text-xs font-extrabold text-gray-900 dark:text-[#F8FAFC]">
              {currency}{totalSpent.toLocaleString('en-IN')} / {currency}{totalBudgeted.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2">
            <AnimatedProgressBar
              percentage={overallPercentage}
              colorClass={overallPercentage > 100 ? 'bg-rose-500' : overallPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'}
              className="h-3.5 rounded-full"
            />
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400 pt-1">
              <span>{overallPercentage}% total capacity used</span>
              <span>{totalRemaining >= 0 ? `${currency}${totalRemaining.toLocaleString('en-IN')} left` : `${currency}${Math.abs(totalRemaining).toLocaleString('en-IN')} over`}</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Combined utilization across all active category budgets for September 2026.
          </p>
        </AnimatedCard>
      </div>

      {/* Category Filter Controls */}
      <motion.div variants={VARIANTS.card} className="flex items-center justify-between pt-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-[#F8FAFC]">Category Budgets</h3>
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-2xl text-xs font-semibold shadow-sm">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
          {[
            { id: 'all', label: 'All' },
            { id: 'on_track', label: 'On Track' },
            { id: 'near_limit', label: 'Near Limit' },
            { id: 'over_budget', label: 'Over Budget' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === f.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Category Budget Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-gray-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      ) : filteredBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredBudgets.map((b, idx) => {
              const isOver = b.spent > b.amount;
              const overAmt = Math.max(0, b.spent - b.amount);
              const remainingAmt = Math.max(0, b.amount - b.spent);

              let statusBadge = { label: '✓ On Track', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/50' };
              if (b.percentage < 50) {
                statusBadge = { label: '✓ Low Usage', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/50' };
              } else if (b.percentage >= 100) {
                statusBadge = { label: '! Over Budget', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/50' };
              } else if (b.percentage >= 75) {
                statusBadge = { label: '⚠️ Near Limit', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/50' };
              }

              return (
                <motion.div
                  key={b.id}
                  variants={VARIANTS.listRow}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={{ y: -3 }}
                  transition={{ duration: DURATION.FAST, ease: EASING.OUT }}
                  className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all space-y-4 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-[#0F1117] border border-gray-100 dark:border-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0"
                      >
                        {b.category?.icon || '📦'}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">{b.category?.name}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">{b.start_date} to {b.end_date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Edit Budget"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(b.id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contextual Alert Banner */}
                  {b.percentage >= 75 && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      isOver ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        {isOver
                          ? `${b.category?.name} is over its monthly limit by ${currency}${overAmt.toLocaleString('en-IN')}`
                          : `You're approaching your ${b.category?.name} budget limit.`}
                      </span>
                    </div>
                  )}

                  {/* Progress Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-900 dark:text-[#F8FAFC]">
                        {currency}{b.spent.toLocaleString('en-IN')} spent
                      </span>
                      <span className="text-gray-400">
                        {currency}{b.amount.toLocaleString('en-IN')} limit
                      </span>
                    </div>

                    {/* Progress Bar capped visually at 100% */}
                    <AnimatedProgressBar
                      percentage={b.percentage}
                      colorClass={
                        isOver ? 'bg-rose-500' :
                        b.percentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }
                      className="h-3"
                    />

                    <div className="flex justify-between text-[11px] font-semibold text-gray-500 dark:text-[#94A3B8] pt-0.5">
                      <span>{b.percentage}% used</span>
                      <span>
                        {isOver ? (
                          <span className="text-rose-500 font-bold">{currency}{overAmt.toLocaleString('en-IN')} over budget</span>
                        ) : (
                          <span>{currency}{remainingAmt.toLocaleString('en-IN')} left</span>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div 
          variants={VARIANTS.card}
          className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-3xl p-12 text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto text-2xl">
            <PieIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">No budgets found</h3>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
            {filterStatus === 'all'
              ? 'Create category budgets to start tracking your spending against planned limits.'
              : `No active budgets match the "${filterStatus.replace('_', ' ')}" filter criteria.`}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
          >
            + Set Category Budget
          </motion.button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 6 }}
              transition={{ duration: DURATION.FAST, ease: EASING.OUT }}
              className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Delete Budget?</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#94A3B8] leading-relaxed">
                Are you sure you want to remove this category budget? This will remove its limit tracking.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#292D38] text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                >
                  Delete Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Budget Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: DURATION.NORMAL, ease: EASING.OUT }}
              className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#292D38] pb-3">
                <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-lg">
                  {editingBudget ? 'Edit Category Budget' : 'Set Category Budget'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveBudget} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    disabled={!!editingBudget}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-semibold focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Monthly Limit ({currency}) *</label>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Budget</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

