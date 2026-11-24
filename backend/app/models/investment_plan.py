
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.sql import func

from app.db.base import Base


class InvestmentPlan(Base):
    __tablename__ = "investment_plans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    investment_name = Column(String(150), nullable=False)

    asset_type = Column(String(30), nullable=False)

    planned_amount = Column(Numeric(20, 2), nullable=False)

    actual_amount = Column(
        Numeric(20, 2),
        nullable=False,
        default=0,
    )

    currency = Column(String(3), nullable=False, default="INR")

    planned_date = Column(Date, nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="PLANNED",
    )

    notes = Column(String(300), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
    )

    __table_args__ = (
        CheckConstraint(
            "planned_amount > 0",
            name="ck_investment_plan_planned_amount_positive",
        ),
        CheckConstraint(
            "actual_amount >= 0",
            name="ck_investment_plan_actual_amount_nonnegative",
        ),
        CheckConstraint(
            "currency IN ('INR', 'USD')",
            name="ck_investment_plan_currency",
        ),
        CheckConstraint(
            "asset_type IN ('STOCK', 'MUTUAL_FUND', 'ETF', 'OTHER')",
            name="ck_investment_plan_asset_type",
        ),
        CheckConstraint(
            "status IN ('PLANNED', 'COMPLETED', 'CANCELLED')",
            name="ck_investment_plan_status",
        ),
    )
