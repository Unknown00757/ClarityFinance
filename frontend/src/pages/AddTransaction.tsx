import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Sparkles,
  CreditCard,
  Calendar,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { Category, Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { VARIANTS, DURATION, EASING } from '../theme/motion';

interface AddTransactionProps {
  setActiveTab: (tab: string) => void;
  editingTransaction?: Transaction | null;
  onSuccess?: () => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({
  setActiveTab,
  editingTransaction,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<'expense' | 'income'>(editingTransaction?.type || 'expense');
  const [amount, setAmount] = useState<string>(editingTransaction ? String(editingTransaction.amount) : '');
  const [categoryId, setCategoryId] = useState<number>(editingTransaction?.category_id || 0);
  const [description, setDescription] = useState<string>(editingTransaction?.description || '');
  const [date, setDate] = useState<string>(editingTransaction?.date || '2026-09-17');
  const [paymentMethod, setPaymentMethod] = useState<string>(editingTransaction?.payment_method || 'UPI');
  const [notes, setNotes] = useState<string>(editingTransaction?.notes || '');

  // Errors & Loading state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    api.getCategories().then((data) => {
      setCategories(data);
      if (!editingTransaction && data.length > 0) {
        const defaultCat = data.find((c) => c.type === type) || data[0];
        setCategoryId(defaultCat.id);
      }
    }).catch(console.error);
  }, [type]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Amount must be a number greater than 0.';
    }
    if (!categoryId || categoryId === 0) {
      errs.category = 'Please select a category.';
    }
    if (!description.trim()) {
      errs.description = 'Description is required.';
    }
    if (!date) {
      errs.date = 'Date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        type: type,
        category_id: categoryId,
        description: description.trim(),
        date: date,
        payment_method: paymentMethod,
        notes: notes.trim(),
      };

      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, payload);
      } else {
        await api.createTransaction(payload);
      }

      setSuccessToast(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setActiveTab('transactions');
      }, 1000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const currency = user?.currency || '₹';
  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Formatting date for preview
  const formattedPreviewDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Select Date';

  const numericAmount = parseFloat(amount) || 0;

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={VARIANTS.staggerContainer}
      className="max-w-5xl mx-auto space-y-6 pb-8"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: DURATION.FAST, ease: EASING.OUT }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{editingTransaction ? 'Transaction updated successfully.' : 'Transaction added successfully.'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        variants={VARIANTS.card}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            {editingTransaction ? 'Update your transaction details.' : 'Record your income or expense.'}
          </p>
        </div>
        <motion.button
          onClick={() => setActiveTab('transactions')}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </motion.button>
      </motion.div>

      {/* 2-Column Grid Layout: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Form Card */}
        <motion.form 
          variants={VARIANTS.card}
          onSubmit={handleSubmit} 
          className="lg:col-span-7 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6"
        >
          {/* Toggle Expense | Income with Framer Motion Gliding Pill */}
          <div className="relative p-1 bg-gray-100 dark:bg-slate-800/80 rounded-2xl flex items-center">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExpCat = categories.find(c => c.type === 'expense');
                if (firstExpCat) setCategoryId(firstExpCat.id);
              }}
              className={`relative z-10 flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors duration-200 flex items-center justify-center gap-2 ${
                type === 'expense' ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>💸</span>
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstIncCat = categories.find(c => c.type === 'income');
                if (firstIncCat) setCategoryId(firstIncCat.id);
              }}
              className={`relative z-10 flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors duration-200 flex items-center justify-center gap-2 ${
                type === 'income' ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>💰</span>
              <span>Income</span>
            </button>

            {/* Gliding Active Background Pill */}
            {type === 'expense' ? (
              <motion.div
                layoutId="active-type-pill"
                transition={EASING.SPRING_SNAPPY}
                className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-rose-500 rounded-xl shadow-md shadow-rose-500/20"
              />
            ) : (
              <motion.div
                layoutId="active-type-pill"
                transition={EASING.SPRING_SNAPPY}
                className="absolute inset-y-1 left-[calc(50%+2px)] w-[calc(50%-4px)] bg-emerald-600 rounded-xl shadow-md shadow-emerald-600/20"
              />
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Amount ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-base">{currency}</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl text-lg font-bold border ${
                  errors.amount ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40'
                } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
            </div>
            {errors.amount && <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.amount}</p>}
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm ring-1 ring-indigo-500/30'
                        : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{cat.icon}</span>
                    <span className="text-xs truncate font-medium" title={cat.name}>{cat.name}</span>
                  </motion.button>
                );
              })}
            </div>
            {errors.category && <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.category}</p>}
          </div>

          {/* Description & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Grocery store run, Salary bonus"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-2.5 text-xs rounded-xl border ${
                  errors.description ? 'border-rose-500 bg-rose-50/20' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40'
                } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.description && <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.description}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              {errors.date && <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.date}</p>}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Notes (Optional) with Character Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Notes (Optional)
              </label>
              <span className={`text-[10px] font-semibold ${notes.length >= 230 ? 'text-amber-500' : 'text-gray-400'}`}>
                {notes.length} / 250
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={250}
              placeholder="Add any extra notes or memo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Transaction...</span>
                </>
              ) : (
                <span>{editingTransaction ? 'Update Transaction' : 'Save Transaction'}</span>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Live Transaction Preview Card */}
        <motion.div 
          variants={VARIANTS.card}
          className="lg:col-span-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 sticky top-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Live Preview
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Real-time
            </span>
          </div>

          {/* Card Representation */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/80 dark:from-slate-800/60 dark:to-slate-800/30 border border-gray-200/80 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl shadow-sm">
                  {selectedCategory?.icon || '📦'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {description.trim() || 'Transaction Description'}
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {selectedCategory?.name || 'Uncategorized'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-base font-extrabold ${
                  type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                }`}>
                  {type === 'expense' ? '-' : '+'} {currency}{numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {type}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{formattedPreviewDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 justify-end">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{paymentMethod}</span>
              </div>
            </div>

            {notes.trim() && (
              <div className="pt-2 text-[11px] text-gray-500 dark:text-gray-400 italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                "{notes.trim()}"
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center font-medium leading-relaxed">
            This card shows how your transaction will appear in the Transactions ledger and mobile list view.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

