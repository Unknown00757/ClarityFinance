from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

def compute_budget_metrics(budget: Budget, db: Session, user_id: int) -> BudgetOut:
    # Sum expenses for this budget's category in the date range
    spent_sum = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.category_id == budget.category_id,
        Transaction.type == "expense",
        Transaction.date >= budget.start_date,
        Transaction.date <= budget.end_date
    ).all()
    
    total_spent = sum(t.amount for t in spent_sum)
    remaining = max(0.0, budget.amount - total_spent)
    percentage = round((total_spent / budget.amount) * 100, 1) if budget.amount > 0 else 0.0

    if percentage >= 100.0:
        status_str = "exceeded"
    elif percentage >= 85.0:
        status_str = "near_limit"
    elif percentage >= 70.0:
        status_str = "warning"
    else:
        status_str = "healthy"

    return BudgetOut(
        id=budget.id,
        user_id=budget.user_id,
        category_id=budget.category_id,
        category=budget.category,
        amount=budget.amount,
        start_date=budget.start_date,
        end_date=budget.end_date,
        spent=round(total_spent, 2),
        remaining=round(remaining, 2),
        percentage=percentage,
        status=status_str
    )

@router.get("", response_model=List[BudgetOut])
def get_budgets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budgets = db.query(Budget).options(joinedload(Budget.category)).filter(Budget.user_id == current_user.id).all()
    return [compute_budget_metrics(b, db, current_user.id) for b in budgets]

@router.post("", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(budget_in: BudgetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check category
    cat = db.query(Category).filter(
        Category.id == budget_in.category_id,
        (Category.user_id == current_user.id) | (Category.user_id.is_(None))
    ).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid category selected.")

    # Check existing active budget for same category
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category_id == budget_in.category_id,
        Budget.start_date == budget_in.start_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"A budget for '{cat.name}' already exists for this period.")

    b = Budget(
        user_id=current_user.id,
        category_id=budget_in.category_id,
        amount=round(budget_in.amount, 2),
        start_date=budget_in.start_date,
        end_date=budget_in.end_date
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    b_loaded = db.query(Budget).options(joinedload(Budget.category)).filter(Budget.id == b.id).first()
    return compute_budget_metrics(b_loaded, db, current_user.id)

@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(budget_id: int, budget_update: BudgetUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found.")

    if budget_update.amount is not None:
        b.amount = round(budget_update.amount, 2)
    if budget_update.start_date is not None:
        b.start_date = budget_update.start_date
    if budget_update.end_date is not None:
        b.end_date = budget_update.end_date

    db.commit()
    db.refresh(b)
    b_loaded = db.query(Budget).options(joinedload(Budget.category)).filter(Budget.id == b.id).first()
    return compute_budget_metrics(b_loaded, db, current_user.id)

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found.")
    db.delete(b)
    db.commit()
    return {"message": "Budget deleted successfully."}
