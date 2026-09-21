import React, { useState } from 'react';
import { X, Calendar, CreditCard, Tag, DollarSign, Edit, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { Transaction } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AnimatedModal, AnimatedButton } from '../common/MotionWrapper';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteTransaction(transaction.id);
      onDelete();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatedModal isOpen={true} onClose={onClose} maxWidth="max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#292D38] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-[#0F1117] flex items-center justify-center text-xl shadow-inner">
            {transaction.category?.icon || '📦'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">{transaction.description}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              transaction.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-[#10B981]' : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-[#F43F5E]'
            }`}>
              {transaction.type}
            </span>
          </div>
        </div>
        <AnimatedButton onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </AnimatedButton>
      </div>

      {/* Body Details */}
      <div className="py-4 space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F1117]/60 border border-gray-100 dark:border-[#292D38] text-center">
          <span className="text-[11px] font-bold text-gray-400 block">Amount</span>
          <p className={`text-3xl font-black mt-1 ${
            transaction.type === 'income' ? 'text-emerald-600 dark:text-[#10B981]' : 'text-rose-600 dark:text-[#F43F5E]'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{currency}{transaction.amount.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="space-y-2.5 font-medium">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-[#0F1117]/40">
            <span className="text-gray-500 dark:text-[#94A3B8] flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" /> Category
            </span>
            <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{transaction.category?.name || 'General'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-[#0F1117]/40">
            <span className="text-gray-500 dark:text-[#94A3B8] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Date
            </span>
            <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{transaction.date}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-[#0F1117]/40">
            <span className="text-gray-500 dark:text-[#94A3B8] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" /> Payment Method
            </span>
            <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{transaction.payment_method}</span>
          </div>

          {transaction.notes && (
            <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-[#0F1117]/40 space-y-1">
              <span className="text-gray-500 dark:text-[#94A3B8] flex items-center gap-2 font-bold">
                <FileText className="w-4 h-4 text-indigo-500" /> Notes
              </span>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-6">{transaction.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation for Deletion */}
      {confirmDelete ? (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Are you sure you want to delete this transaction?
          </p>
          <div className="flex justify-end gap-2">
            <AnimatedButton
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] text-xs font-bold"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </AnimatedButton>
          </div>
        </div>
      ) : (
        /* Action Buttons */
        <div className="pt-2 border-t border-gray-100 dark:border-[#292D38] flex items-center justify-end gap-2">
          <AnimatedButton
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </AnimatedButton>
          <AnimatedButton
            onClick={() => onEdit(transaction)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Transaction</span>
          </AnimatedButton>
        </div>
      )}
    </AnimatedModal>
  );
};
