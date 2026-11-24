
from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core.security import get_current_user
from app.models.investment_plan import InvestmentPlan


router = APIRouter(
    prefix="/investment-plans",
    tags=["Investment Plans"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class InvestmentPlanCreate(BaseModel):
    investment_name: str = Field(min_length=1, max_length=150)
    asset_type: str
    planned_amount: Decimal = Field(gt=0)
    actual_amount: Decimal = Field(default=Decimal("0"), ge=0)
    currency: str = "INR"
    planned_date: date
    status: str = "PLANNED"
    notes: Optional[str] = Field(default=None, max_length=300)


class InvestmentPlanUpdate(BaseModel):
    investment_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    asset_type: Optional[str] = None
    planned_amount: Optional[Decimal] = Field(default=None, gt=0)
    actual_amount: Optional[Decimal] = Field(default=None, ge=0)
    currency: Optional[str] = None
    planned_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=300)


def validate_plan_values(data: dict):
    if data.get("asset_type") not in (None, "STOCK", "MUTUAL_FUND", "ETF", "OTHER"):
        raise HTTPException(status_code=400, detail="Invalid asset type")

    if data.get("currency") not in (None, "INR", "USD"):
        raise HTTPException(status_code=400, detail="Invalid currency")

    if data.get("status") not in (None, "PLANNED", "COMPLETED", "CANCELLED"):
        raise HTTPException(status_code=400, detail="Invalid status")


def plan_response(plan: InvestmentPlan):
    planned = Decimal(str(plan.planned_amount))
    actual = Decimal(str(plan.actual_amount))
    remaining = max(planned - actual, Decimal("0"))

    progress = (
        float(min(actual / planned * 100, Decimal("100")))
        if planned > 0 else 0
    )

    return {
        "id": plan.id,
        "investment_name": plan.investment_name,
        "asset_type": plan.asset_type,
        "planned_amount": planned,
        "actual_amount": actual,
        "remaining_amount": remaining,
        "progress_percentage": round(progress, 2),
        "currency": plan.currency,
        "planned_date": plan.planned_date,
        "status": plan.status,
        "notes": plan.notes,
        "created_at": plan.created_at,
        "updated_at": plan.updated_at,
    }


@router.post("")
def create_investment_plan(
    payload: InvestmentPlanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    data = payload.model_dump()
    validate_plan_values(data)

    plan = InvestmentPlan(
        user_id=current_user.id,
        **data,
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return plan_response(plan)


@router.get("")
def get_investment_plans(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plans = (
        db.query(InvestmentPlan)
        .filter(InvestmentPlan.user_id == current_user.id)
        .order_by(InvestmentPlan.planned_date.asc())
        .all()
    )

    return [plan_response(plan) for plan in plans]


@router.put("/{plan_id}")
def update_investment_plan(
    plan_id: int,
    payload: InvestmentPlanUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plan = (
        db.query(InvestmentPlan)
        .filter(
            InvestmentPlan.id == plan_id,
            InvestmentPlan.user_id == current_user.id,
        )
        .first()
    )

    if not plan:
        raise HTTPException(status_code=404, detail="Investment plan not found")

    data = payload.model_dump(exclude_unset=True)
    validate_plan_values(data)

    for key, value in data.items():
        setattr(plan, key, value)

    db.commit()
    db.refresh(plan)

    return plan_response(plan)


@router.delete("/{plan_id}")
def delete_investment_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plan = (
        db.query(InvestmentPlan)
        .filter(
            InvestmentPlan.id == plan_id,
            InvestmentPlan.user_id == current_user.id,
        )
        .first()
    )

    if not plan:
        raise HTTPException(status_code=404, detail="Investment plan not found")

    db.delete(plan)
    db.commit()

    return {"message": "Investment plan deleted successfully"}
