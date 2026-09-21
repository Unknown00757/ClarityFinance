from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=dict)
def get_transactions(
    search: Optional[str] = None,
    type: Optional[str] = None,  # income | expense
    category_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: Optional[str] = "newest",  # newest | oldest | highest | lowest
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).options(joinedload(Transaction.category)).filter(Transaction.user_id == current_user.id)

    if type and type in ["income", "expense"]:
        query = query.filter(Transaction.type == type)

    if category_id:
        query = query.filter(Transaction.category_id == category_id)

    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Transaction.description.ilike(search_fmt)) |
            (Transaction.notes.ilike(search_fmt))
        )

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(Transaction.date.asc(), Transaction.id.asc())
    elif sort_by == "highest":
        query = query.order_by(Transaction.amount.desc())
    elif sort_by == "lowest":
        query = query.order_by(Transaction.amount.asc())
    else:  # newest default
        query = query.order_by(Transaction.date.desc(), Transaction.id.desc())

    total_count = query.count()
    offset = (page - 1) * limit
    transactions = query.offset(offset).limit(limit).all()

    return {
        "items": [TransactionOut.model_validate(t) for t in transactions],
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit if total_count > 0 else 1
    }

@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify category exists and belongs to user or system
    category = db.query(Category).filter(
        Category.id == tx_in.category_id,
        (Category.user_id == current_user.id) | (Category.user_id.is_(None))
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category selected.")

    tx = Transaction(
        user_id=current_user.id,
        category_id=tx_in.category_id,
        amount=round(tx_in.amount, 2),
        type=tx_in.type,
        description=tx_in.description.strip(),
        date=tx_in.date,
        payment_method=tx_in.payment_method or "UPI",
        notes=tx_in.notes or ""
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    
    # Reload with category relationship
    return db.query(Transaction).options(joinedload(Transaction.category)).filter(Transaction.id == tx.id).first()

@router.get("/{tx_id}", response_model=TransactionOut)
def get_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).options(joinedload(Transaction.category)).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return tx

@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: int,
    tx_update: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    if tx_update.category_id is not None:
        category = db.query(Category).filter(
            Category.id == tx_update.category_id,
            (Category.user_id == current_user.id) | (Category.user_id.is_(None))
        ).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category selected.")
        tx.category_id = tx_update.category_id

    if tx_update.amount is not None:
        tx.amount = round(tx_update.amount, 2)
    if tx_update.type is not None:
        tx.type = tx_update.type
    if tx_update.description is not None:
        tx.description = tx_update.description.strip()
    if tx_update.date is not None:
        tx.date = tx_update.date
    if tx_update.payment_method is not None:
        tx.payment_method = tx_update.payment_method
    if tx_update.notes is not None:
        tx.notes = tx_update.notes

    db.commit()
    db.refresh(tx)
    return db.query(Transaction).options(joinedload(Transaction.category)).filter(Transaction.id == tx.id).first()

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully."}
