from typing import List, Optional
from pydantic import BaseModel

class SummaryCards(BaseModel):
    total_balance: float
    balance_change_pct: float
    total_income: float
    income_change_pct: float
    total_expenses: float
    expense_change_pct: float
    savings: float
    savings_pct: float
    yearly_income: Optional[float] = None
    yearly_expenses: Optional[float] = None

class TrajectoryPoint(BaseModel):
    label: str
    balance: float

class CashFlowForecast(BaseModel):
    projected_balance: float
    target_date: str
    trajectory: List[TrajectoryPoint]

class MoneyFlow(BaseModel):
    income: float
    expenses: float
    expense_pct: float
    savings: float
    savings_pct: float

class MoneySnapshot(BaseModel):
    available_balance: float
    monthly_income: float
    monthly_spending: float
    savings_goal_pct: float
    days_remaining: int
    spending_streak_days: int

class GoalItem(BaseModel):
    id: int
    title: str
    icon: str
    target_amount: float
    current_amount: float
    target_date: str
    percentage: float

class SubscriptionItem(BaseModel):
    id: int
    name: str
    icon: str
    cost: float
    billing_cycle: str  # Monthly | Yearly
    renewal_date: str

class UpcomingPaymentItem(BaseModel):
    id: int
    title: str
    icon: str
    amount: float
    due_date: str
    category: str

class TrendPoint(BaseModel):
    label: str
    income: float
    expenses: float
    savings: float

class CategoryBreakdown(BaseModel):
    category_id: int
    category_name: str
    icon: str
    amount: float
    percentage: float

class FinancialMetrics(BaseModel):
    avg_daily_spending: float
    avg_monthly_spending: float
    highest_spending_day: str
    highest_spending_category: str
    savings_rate: float
    total_transactions: int

class SmartInsight(BaseModel):
    id: str
    type: str  # info | warning | success | tip
    title: str
    message: str

class AnalyticsSummaryResponse(BaseModel):
    month: str
    health_score: int
    health_status: str
    cash_flow_forecast: CashFlowForecast
    money_flow: MoneyFlow
    money_snapshot: MoneySnapshot
    summary: SummaryCards
    trends: List[TrendPoint]
    category_breakdown: List[CategoryBreakdown]
    metrics: FinancialMetrics
    insights: List[SmartInsight]
    goals: List[GoalItem]
    subscriptions: List[SubscriptionItem]
    upcoming_payments: List[UpcomingPaymentItem]
