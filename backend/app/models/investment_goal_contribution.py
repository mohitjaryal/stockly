
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func,
)

from app.db.base import Base


class InvestmentGoalContribution(Base):
    __tablename__ = "investment_goal_contributions"

    id = Column(Integer, primary_key=True, index=True)

    goal_id = Column(
        Integer,
        ForeignKey("investment_goals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    amount = Column(Numeric(20, 2), nullable=False)

    note = Column(String(300), nullable=True)

    contributed_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "amount > 0",
            name="ck_goal_contribution_amount_positive",
        ),
    )
