from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.category import Category
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/export")
def export_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()

    return {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "currency": current_user.currency,
            "date_format": current_user.date_format,
            "theme": current_user.theme
        },
        "categories": [
            {"id": c.id, "name": c.name, "icon": c.icon, "type": c.type} for c in categories
        ],
        "budgets": [
            {"category_id": b.category_id, "amount": b.amount, "start_date": b.start_date, "end_date": b.end_date} for b in budgets
        ],
        "transactions": [
            {
                "amount": t.amount,
                "type": t.type,
                "category_id": t.category_id,
                "description": t.description,
                "date": t.date,
                "payment_method": t.payment_method,
                "notes": t.notes
            } for t in txs
        ]
    }

@router.post("/clear-data")
def clear_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Delete transactions and budgets for user
    db.query(Transaction).filter(Transaction.user_id == current_user.id).delete(synchronize_session=False)
    db.query(Budget).filter(Budget.user_id == current_user.id).delete(synchronize_session=False)
    db.commit()
    return {"message": "All transaction and budget data cleared successfully."}
