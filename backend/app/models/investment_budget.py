
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base


class InvestmentBudget(Base):
    __tablename__ = "investment_budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    budget_name = Column(String(100), nullable=False, default="Monthly Investment Budget")
    amount = Column(Numeric(20, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="INR")

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    notes = Column(String(300), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_investment_budget_amount_positive"),
        CheckConstraint("currency IN ('INR', 'USD')", name="ck_investment_budget_currency"),
        CheckConstraint("month >= 1 AND month <= 12", name="ck_investment_budget_month"),
        CheckConstraint("year >= 2000", name="ck_investment_budget_year"),
        UniqueConstraint("user_id", "month", "year", "currency", name="uq_user_monthly_budget"),
    )
