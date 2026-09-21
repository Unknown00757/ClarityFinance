from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.category import CategoryOut

class BudgetBase(BaseModel):
    category_id: int
    amount: float = Field(..., gt=0)
    start_date: str
    end_date: str

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = Field(None, gt=0)
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class BudgetOut(BudgetBase):
    id: int
    user_id: int
    category: Optional[CategoryOut] = None
    spent: float = 0.0
    remaining: float = 0.0
    percentage: float = 0.0
    status: str = "healthy"  # healthy | warning | near_limit | exceeded

    class Config:
        from_attributes = True
