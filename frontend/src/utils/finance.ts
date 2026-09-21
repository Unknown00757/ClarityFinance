import { Transaction, Budget, GoalItem, SubscriptionItem } from '../types';

/**
 * Calculates total income from a transaction list
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Calculates total expenses from a transaction list
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Calculates net cash flow / savings surplus
 */
export function calculateNetSavings(income: number, expenses: number): number {
  return income - expenses;
}

/**
 * Calculates savings rate percentage (0 - 100%)
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const net = income - expenses;
  if (net <= 0) return 0;
  return Number(((net / income) * 100).toFixed(1));
}

/**
 * Calculates average daily spending for a period
 */
export function calculateAverageDailySpending(totalExpenses: number, daysInPeriod: number = 30): number {
  if (daysInPeriod <= 0) return 0;
  return Math.round(totalExpenses / daysInPeriod);
}

/**
 * Calculates percentage share of total
 */
export function calculatePercentageShare(part: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

/**
 * Calculates total monthly subscription costs
 */
export function calculateActiveSubscriptionTotal(subscriptions: SubscriptionItem[]): number {
  return subscriptions
    .filter(s => s.status !== 'paused' && s.status !== 'cancelled')
    .reduce((sum, s) => sum + Number(s.cost || 0), 0);
}

/**
 * Calculates budget usage status and percentage
 */
export function calculateBudgetUsage(spent: number, limit: number): { percentage: number; status: 'healthy' | 'warning' | 'near_limit' | 'exceeded' } {
  if (limit <= 0) return { percentage: 0, status: 'healthy' };
  const percentage = Math.min(100, Math.round((spent / limit) * 100));
  let status: 'healthy' | 'warning' | 'near_limit' | 'exceeded' = 'healthy';

  if (spent > limit) {
    status = 'exceeded';
  } else if (percentage >= 85) {
    status = 'near_limit';
  } else if (percentage >= 75) {
    status = 'warning';
  }

  return { percentage, status };
}

/**
 * Calculates goal accumulation progress
 */
export function calculateGoalProgress(current: number, target: number): { percentage: number; remaining: number } {
  if (target <= 0) return { percentage: 0, remaining: 0 };
  const percentage = Math.min(100, Number(((current / target) * 100).toFixed(1)));
  const remaining = Math.max(0, target - current);
  return { percentage, remaining };
}
