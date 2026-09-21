from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.category import CategoryOut

class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    type: str  # 'income' or 'expense'
    category_id: int
    description: str
    date: str  # YYYY-MM-DD
    payment_method: Optional[str] = "UPI"
    notes: Optional[str] = ""

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    date: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class TransactionOut(TransactionBase):
    id: int
    user_id: int
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True
