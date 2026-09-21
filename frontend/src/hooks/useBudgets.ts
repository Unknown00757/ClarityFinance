import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Budget } from '../types';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBudgets();
      setBudgets(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const deleteBudget = async (id: number) => {
    await api.deleteBudget(id);
    await fetchBudgets();
  };

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
    deleteBudget
  };
}
