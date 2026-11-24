from sqlalchemy import (
    Column, Integer, String, Numeric, Date, DateTime,
    ForeignKey, CheckConstraint, func
)
from app.db.base import Base


class InvestmentGoal(Base):
    __tablename__ = "investment_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    goal_name = Column(String(120), nullable=False)
    description = Column(String(500), nullable=True)
    target_amount = Column(Numeric(20, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    deadline = Column(Date, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    achieved_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint(
            "target_amount > 0",
            name="ck_investment_goal_target_positive",
        ),
        CheckConstraint(
            "currency IN ('INR', 'USD')",
            name="ck_investment_goal_currency",
        ),
    )
