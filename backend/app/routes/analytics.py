from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummaryResponse, 
    SummaryCards, 
    TrendPoint, 
    CategoryBreakdown, 
    FinancialMetrics,
    CashFlowForecast,
    TrajectoryPoint,
    MoneyFlow,
    MoneySnapshot,
    GoalItem,
    SubscriptionItem,
    UpcomingPaymentItem
)
from app.services.insights import generate_smart_insights
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    month: Optional[str] = Query(None, description="YYYY-MM format e.g. 2026-09"),
    range_type: Optional[str] = Query("monthly", description="7D | 30D | 3M | 6M | 1Y | monthly | yearly"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now()
    if not month:
        latest_tx = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.date.desc()).first()
        if latest_tx and latest_tx.date:
            target_month_str = latest_tx.date[:7]
            parts = target_month_str.split("-")
            target_year = int(parts[0])
            target_month = int(parts[1])
        else:
            target_year = now.year
            target_month = now.month
            target_month_str = f"{target_year:04d}-{target_month:02d}"
    else:
        parts = month.split("-")
        target_year = int(parts[0])
        target_month = int(parts[1])
        target_month_str = f"{target_year:04d}-{target_month:02d}"
    
    # Calculate previous month string
    if target_month == 1:
        prev_month_str = f"{target_year - 1:04d}-12"
    else:
        prev_month_str = f"{target_year:04d}-{target_month - 1:02d}"

    target_year_str = f"{target_year:04d}"

    # Query all transactions for target year (for yearly metrics)
    year_txs = db.query(Transaction).options(joinedload(Transaction.category)).filter(
        Transaction.user_id == current_user.id,
        Transaction.date.startswith(target_year_str)
    ).all()
    
    yearly_income = sum(t.amount for t in year_txs if t.type == "income")
    yearly_expenses = sum(t.amount for t in year_txs if t.type == "expense")

    # Filter transactions based on range_type
    if range_type in ["yearly", "1Y"]:
        curr_txs = year_txs
        prev_year_str = f"{target_year - 1:04d}"
        prev_txs = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.date.startswith(prev_year_str)
        ).all()
        days_in_period = 365
    else:  # "monthly" or default
        curr_txs = [t for t in year_txs if t.date.startswith(target_month_str)]
        prev_txs = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.date.startswith(prev_month_str)
        ).all()
        days_in_period = 30

    # Totals current period
    curr_income = sum(t.amount for t in curr_txs if t.type == "income")
    curr_expense = sum(t.amount for t in curr_txs if t.type == "expense")
    curr_savings = curr_income - curr_expense
    curr_balance = curr_savings
    savings_pct = round((curr_savings / curr_income * 100), 1) if curr_income > 0 else 0.0
    expense_pct = round((curr_expense / curr_income * 100), 1) if curr_income > 0 else 0.0

    # Totals previous period
    prev_income = sum(t.amount for t in prev_txs if t.type == "income")
    prev_expense = sum(t.amount for t in prev_txs if t.type == "expense")
    prev_savings = prev_income - prev_expense

    # Period changes
    income_change_pct = ((curr_income - prev_income) / prev_income * 100) if prev_income > 0 else 0.0
    expense_change_pct = ((curr_expense - prev_expense) / prev_expense * 100) if prev_expense > 0 else 0.0
    balance_change_pct = ((curr_savings - prev_savings) / abs(prev_savings) * 100) if prev_savings != 0 else 0.0

    summary_cards = SummaryCards(
        total_balance=round(curr_balance, 2),
        balance_change_pct=round(balance_change_pct, 1),
        total_income=round(curr_income, 2),
        income_change_pct=round(income_change_pct, 1),
        total_expenses=round(curr_expense, 2),
        expense_change_pct=round(expense_change_pct, 1),
        savings=round(curr_savings, 2),
        savings_pct=savings_pct,
        yearly_income=round(yearly_income, 2),
        yearly_expenses=round(yearly_expenses, 2)
    )

    # 1. Financial Health Score (0-100)
    health_score_calc = 50.0
    if savings_pct >= 30:
        health_score_calc += 35
    elif savings_pct >= 15:
        health_score_calc += 20
    elif savings_pct > 0:
        health_score_calc += 10
    
    if curr_expense < curr_income * 0.7:
        health_score_calc += 15
        
    health_score = min(100, max(20, int(health_score_calc)))
    
    if health_score >= 80:
        health_status = "Very Healthy"
    elif health_score >= 65:
        health_status = "Healthy"
    elif health_score >= 50:
        health_status = "Moderate"
    else:
        health_status = "Needs Attention"

    # 2. Cash Flow Forecast
    days_in_month = 30
    current_day = min(30, max(1, now.day if target_month == now.month else 15))
    days_remaining = days_in_month - current_day
    
    daily_run_rate = (curr_expense / current_day) if current_day > 0 else 0.0
    projected_end_expense = curr_expense + (daily_run_rate * days_remaining)
    projected_balance = round(max(0.0, curr_income - projected_end_expense), 2)

    trajectory = [
        TrajectoryPoint(label="Today", balance=round(curr_balance, 2)),
        TrajectoryPoint(label="W3", balance=round(curr_balance + (projected_balance - curr_balance) * 0.5, 2)),
        TrajectoryPoint(label="Month End", balance=projected_balance)
    ]

    cash_flow_forecast = CashFlowForecast(
        projected_balance=projected_balance,
        target_date="September 30",
        trajectory=trajectory
    )

    # 3. Money Flow
    money_flow = MoneyFlow(
        income=round(curr_income, 2),
        expenses=round(curr_expense, 2),
        expense_pct=expense_pct,
        savings=round(curr_savings, 2),
        savings_pct=savings_pct
    )

    # 4. Money Snapshot
    money_snapshot = MoneySnapshot(
        available_balance=round(curr_balance, 2),
        monthly_income=round(curr_income, 2),
        monthly_spending=round(curr_expense, 2),
        savings_goal_pct=savings_pct,
        days_remaining=days_remaining,
        spending_streak_days=8
    )

    # Category Breakdown
    cat_totals = {}
    for t in curr_txs:
        if t.type == "expense":
            cat_name = t.category.name if t.category else "Uncategorized"
            cat_icon = t.category.icon if t.category else "📦"
            cat_id = t.category_id
            if cat_id not in cat_totals:
                cat_totals[cat_id] = {"name": cat_name, "icon": cat_icon, "amount": 0.0}
            cat_totals[cat_id]["amount"] += t.amount

    category_breakdown = []
    for cid, data in cat_totals.items():
        amt = round(data["amount"], 2)
        pct = round((amt / curr_expense * 100), 1) if curr_expense > 0 else 0.0
        category_breakdown.append(CategoryBreakdown(
            category_id=cid,
            category_name=data["name"],
            icon=data["icon"],
            amount=amt,
            percentage=pct
        ))
    category_breakdown.sort(key=lambda x: x.amount, reverse=True)

    prev_cat_totals = {}
    for t in prev_txs:
        if t.type == "expense":
            cat_name = t.category.name if t.category else "Uncategorized"
            if cat_name not in prev_cat_totals:
                prev_cat_totals[cat_name] = 0.0
            prev_cat_totals[cat_name] += t.amount

    prev_cat_breakdown = [
        CategoryBreakdown(category_id=0, category_name=name, icon="📦", amount=amt, percentage=0.0)
        for name, amt in prev_cat_totals.items()
    ]

    # Trends (Supports: 7D | 30D | 3M | 6M | 1Y | monthly | yearly)
    trends: List[TrendPoint] = []
    
    if range_type in ["7D", "30D"]:
        num_days = 7 if range_type == "7D" else 30
        for d in range(num_days - 1, -1, -1):
            dt = now - timedelta(days=d)
            d_str = dt.strftime("%Y-%m-%d")
            lbl_str = dt.strftime("%b %d")
            d_txs = db.query(Transaction).filter(
                Transaction.user_id == current_user.id,
                Transaction.date == d_str
            ).all()
            inc = sum(t.amount for t in d_txs if t.type == "income")
            exp = sum(t.amount for t in d_txs if t.type == "expense")
            trends.append(TrendPoint(label=lbl_str, income=round(inc, 2), expenses=round(exp, 2), savings=round(inc - exp, 2)))

    elif range_type in ["yearly", "1Y"]:
        for m in range(1, 13):
            m_str = f"{target_year:04d}-{m:02d}"
            dt = datetime(target_year, m, 1)
            label_str = dt.strftime("%b %Y")
            m_txs = db.query(Transaction).filter(
                Transaction.user_id == current_user.id,
                Transaction.date.startswith(m_str)
            ).all()
            inc = sum(t.amount for t in m_txs if t.type == "income")
            exp = sum(t.amount for t in m_txs if t.type == "expense")
            trends.append(TrendPoint(label=label_str, income=round(inc, 2), expenses=round(exp, 2), savings=round(inc - exp, 2)))

    elif range_type in ["3M", "6M"]:
        num_months = 3 if range_type == "3M" else 6
        for i in range(num_months - 1, -1, -1):
            tot_m = target_year * 12 + (target_month - 1) - i
            y = tot_m // 12
            m = (tot_m % 12) + 1
            m_str = f"{y:04d}-{m:02d}"
            dt = datetime(y, m, 1)
            label_str = dt.strftime("%b %Y")
            m_txs = db.query(Transaction).filter(
                Transaction.user_id == current_user.id,
                Transaction.date.startswith(m_str)
            ).all()
            inc = sum(t.amount for t in m_txs if t.type == "income")
            exp = sum(t.amount for t in m_txs if t.type == "expense")
            trends.append(TrendPoint(label=label_str, income=round(inc, 2), expenses=round(exp, 2), savings=round(inc - exp, 2)))
    
    else:  # Default monthly (by weeks)
        for week_idx in range(1, 5):
            start_d = (week_idx - 1) * 7 + 1
            end_d = min(week_idx * 7, 31)
            label_str = f"Week {week_idx} ({start_d}-{end_d})"
            w_txs = [
                t for t in curr_txs 
                if start_d <= int(t.date.split("-")[2]) <= end_d
            ]
            inc = sum(t.amount for t in w_txs if t.type == "income")
            exp = sum(t.amount for t in w_txs if t.type == "expense")
            trends.append(TrendPoint(label=label_str, income=round(inc, 2), expenses=round(exp, 2), savings=round(inc - exp, 2)))

    # Metrics
    avg_daily_spending = curr_expense / days_in_month if days_in_month > 0 else 0.0
    highest_cat_name = category_breakdown[0].category_name if category_breakdown else "N/A"
    
    day_totals = {}
    for t in curr_txs:
        if t.type == "expense":
            day_totals[t.date] = day_totals.get(t.date, 0.0) + t.amount
    highest_day = max(day_totals, key=day_totals.get) if day_totals else "N/A"

    metrics = FinancialMetrics(
        avg_daily_spending=round(avg_daily_spending, 2),
        avg_monthly_spending=round(curr_expense, 2),
        highest_spending_day=highest_day,
        highest_spending_category=highest_cat_name,
        savings_rate=savings_pct,
        total_transactions=len(curr_txs)
    )

    # Smart Insights
    insights = generate_smart_insights(
        current_month_name=target_month_str,
        total_income=curr_income,
        total_expenses=curr_expense,
        savings=curr_savings,
        savings_pct=savings_pct,
        category_breakdown=category_breakdown,
        prev_category_breakdown=prev_cat_breakdown
    )

    # 5. Goals Sample Data
    goals = [
        GoalItem(id=1, title="Emergency Buffer Fund", icon="🛡️", target_amount=100000.0, current_amount=75000.0, target_date="2026-12-31", percentage=75.0),
        GoalItem(id=2, title="New M3 MacBook Pro", icon="💻", target_amount=150000.0, current_amount=112500.0, target_date="2026-11-15", percentage=75.0),
        GoalItem(id=3, title="Japan Monsoon Vacation", icon="✈️", target_amount=200000.0, current_amount=90000.0, target_date="2027-04-10", percentage=45.0),
    ]

    # 6. Active Subscriptions
    subscriptions = [
        SubscriptionItem(id=1, name="Netflix 4K Ultra HD", icon="🍿", cost=649.0, billing_cycle="Monthly", renewal_date="2026-09-22"),
        SubscriptionItem(id=2, name="Spotify Family Premium", icon="🎵", cost=179.0, billing_cycle="Monthly", renewal_date="2026-09-25"),
        SubscriptionItem(id=3, name="iCloud+ 2TB Storage", icon="☁️", cost=749.0, billing_cycle="Monthly", renewal_date="2026-09-28"),
        SubscriptionItem(id=4, name="GitHub Copilot Pro", icon="🤖", cost=820.0, billing_cycle="Monthly", renewal_date="2026-10-01"),
    ]

    # 7. Scheduled Upcoming Payments
    upcoming_payments = [
        UpcomingPaymentItem(id=1, title="Apartment Maintenance Fee", icon="🏢", amount=3500.0, due_date="2026-09-20", category="Bills"),
        UpcomingPaymentItem(id=2, title="Fiber Broadband Renewal", icon="💡", amount=1499.0, due_date="2026-09-24", category="Bills"),
        UpcomingPaymentItem(id=3, title="Health Insurance Premium", icon="❤️", amount=4200.0, due_date="2026-09-29", category="Health"),
    ]

    return AnalyticsSummaryResponse(
        month=target_month_str,
        health_score=health_score,
        health_status=health_status,
        cash_flow_forecast=cash_flow_forecast,
        money_flow=money_flow,
        money_snapshot=money_snapshot,
        summary=summary_cards,
        trends=trends,
        category_breakdown=category_breakdown,
        metrics=metrics,
        insights=insights,
        goals=goals,
        subscriptions=subscriptions,
        upcoming_payments=upcoming_payments
    )
