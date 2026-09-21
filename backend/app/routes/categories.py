from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def get_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    categories = db.query(Category).filter(
        (Category.user_id == current_user.id) | (Category.user_id.is_(None))
    ).all()

    result = []
    for cat in categories:
        tx_query = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.category_id == cat.id
        )
        tx_count = tx_query.count()
        total_sum = sum(t.amount for t in tx_query.all()) if tx_count > 0 else 0.0

        cat_out = CategoryOut(
            id=cat.id,
            user_id=cat.user_id,
            name=cat.name,
            icon=cat.icon,
            type=cat.type,
            transaction_count=tx_count,
            total_spent=round(total_sum, 2)
        )
        result.append(cat_out)
    return result

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(cat_in: CategoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Category).filter(
        Category.name.ilike(cat_in.name.strip()),
        (Category.user_id == current_user.id) | (Category.user_id.is_(None))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{cat_in.name}' already exists.")

    cat = Category(
        user_id=current_user.id,
        name=cat_in.name.strip(),
        icon=cat_in.icon or "📦",
        type=cat_in.type or "expense"
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryOut(
        id=cat.id,
        user_id=cat.user_id,
        name=cat.name,
        icon=cat.icon,
        type=cat.type,
        transaction_count=0,
        total_spent=0.0
    )

@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, cat_update: CategoryUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found or default system categories cannot be modified.")

    if cat_update.name is not None:
        cat.name = cat_update.name.strip()
    if cat_update.icon is not None:
        cat.icon = cat_update.icon
    if cat_update.type is not None:
        cat.type = cat_update.type

    db.commit()
    db.refresh(cat)
    return CategoryOut(
        id=cat.id,
        user_id=cat.user_id,
        name=cat.name,
        icon=cat.icon,
        type=cat.type,
        transaction_count=0,
        total_spent=0.0
    )

@router.delete("/{category_id}")
def delete_category(category_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found or default categories cannot be deleted.")

    # Check dependency
    tx_count = db.query(Transaction).filter(Transaction.category_id == category_id, Transaction.user_id == current_user.id).count()
    if tx_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete category '{cat.name}' because {tx_count} transaction(s) depend on it.")

    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully."}
