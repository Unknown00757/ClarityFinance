from typing import Optional
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    icon: str = "📦"
    type: str = "expense"

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    type: Optional[str] = None

class CategoryOut(CategoryBase):
    id: int
    user_id: Optional[int] = None
    transaction_count: Optional[int] = 0
    total_spent: Optional[float] = 0.0

    class Config:
        from_attributes = True
