
from datetime import datetime
from decimal import Decimal
from typing import Literal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core.security import get_current_user
from app.models.investment_budget import InvestmentBudget
from app.models.portfolio_transaction import PortfolioTransaction
from app.models.stock import Stock


router = APIRouter(
    prefix="/investment-budgets",
    tags=["Investment Budgets"],
)

IST = ZoneInfo("Asia/Kolkata")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class BudgetCreate(BaseModel):
    budget_name: str = Field(
        default="Monthly Investment Budget",
        min_length=1,
        max_length=100,
    )
    amount: Decimal = Field(gt=0)
    currency: Literal["INR", "USD"] = "INR"
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000)
    notes: str | None = Field(default=None, max_length=300)


class BudgetUpdate(BaseModel):
    budget_name: str | None = Field(default=None, min_length=1, max_length=100)
    amount: Decimal | None = Field(default=None, gt=0)
    currency: Literal["INR", "USD"] | None = None
    month: int | None = Field(default=None, ge=1, le=12)
    year: int | None = Field(default=None, ge=2000)
    notes: str | None = Field(default=None, max_length=300)


def get_monthly_spent(
    db: Session,
    user_id: int,
    month: int,
    year: int,
    currency: str,
) -> Decimal:
    start = datetime(year, month, 1, tzinfo=IST)

    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=IST)
    else:
        end = datetime(year, month + 1, 1, tzinfo=IST)

    query = (
        db.query(
            func.coalesce(
                func.sum(
                    PortfolioTransaction.quantity
                    * PortfolioTransaction.price
                ),
                0,
            )
        )
        .join(Stock, PortfolioTransaction.stock_id == Stock.id)
        .filter(
            PortfolioTransaction.user_id == user_id,
            PortfolioTransaction.transaction_type == "BUY",
            PortfolioTransaction.transaction_date >= start,
            PortfolioTransaction.transaction_date < end,
        )
    )

    is_inr_stock = or_(
        Stock.symbol.ilike("%.NS"),
        Stock.symbol.ilike("%.BO"),
    )

    if currency == "INR":
        query = query.filter(is_inr_stock)
    else:
        query = query.filter(~is_inr_stock)

    return Decimal(str(query.scalar()))


def budget_response(db: Session, budget: InvestmentBudget):
    spent = get_monthly_spent(
        db,
        budget.user_id,
        budget.month,
        budget.year,
        budget.currency,
    )

    amount = Decimal(str(budget.amount))
    remaining = max(Decimal("0"), amount - spent)
    utilization = (spent / amount) * 100 if amount else Decimal("0")

    return {
        "id": budget.id,
        "budget_name": budget.budget_name,
        "amount": float(amount),
        "currency": budget.currency,
        "month": budget.month,
        "year": budget.year,
        "notes": budget.notes,
        "actual_invested": float(spent),
        "remaining_budget": float(remaining),
        "utilization_percentage": round(float(utilization), 2),
        "overspent": spent > amount,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
    }


@router.post("")
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    budget = InvestmentBudget(
        user_id=current_user.id,
        **data.model_dump(),
    )

    db.add(budget)

    try:
        db.commit()
        db.refresh(budget)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A budget already exists for this month and currency.",
        )

    return budget_response(db, budget)


@router.get("")
def get_budgets(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000),
    currency: Literal["INR", "USD"] | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(InvestmentBudget).filter(
        InvestmentBudget.user_id == current_user.id
    )

    if month is not None:
        query = query.filter(InvestmentBudget.month == month)

    if year is not None:
        query = query.filter(InvestmentBudget.year == year)

    if currency is not None:
        query = query.filter(InvestmentBudget.currency == currency)

    budgets = query.order_by(
        InvestmentBudget.year.desc(),
        InvestmentBudget.month.desc(),
    ).all()

    return [budget_response(db, budget) for budget in budgets]


@router.put("/{budget_id}")
def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    budget = db.query(InvestmentBudget).filter(
        InvestmentBudget.id == budget_id,
        InvestmentBudget.user_id == current_user.id,
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)

    try:
        db.commit()
        db.refresh(budget)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A budget already exists for this month and currency.",
        )

    return budget_response(db, budget)


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    budget = db.query(InvestmentBudget).filter(
        InvestmentBudget.id == budget_id,
        InvestmentBudget.user_id == current_user.id,
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()

    return {"message": "Investment budget deleted successfully"}
