import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Calendar, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit2, 
  Eye, 
  DollarSign, 
  ShieldCheck, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoalItem } from '../types';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { AnimatedCard, AnimatedProgressBar } from '../components/common/MotionWrapper';
import { VARIANTS, DURATION, EASING } from '../theme/motion';

const CATEGORY_ICONS = [
  { label: 'Emergency', icon: '🛡️' },
  { label: 'Technology', icon: '💻' },
  { label: 'Travel', icon: '✈️' },
  { label: 'Education', icon: '🎓' },
  { label: 'Home', icon: '🏠' },
  { label: 'Vehicle', icon: '🚗' },
  { label: 'Personal', icon: '🎯' },
  { label: 'Investment', icon: '📈' },
];

export const Goals: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const [goals, setGoals] = useState<GoalItem[]>([
    { 
      id: 1, 
      title: 'Emergency Buffer Fund', 
      icon: '🛡️', 
      target_amount: 100000, 
      current_amount: 75000, 
      target_date: '2026-12-31', 
      percentage: 75,
      category: 'Emergency',
      monthly_contribution: 10000,
      notes: '3.5 months of essential expenses covered.'
    },
    { 
      id: 2, 
      title: 'New M3 MacBook Pro', 
      icon: '💻', 
      target_amount: 150000, 
      current_amount: 112500, 
      target_date: '2026-11-15', 
      percentage: 75,
      category: 'Technology',
      monthly_contribution: 15000,
      notes: '16-inch M3 Max for developer workstation.'
    },
    { 
      id: 3, 
      title: 'Japan Monsoon Vacation', 
      icon: '✈️', 
      target_amount: 200000, 
      current_amount: 90000, 
      target_date: '2027-04-10', 
      percentage: 45,
      category: 'Travel',
      monthly_contribution: 12000,
      notes: 'Flights and ryokan bookings.'
    },
  ]);

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [showAddSavingsModal, setShowAddSavingsModal] = useState<GoalItem | null>(null);
  const [viewingGoalDetails, setViewingGoalDetails] = useState<GoalItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Goal Form Fields
  const [title, setTitle] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');
  const [category, setCategory] = useState<string>('Personal');
  const [selectedIcon, setSelectedIcon] = useState<string>('🎯');
  const [monthlyContrib, setMonthlyContrib] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Add Savings Form
  const [savingsAmountToAdd, setSavingsAmountToAdd] = useState<string>('');
  const [savingsNote, setSavingsNote] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('2026-12-31');
    setCategory('Personal');
    setSelectedIcon('🎯');
    setMonthlyContrib('');
    setNotes('');
    setModalError(null);
    setShowGoalModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (g: GoalItem) => {
    setEditingGoal(g);
    setTitle(g.title);
    setTargetAmount(String(g.target_amount));
    setCurrentAmount(String(g.current_amount));
    setTargetDate(g.target_date);
    setCategory(g.category || 'Personal');
    setSelectedIcon(g.icon || '🎯');
    setMonthlyContrib(g.monthly_contribution ? String(g.monthly_contribution) : '');
    setNotes(g.notes || '');
    setModalError(null);
    setShowGoalModal(true);
  };

  // Save Goal Handler
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const numTarget = parseFloat(targetAmount);
    const numCurrent = parseFloat(currentAmount) || 0;
    const numContrib = parseFloat(monthlyContrib) || 0;

    if (!title.trim()) {
      setModalError('Please enter a goal title.');
      return;
    }
    if (!targetAmount || isNaN(numTarget) || numTarget <= 0) {
      setModalError('Target amount must be a number greater than ₹0.');
      return;
    }
    if (!targetDate) {
      setModalError('Please select a target date.');
      return;
    }

    const pct = Math.min(100, Math.round((numCurrent / numTarget) * 100));

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? {
        ...g,
        title: title.trim(),
        target_amount: numTarget,
        current_amount: numCurrent,
        target_date: targetDate,
        percentage: pct,
        icon: selectedIcon,
        category,
        monthly_contribution: numContrib,
        notes: notes.trim(),
      } : g));
      triggerToast('✓ Goal updated successfully');
    } else {
      const newGoal: GoalItem = {
        id: Date.now(),
        title: title.trim(),
        icon: selectedIcon,
        target_amount: numTarget,
        current_amount: numCurrent,
        target_date: targetDate,
        percentage: pct,
        category,
        monthly_contribution: numContrib,
        notes: notes.trim(),
      };
      setGoals([...goals, newGoal]);
      triggerToast('✓ Goal created successfully');
    }

    setShowGoalModal(false);
  };

  // Add Savings Handler
  const handleAddSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddSavingsModal) return;

    const addAmt = parseFloat(savingsAmountToAdd);
    if (!savingsAmountToAdd || isNaN(addAmt) || addAmt <= 0) {
      alert('Please enter a valid savings amount greater than 0.');
      return;
    }

    const updatedGoals = goals.map(g => {
      if (g.id === showAddSavingsModal.id) {
        const newCurrent = g.current_amount + addAmt;
        const newPct = Math.min(100, Math.round((newCurrent / g.target_amount) * 100));
        return {
          ...g,
          current_amount: newCurrent,
          percentage: newPct
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    triggerToast(`✓ ${currency}${addAmt.toLocaleString('en-IN')} added to ${showAddSavingsModal.title}`);
    setShowAddSavingsModal(null);
    setSavingsAmountToAdd('');
    setSavingsNote('');
  };

  // Delete Goal
  const confirmDelete = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
    setDeleteConfirmId(null);
    triggerToast('✓ Goal deleted successfully');
  };

  // Overall Aggregates
  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const overallRemaining = Math.max(0, totalTarget - totalSaved);

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
            <Target className="w-3.5 h-3.5" />
            <span>Personal Financial Goal Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC] tracking-tight">Savings Goals</h1>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium">
            Define target milestones, track savings progress, and plan required monthly contributions.
          </p>
        </div>

        <motion.button
          onClick={handleOpenCreate}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </motion.button>
      </motion.div>

      {/* Top 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnimatedCard delay={0.1} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Total Goal Target</span>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-[#F8FAFC] mt-1">
            <AnimatedNumber value={totalTarget} prefix={currency} duration={1000} />
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Combined milestone target</span>
        </AnimatedCard>

        <AnimatedCard delay={0.15} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Total Saved Progress</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-[#10B981] mt-1">
            <AnimatedNumber value={totalSaved} prefix={currency} duration={1000} />
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{overallPercentage}% overall saved</span>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Active Milestones</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            <AnimatedNumber value={goals.length} duration={800} /> Goals
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{currency}{overallRemaining.toLocaleString('en-IN')} remaining</span>
        </AnimatedCard>
      </div>

      {/* Overall Combined Goal Progress Card */}
      <AnimatedCard delay={0.25} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-sm">Overall Combined Progress</h3>
          </div>
          <span className="text-xs font-extrabold text-gray-900 dark:text-[#F8FAFC]">
            {currency}{totalSaved.toLocaleString('en-IN')} / {currency}{totalTarget.toLocaleString('en-IN')} ({overallPercentage}% saved)
          </span>
        </div>

        <AnimatedProgressBar
          percentage={overallPercentage}
          colorClass="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"
          className="h-3.5 rounded-full"
        />

        <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
          <span>{goals.filter(g => g.percentage >= 100).length} of {goals.length} goals completed</span>
          <span>{currency}{overallRemaining.toLocaleString('en-IN')} remaining across all goals</span>
        </div>
      </AnimatedCard>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {goals.map((g) => {
            const isCompleted = g.percentage >= 100;
            const remainingAmt = Math.max(0, g.target_amount - g.current_amount);
            const aboveAmt = Math.max(0, g.current_amount - g.target_amount);

            // Time & Monthly Pace calculations
            const todayDate = new Date('2026-09-17');
            const targetD = new Date(g.target_date);
            const monthsLeft = Math.max(1, Math.ceil((targetD.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));
            const reqMonthly = isCompleted ? 0 : Math.round(remainingAmt / monthsLeft);

            // Goal Status
            let status = { label: '✓ On Track', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/50' };
            if (isCompleted) {
              status = { label: '✓ Goal Completed', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200/50' };
            } else if (g.monthly_contribution && g.monthly_contribution < reqMonthly) {
              status = { label: '⚠️ Needs Attention', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/50' };
            } else if (g.percentage < 30 && monthsLeft <= 2) {
              status = { label: '⏳ Behind Schedule', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/50' };
            }

            return (
              <motion.div
                key={g.id}
                variants={VARIANTS.listRow}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ y: -3 }}
                transition={{ duration: DURATION.FAST, ease: EASING.OUT }}
                className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#0F1117] border border-gray-100 dark:border-[#292D38] flex items-center justify-center text-2xl shadow-inner"
                    >
                      {g.icon}
                    </motion.div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(g.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">{g.title}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Target by {g.target_date}
                    </p>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-600 dark:text-[#10B981]">
                      {currency}{g.current_amount.toLocaleString('en-IN')} saved
                    </span>
                    <span className="text-gray-400">
                      {currency}{g.target_amount.toLocaleString('en-IN')} target
                    </span>
                  </div>

                  <AnimatedProgressBar
                    percentage={g.percentage}
                    colorClass={isCompleted ? 'bg-indigo-600' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}
                    className="h-3 rounded-full"
                  />

                  <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500 dark:text-[#94A3B8]">
                    <span>{g.percentage}% saved</span>
                    <span>
                      {isCompleted ? (
                        <span className="text-indigo-500 font-bold">✓ Goal Met ({currency}{aboveAmt.toLocaleString('en-IN')} above)</span>
                      ) : (
                        <span>{currency}{remainingAmt.toLocaleString('en-IN')} remaining</span>
                      )}
                    </span>
                  </div>

                  {/* Required Monthly Saver */}
                  {!isCompleted && reqMonthly > 0 && (
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0F1117] text-[11px] flex items-center justify-between text-gray-500 dark:text-[#94A3B8]">
                      <span>Required Monthly Saving:</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{currency}{reqMonthly.toLocaleString('en-IN')} / mo</span>
                    </div>
                  )}

                  {/* Add Savings CTA */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAddSavingsModal(g);
                        setSavingsAmountToAdd('');
                        setSavingsNote('');
                      }}
                      className="w-full py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Savings</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

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
                <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Delete Goal?</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#94A3B8] leading-relaxed">
                Are you sure you want to remove this financial milestone? Progress data will be removed.
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
                  Delete Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Savings Modal */}
      <AnimatePresence>
        {showAddSavingsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: DURATION.NORMAL, ease: EASING.OUT }}
              className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#292D38] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{showAddSavingsModal.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Add Savings</h3>
                    <p className="text-[11px] text-gray-400">{showAddSavingsModal.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddSavingsModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F1117] flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-500 dark:text-[#94A3B8]">Current Saved:</span>
                <span className="text-emerald-600 dark:text-[#10B981] font-bold">
                  {currency}{showAddSavingsModal.current_amount.toLocaleString('en-IN')} / {currency}{showAddSavingsModal.target_amount.toLocaleString('en-IN')}
                </span>
              </div>

              <form onSubmit={handleAddSavingsSubmit} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Amount to Add ({currency}) *</label>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 5000"
                    value={savingsAmountToAdd}
                    onChange={(e) => setSavingsAmountToAdd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Note / Memo (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bonus allocation"
                    value={savingsNote}
                    onChange={(e) => setSavingsNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSavingsModal(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
                  >
                    Add Savings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
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
                  {editingGoal ? 'Edit Financial Goal' : 'Create Financial Goal'}
                </h3>
                <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveGoal} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Goal Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Home Down Payment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Amount ({currency}) *</label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Current Saved ({currency})</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Date *</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Monthly Contribution</label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={monthlyContrib}
                      onChange={(e) => setMonthlyContrib(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC]"
                    />
                  </div>
                </div>

                {/* Icon Selection Grid */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Icon & Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORY_ICONS.map((catItem) => (
                      <button
                        key={catItem.label}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(catItem.icon);
                          setCategory(catItem.label);
                        }}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          selectedIcon === catItem.icon
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-bold ring-1 ring-indigo-500'
                            : 'border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117]'
                        }`}
                      >
                        <span className="text-xl block">{catItem.icon}</span>
                        <span className="text-[10px] text-gray-500 truncate block mt-0.5">{catItem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
                  >
                    Save Goal
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

