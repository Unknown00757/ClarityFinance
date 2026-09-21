import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Transaction } from '../types';

export function useTransactions(params?: { limit?: number; month?: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTransactions({ limit: params?.limit || 100 });
      let items = res.items || [];
      if (params?.month) {
        items = items.filter(t => t.date.startsWith(params.month!));
      }
      setTransactions(items);
      setTotal(res.total || items.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [params?.limit, params?.month]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'user_id' | 'category'>) => {
    const newTx = await api.createTransaction(data);
    await fetchTransactions();
    return newTx;
  };

  const deleteTransaction = async (id: number) => {
    await api.deleteTransaction(id);
    await fetchTransactions();
  };

  return {
    transactions,
    total,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    deleteTransaction
  };
}
