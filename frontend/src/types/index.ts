export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  date_format: string;
  theme: 'light' | 'dark' | 'system';
}

export interface Category {
  id: number;
  user_id?: number;
  name: string;
  icon: string;
  type: 'expense' | 'income';
  transaction_count?: number;
  total_spent?: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  payment_method: string;
  notes?: string;
  category?: Category;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  start_date: string;
  end_date: string;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'near_limit' | 'exceeded';
  category?: Category;
}

export interface SummaryCards {
  total_balance: number;
  balance_change_pct: number;
  total_income: number;
  income_change_pct: number;
  total_expenses: number;
  expense_change_pct: number;
  savings: number;
  savings_pct: number;
  yearly_income?: number;
  yearly_expenses?: number;
}

export interface TrajectoryPoint {
  label: string;
  balance: number;
}

export interface CashFlowForecast {
  projected_balance: number;
  target_date: string;
  trajectory: TrajectoryPoint[];
}

export interface MoneyFlow {
  income: number;
  expenses: number;
  expense_pct: number;
  savings: number;
  savings_pct: number;
}

export interface MoneySnapshot {
  available_balance: number;
  monthly_income: number;
  monthly_spending: number;
  savings_goal_pct: number;
  days_remaining: number;
  spending_streak_days: number;
}

export interface GoalItem {
  id: number;
  title: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  percentage: number;
  category?: string;
  monthly_contribution?: number;
  notes?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface SubscriptionItem {
  id: number;
  name: string;
  icon: string;
  cost: number;
  billing_cycle: string;
  renewal_date: string;
  category?: string;
  payment_method?: string;
  status?: 'active' | 'paused' | 'cancelled';
  notes?: string;
}

export interface UpcomingPaymentItem {
  id: number;
  title: string;
  icon: string;
  amount: number;
  due_date: string;
  category: string;
}

export interface TrendPoint {
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface FinancialMetrics {
  avg_daily_spending: number;
  avg_monthly_spending: number;
  highest_spending_day: string;
  highest_spending_category: string;
  savings_rate: number;
  total_transactions: number;
}

export interface SmartInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'tip';
  title: string;
  message: string;
}

export interface AnalyticsSummary {
  month: string;
  health_score: number;
  health_status: string;
  cash_flow_forecast: CashFlowForecast;
  money_flow: MoneyFlow;
  money_snapshot: MoneySnapshot;
  summary: SummaryCards;
  trends: TrendPoint[];
  category_breakdown: CategoryBreakdown[];
  metrics: FinancialMetrics;
  insights: SmartInsight[];
  goals: GoalItem[];
  subscriptions: SubscriptionItem[];
  upcoming_payments: UpcomingPaymentItem[];
}

export interface ExportData {
  user: {
    name: string;
    email: string;
    currency: string;
    date_format: string;
    theme: string;
  };
  categories: Array<{
    id: number;
    name: string;
    icon: string;
    type: string;
  }>;
  budgets: Array<{
    category_id: number;
    amount: number;
    start_date: string;
    end_date: string;
  }>;
  transactions: Array<{
    id?: number;
    amount: number;
    type: string;
    category_id: number;
    description: string;
    date: string;
    payment_method: string;
    notes?: string;
  }>;
}

