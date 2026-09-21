from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(10), nullable=False)  # 'income' or 'expense'
    description = Column(String(255), nullable=False)
    date = Column(String(10), nullable=False)   # YYYY-MM-DD
    payment_method = Column(String(50), default="UPI")  # Cash, Credit Card, Debit Card, UPI, Bank Transfer, Other
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
