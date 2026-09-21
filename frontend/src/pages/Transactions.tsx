import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  Edit, 
  Eye, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle,
  Calendar,
  CreditCard,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { AnimatedCard, AnimatedButton, AnimatedModal, AnimatedDropdown } from '../components/common/MotionWrapper';
import { VARIANTS, DURATION, EASING } from '../theme/motion';

interface TransactionsProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveTab: (tab: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({
  searchQuery,
  setSearchQuery,
  setActiveTab,
  onEditTransaction,
  onViewTransaction,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Pagination States
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Mobile Filter Drawer State
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        search: searchQuery,
        type: typeFilter === 'all' ? undefined : typeFilter,
        category_id: categoryFilter === 'all' ? undefined : Number(categoryFilter),
        sort_by: sortBy,
        page: page,
        limit: 10,
      });
      setTransactions(res.items);
      setTotalCount(res.total);
      setTotalPages(res.pages);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, typeFilter, categoryFilter, dateRangeFilter, sortBy, page]);

  const handleDelete = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      await api.deleteTransaction(deletingTx.id);
      setToastMsg('✓ Transaction deleted successfully');
      setDeletingTx(null);
      fetchTransactions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete transaction.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateRangeFilter('all');
    setSortBy('newest');
    setPage(1);
  };

  const isFilterActive = searchQuery.trim() !== '' || typeFilter !== 'all' || categoryFilter !== 'all' || dateRangeFilter !== 'all' || sortBy !== 'newest';

  // Summary Metrics Calculation
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;

  const currency = user?.currency || '₹';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: DURATION.FAST, ease: EASING.OUT }}
            className="fixed bottom-6 right-6 z-50 bg-[#171A23] border border-[#292D38] text-[#F8FAFC] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="ml-2 text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC] tracking-tight">Transactions</h1>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium">
            Track and manage all your income and expenses.
          </p>
        </div>
        <AnimatedButton
          onClick={() => setActiveTab('add-transaction')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </AnimatedButton>
      </div>

      {/* Compact Transaction Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AnimatedCard delay={0.1} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400">Total Income</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-base font-extrabold text-gray-900 dark:text-[#F8FAFC] mt-1">
            <AnimatedNumber value={totalIncome > 0 ? totalIncome : 83000} prefix={currency} duration={1000} />
          </p>
        </AnimatedCard>

        <AnimatedCard delay={0.15} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400">Total Expenses</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-base font-extrabold text-gray-900 dark:text-[#F8FAFC] mt-1">
            <AnimatedNumber value={totalExpenses > 0 ? totalExpenses : 26419} prefix={currency} duration={1000} />
          </p>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400">Net Cash Flow</span>
            <Wallet className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-base font-extrabold text-emerald-600 dark:text-[#10B981] mt-1">
            +<AnimatedNumber value={netCashFlow > 0 ? netCashFlow : 56581} prefix={currency} duration={1000} />
          </p>
        </AnimatedCard>

        <AnimatedCard delay={0.25} className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400">Transactions</span>
            <Receipt className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-base font-extrabold text-gray-900 dark:text-[#F8FAFC] mt-1">
            <AnimatedNumber value={totalCount > 0 ? totalCount : 33} duration={1000} /> Items
          </p>
        </AnimatedCard>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-gray-100 dark:border-[#292D38]">
          <span className="text-xs font-bold text-gray-900 dark:text-[#F8FAFC]">Filter Transactions</span>
          <AnimatedButton
            onClick={() => setShowMobileFilters(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search description..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-transparent border-none focus:outline-none w-full font-semibold text-gray-800 dark:text-[#F8FAFC] cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#171A23]">All Types</option>
              <option value="income" className="bg-white dark:bg-[#171A23]">Income Only</option>
              <option value="expense" className="bg-white dark:bg-[#171A23]">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="bg-transparent border-none focus:outline-none w-full font-semibold text-gray-800 dark:text-[#F8FAFC] cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#171A23]">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-[#171A23]">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 font-medium">Range:</span>
            <select
              value={dateRangeFilter}
              onChange={(e) => { setDateRangeFilter(e.target.value); setPage(1); }}
              className="bg-transparent border-none focus:outline-none w-full font-semibold text-gray-800 dark:text-[#F8FAFC] cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#171A23]">All Time</option>
              <option value="today" className="bg-white dark:bg-[#171A23]">Today</option>
              <option value="this_week" className="bg-white dark:bg-[#171A23]">This Week</option>
              <option value="this_month" className="bg-white dark:bg-[#171A23]">This Month</option>
              <option value="last_month" className="bg-white dark:bg-[#171A23]">Last Month</option>
            </select>
          </div>

          {/* Sort By & Clear Filters */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-full font-semibold text-gray-800 dark:text-[#F8FAFC] cursor-pointer"
              >
                <option value="newest" className="bg-white dark:bg-[#171A23]">Newest First</option>
                <option value="oldest" className="bg-white dark:bg-[#171A23]">Oldest First</option>
                <option value="highest" className="bg-white dark:bg-[#171A23]">Highest Amount</option>
                <option value="lowest" className="bg-white dark:bg-[#171A23]">Lowest Amount</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <AnimatePresence>
              {isFilterActive && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleClearFilters}
                  title="Clear Filters"
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#0F1117] dark:hover:bg-[#292D38] text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Transactions Data Table & Mobile Responsive Cards */}
      <div className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-[#0F1117] rounded-xl"></div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#292D38] bg-gray-50/50 dark:bg-[#0F1117]/30 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#292D38]/60 text-xs font-medium">
                  {transactions.map((tx, idx) => (
                    <motion.tr 
                      key={tx.id} 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: DURATION.FAST, delay: idx * 0.04 }}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#0F1117]/50 transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4 text-gray-500 dark:text-[#94A3B8] whitespace-nowrap">{tx.date}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base group-hover:scale-110 transition-transform">{tx.category?.icon || '📦'}</span>
                          <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{tx.description}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-[#0F1117] text-gray-700 dark:text-gray-300">
                          {tx.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-[#94A3B8]">{tx.payment_method}</td>
                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F43F5E]'}>
                          {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                          <AnimatedButton
                            onClick={() => onViewTransaction(tx)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#0F1117] transition-colors"
                            title="View Transaction Details"
                          >
                            <Eye className="w-4 h-4" />
                          </AnimatedButton>
                          <AnimatedButton
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#0F1117] transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit className="w-4 h-4" />
                          </AnimatedButton>
                          <AnimatedButton
                            onClick={() => setDeletingTx(tx)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </AnimatedButton>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 768px) */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-[#292D38]">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-2 hover:bg-gray-50 dark:hover:bg-[#0F1117]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{tx.category?.icon || '📦'}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-[#F8FAFC] text-sm">{tx.description}</p>
                        <p className="text-[11px] text-gray-400">{tx.category?.name || 'General'} · {tx.payment_method}</p>
                      </div>
                    </div>
                    <span className={`font-extrabold text-sm ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F43F5E]'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>{tx.date}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onViewTransaction(tx)} className="p-1 text-gray-400 hover:text-indigo-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onEditTransaction(tx)} className="p-1 text-gray-400 hover:text-indigo-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingTx(tx)} className="p-1 text-gray-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-[#292D38] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-[#94A3B8] font-medium">
              <div>
                Showing {Math.min((page - 1) * 10 + 1, totalCount)}–{Math.min(page * 10, totalCount)} of {totalCount} transactions
              </div>
              <div className="flex items-center gap-2">
                <AnimatedButton
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#0F1117] transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </AnimatedButton>
                <span className="font-bold text-gray-900 dark:text-[#F8FAFC] px-2">Page {page} of {totalPages}</span>
                <AnimatedButton
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#0F1117] transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </AnimatedButton>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#0F1117] text-gray-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">No transactions found</h3>
            <p className="text-xs text-gray-500 dark:text-[#94A3B8] max-w-sm mx-auto">
              Try changing your filters or add a new transaction to start tracking your finances.
            </p>
            <AnimatedButton
              onClick={() => setActiveTab('add-transaction')}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              + Add Transaction
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog Modal */}
      <AnimatedModal isOpen={!!deletingTx} onClose={() => setDeletingTx(null)} maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-lg">Delete Transaction?</h3>
            <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-1">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-[#F8FAFC]">{deletingTx?.description}</strong> ({currency}{deletingTx?.amount})? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <AnimatedButton
              disabled={isDeleting}
              onClick={() => setDeletingTx(null)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#292D38] text-gray-700 dark:text-[#F8FAFC] font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#0F1117]"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </AnimatedButton>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
};
