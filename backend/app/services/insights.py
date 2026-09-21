from typing import List
from app.schemas.analytics import SmartInsight

def generate_smart_insights(
    current_month_name: str,
    total_income: float,
    total_expenses: float,
    savings: float,
    savings_pct: float,
    category_breakdown: list,
    prev_category_breakdown: list = None
) -> List[SmartInsight]:
    insights: List[SmartInsight] = []
    
    # 1. Savings Rate Insight
    if savings_pct >= 20.0:
        insights.append(SmartInsight(
            id="savings_high",
            type="success",
            title="Healthy Savings Rate",
            message=f"Great job! You're currently saving {savings_pct:.1f}% of your monthly income."
        ))
    elif savings_pct > 0:
        insights.append(SmartInsight(
            id="savings_low",
            type="info",
            title="Savings Goal Progress",
            message=f"You are saving {savings_pct:.1f}% of your income. Aim for 20%+ to build a strong buffer."
        ))
    else:
        insights.append(SmartInsight(
            id="savings_deficit",
            type="warning",
            title="Spending Deficit Warning",
            message="Your expenses exceeded your income for this period. Consider reviewing high-spending categories."
        ))

    # 2. Top Spending Category Insight
    if category_breakdown:
        top_cat = max(category_breakdown, key=lambda c: c.amount)
        if top_cat.amount > 0:
            insights.append(SmartInsight(
                id="top_category",
                type="info",
                title="Highest Spending Category",
                message=f"You spent the most on {top_cat.category_name} ({top_cat.icon}) this month: ₹{top_cat.amount:,.2f} ({top_cat.percentage:.1f}% of expenses)."
            ))
            
            # Compare top category to previous month if available
            if prev_category_breakdown:
                prev_match = next((c for c in prev_category_breakdown if c.category_name == top_cat.category_name), None)
                if prev_match and prev_match.amount > 0:
                    pct_diff = ((top_cat.amount - prev_match.amount) / prev_match.amount) * 100
                    if pct_diff > 0:
                        insights.append(SmartInsight(
                            id="cat_increase",
                            type="warning",
                            title="Category Spend Increase",
                            message=f"Your {top_cat.category_name} spending increased by {pct_diff:.1f}% compared to last month."
                        ))

    # 3. Income to Expense Ratio Tip
    if total_income > 0:
        expense_ratio = (total_expenses / total_income) * 100
        if expense_ratio <= 70:
            insights.append(SmartInsight(
                id="budget_control",
                type="tip",
                title="Optimal Spending Ratio",
                message=f"Your overall spending is at {expense_ratio:.1f}% of income, leaving room for investments."
            ))

    return insights
