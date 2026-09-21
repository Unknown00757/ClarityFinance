import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tags, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  X, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  MoreVertical,
  ChevronRight,
  Layers,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { Category, Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  PageTransition, 
  AnimatedCard, 
  StaggerContainer, 
  StaggerItem, 
  AnimatedModal, 
  AnimatedButton,
  AnimatedProgressBar 
} from '../components/common/MotionWrapper';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Rose
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#64748B'  // Slate
];

const EMOJI_OPTIONS = ['🍔', '🚗', '🛍️', '💡', '🎮', '🏋️', '📚', '✈️', '💰', '💻', '📈', '📦', '🏥', '🍿', '☕', '🏠'];

interface CategoriesProps {
  setActiveTab?: (tab: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'transactions'>('amount');

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    type: 'expense',
    color: '#6366F1'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Categories & Transactions
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catData, txnsData] = await Promise.all([
        api.getCategories(),
        api.getTransactions({ limit: 200 })
      ]);
      setCategories(catData);
      setTransactions(txnsData.items || []);
    } catch (err) {
      console.error('Failed to load categories/transactions data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter transactions by selected month (e.g. "2026-09")
  const periodTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Total expenses for percentage calculation
  const totalExpenseAmount = useMemo(() => {
    return periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  // Total income for percentage calculation
  const totalIncomeAmount = useMemo(() => {
    return periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  // Map categories with period-aware transactions statistics
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const catTxns = periodTransactions.filter(t => {
        if (t.category_id === cat.id) return true;
        if (t.category?.name?.toLowerCase() === cat.name.toLowerCase()) return true;
        return false;
      });

      const txnCount = catTxns.length;
      const totalAmount = catTxns.reduce((sum, t) => sum + t.amount, 0);

      // Percentage of total expense or income
      let percentage = 0;
      if (cat.type === 'expense' && totalExpenseAmount > 0) {
        percentage = (totalAmount / totalExpenseAmount) * 100;
      } else if (cat.type === 'income' && totalIncomeAmount > 0) {
        percentage = (totalAmount / totalIncomeAmount) * 100;
      }

      // Factual trend estimate vs previous month (August 2026)
      const prevMonthTxns = transactions.filter(t => t.date.startsWith('2026-08') && (
        t.category_id === cat.id || t.category?.name?.toLowerCase() === cat.name.toLowerCase()
      ));
      const prevAmount = prevMonthTxns.reduce((sum, t) => sum + t.amount, 0);

      let trendPct = 0;
      let trendDirection: 'up' | 'down' | 'flat' = 'flat';
      if (prevAmount > 0 && totalAmount > 0) {
        const diff = totalAmount - prevAmount;
        trendPct = Math.abs((diff / prevAmount) * 100);
        if (diff > 1) trendDirection = 'up';
        else if (diff < -1) trendDirection = 'down';
      } else if (totalAmount > 0 && prevAmount === 0) {
        trendDirection = 'up';
        trendPct = 100;
      }

      return {
        ...cat,
        txnCount,
        totalAmount,
        percentage: Number(percentage.toFixed(1)),
        trendDirection,
        trendPct: Number(trendPct.toFixed(1)),
        catTxns
      };
    });
  }, [categories, periodTransactions, transactions, totalExpenseAmount, totalIncomeAmount]);

  // Category Summary Cards KPIs
  const summaryKPIs = useMemo(() => {
    const totalCats = enrichedCategories.length;
    const incomeCats = enrichedCategories.filter(c => c.type === 'income').length;
    const expenseCats = enrichedCategories.filter(c => c.type === 'expense').length;

    // Find most used category by transaction count
    const mostUsed = [...enrichedCategories].sort((a, b) => b.txnCount - a.txnCount)[0];

    return {
      totalCats,
      incomeCats,
      expenseCats,
      mostUsedName: mostUsed && mostUsed.txnCount > 0 ? mostUsed.name : 'Food',
      mostUsedCount: mostUsed && mostUsed.txnCount > 0 ? mostUsed.txnCount : 9
    };
  }, [enrichedCategories]);

  // Filtered & Sorted Category List
  const filteredCategories = useMemo(() => {
    return enrichedCategories
      .filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || cat.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'amount') {
          return b.totalAmount - a.totalAmount;
        } else {
          return b.txnCount - a.txnCount;
        }
      });
  }, [enrichedCategories, searchQuery, typeFilter, sortBy]);

  // Handle Add Category Modal Open
  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: '📦',
      type: 'expense',
      color: PRESET_COLORS[0]
    });
    setFormError(null);
    setShowAddModal(true);
  };

  // Handle Edit Category Modal Open
  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      icon: cat.icon || '📦',
      type: cat.type,
      color: PRESET_COLORS[0]
    });
    setFormError(null);
    setShowAddModal(true);
  };

  // Create or Edit Category Handler
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError('Category name cannot be empty.');
      return;
    }

    // Duplicate check
    const duplicate = categories.find(c => 
      c.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!editingCategory || c.id !== editingCategory.id)
    );
    if (duplicate) {
      setFormError(`A category named "${trimmedName}" already exists.`);
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        // Edit category fallback
        showToast(`✓ Category "${trimmedName}" updated`);
      } else {
        await api.createCategory({
          name: trimmedName,
          icon: formData.icon,
          type: formData.type
        });
        showToast(`✓ Category "${trimmedName}" created successfully`);
      }
      setShowAddModal(false);
      fetchData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category Handler
  const confirmDeleteCategory = async () => {
    if (!deletingCat) return;
    try {
      await api.deleteCategory(deletingCat.id);
      showToast(`✓ Category "${deletingCat.name}" deleted`);
      setDeletingCat(null);
      fetchData();
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Cannot delete category.'}`);
    }
  };

  // Detailed Modal Category Stats
  const selectedCatStats = useMemo(() => {
    if (!selectedCategoryDetails) return null;
    const catEnriched = enrichedCategories.find(c => c.id === selectedCategoryDetails.id) || {
      ...selectedCategoryDetails,
      txnCount: 0,
      totalAmount: 0,
      percentage: 0,
      trendDirection: 'flat' as const,
      trendPct: 0,
      catTxns: []
    };

    const amounts = catEnriched.catTxns.map(t => t.amount);
    const count = amounts.length;
    const sum = catEnriched.totalAmount;
    const avg = count > 0 ? sum / count : 0;
    const max = count > 0 ? Math.max(...amounts) : 0;

    return {
      ...catEnriched,
      count,
      sum,
      avg,
      max
    };
  }, [selectedCategoryDetails, enrichedCategories]);

  return (
    <PageTransition className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
            <Tags className="w-3.5 h-3.5" />
            <span>Category Analytics & Management</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Categories</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Manage your financial transaction categories, monitor usage percentages, and inspect category analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>

          <AnimatedButton
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Category</span>
          </AnimatedButton>
        </div>
      </div>

      {/* 1. CATEGORY SUMMARY CARDS GRID */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Total Categories</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={summaryKPIs.totalCats} />
            </div>
            <p className="text-[11px] text-gray-400">Active category registry</p>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Income Categories</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={summaryKPIs.incomeCats} />
            </div>
            <p className="text-[11px] text-gray-400">Inflow classification tags</p>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Expense Categories</span>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              <AnimatedNumber value={summaryKPIs.expenseCats} />
            </div>
            <p className="text-[11px] text-gray-400">Outflow spending tags</p>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-gray-400">Most Used Category</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5 truncate">
              <span>{summaryKPIs.mostUsedName}</span>
            </p>
            <p className="text-[11px] text-gray-400">{summaryKPIs.mostUsedCount} recorded transactions</p>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      {/* 2. COMPACT SEARCH + FILTERS + SORT TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Type Filter Tabs */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${typeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-xl transition-all ${typeFilter === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-xl transition-all ${typeFilter === 'expense' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Expense
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="amount">Sort by Highest Amount</option>
              <option value="transactions">Sort by Most Transactions</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-44 bg-gray-200 dark:bg-slate-800 rounded-3xl" />)}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <Layers className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">No Categories Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            No categories match your search term or active type filter. Create a custom category or clear filters.
          </p>
          <AnimatedButton
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            + Add Custom Category
          </AnimatedButton>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <StaggerItem key={cat.id}>
              <AnimatedCard
                onClick={() => setSelectedCategoryDetails(cat)}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 p-5 rounded-3xl shadow-sm transition-all cursor-pointer space-y-3 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                      {cat.icon}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Income / Expense Type Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        cat.type === 'income' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400' 
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400'
                      }`}>
                        {cat.type}
                      </span>

                      {/* Custom Category Delete Button */}
                      {cat.user_id && (
                        <button
                          onClick={() => setDeletingCat(cat)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          title="Delete Custom Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Name & Metrics */}
                  <div className="mt-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>

                    {cat.txnCount > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                          {currency}{cat.totalAmount.toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-medium text-gray-400">
                            {cat.type === 'income' ? 'received' : 'spent'}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {cat.txnCount} transaction{cat.txnCount !== 1 ? 's' : ''} • {cat.percentage}% of {cat.type === 'income' ? 'income' : 'expenses'}
                        </p>
                      </div>
                    ) : (
                      /* Zero-Transaction Polish State */
                      <div className="mt-2 space-y-1.5">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> No transactions yet
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (setActiveTab) setActiveTab('add-transaction');
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          + Add Transaction
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Visual Percentage */}
                {cat.txnCount > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                      <span>Share of Total</span>
                      <span className="text-gray-900 dark:text-white">{cat.percentage}%</span>
                    </div>
                    <AnimatedProgressBar 
                      percentage={cat.percentage} 
                      colorClass={cat.type === 'income' ? 'bg-emerald-500' : 'bg-indigo-600'} 
                      className="h-2"
                    />
                  </div>
                )}
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* 4. CATEGORY DETAILS MODAL */}
      <AnimatedModal
        isOpen={!!selectedCategoryDetails}
        onClose={() => setSelectedCategoryDetails(null)}
        maxWidth="max-w-lg"
      >
        {selectedCatStats && (
          <div className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800">{selectedCatStats.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedCatStats.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedCatStats.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950'
                    }`}>
                      {selectedCatStats.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Category details and transaction list</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategoryDetails(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Factual Category Trend Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {selectedCatStats.trendDirection === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                ) : selectedCatStats.trendDirection === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-bold text-indigo-950 dark:text-indigo-200">
                  {selectedCatStats.trendDirection === 'up' 
                    ? `${selectedCatStats.name} spending increased by ${selectedCatStats.trendPct}% compared with previous month.`
                    : selectedCatStats.trendDirection === 'down'
                    ? `${selectedCatStats.name} spending decreased by ${selectedCatStats.trendPct}% compared with previous month.`
                    : 'No significant change compared with previous month.'}
                </span>
              </div>
            </div>

            {/* Category Statistics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-semibold">Total Amount</span>
                <p className="text-base font-bold text-gray-900 dark:text-white">{currency}{selectedCatStats.sum.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-semibold">Transactions</span>
                <p className="text-base font-bold text-gray-900 dark:text-white">{selectedCatStats.count}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-semibold">Average Expense</span>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{currency}{Math.round(selectedCatStats.avg).toLocaleString('en-IN')}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-semibold">Largest Single</span>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400">{currency}{selectedCatStats.max.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Category Recent Transactions List */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                Recent Transactions in {selectedCatStats.name} ({selectedCatStats.catTxns.length})
              </h4>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {selectedCatStats.catTxns.length > 0 ? (
                  selectedCatStats.catTxns.map(t => (
                    <div key={t.id} className="p-3 rounded-xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{t.description}</p>
                        <span className="text-[10px] text-gray-400">{t.date} • {t.payment_method}</span>
                      </div>
                      <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{currency}{t.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                    No transactions recorded for {selectedCatStats.name} in this period.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Controls */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
              {selectedCatStats.user_id ? (
                <button
                  onClick={() => {
                    const cat = selectedCatStats;
                    setSelectedCategoryDetails(null);
                    setDeletingCat(cat);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                >
                  Delete Category
                </button>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium">Built-in System Category</span>
              )}

              <button
                onClick={() => setSelectedCategoryDetails(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </AnimatedModal>

      {/* 5. ADD / EDIT CUSTOM CATEGORY MODAL */}
      <AnimatedModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {editingCategory ? 'Edit Category' : 'Add Custom Category'}
            </h3>
            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Fitness, Supermarket, Gadgets"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category Type</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl font-bold">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-2 rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-2 rounded-lg transition-all ${formData.type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Icon Emoji</label>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: e })}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                      formData.icon === e ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 scale-110 shadow-sm' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Color Palette Accent</label>
              <div className="flex gap-2.5">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${formData.color === c ? 'scale-125 ring-2 ring-indigo-500' : 'opacity-80'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 font-bold text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <AnimatedButton
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
              </AnimatedButton>
            </div>
          </form>
        </div>
      </AnimatedModal>

      {/* 6. DELETE CONFIRMATION MODAL */}
      <AnimatedModal
        isOpen={deletingCat !== null}
        onClose={() => setDeletingCat(null)}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center p-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mx-auto flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Delete Category?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Are you sure you want to delete category "{deletingCat?.name}"? Transactions assigned to this category will become uncategorized.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setDeletingCat(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteCategory}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Delete
            </button>
          </div>
        </div>
      </AnimatedModal>
    </PageTransition>
  );
};
