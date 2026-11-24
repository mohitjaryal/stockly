
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import (
    InvestmentGoal,
    InvestmentGoalContribution,
    User,
)
from app.schemas.investment_goal import (
    InvestmentGoalCreate,
    InvestmentGoalUpdate,
)
from app.core.security import get_current_user
from app.api.portfolio import build_holdings_response


router = APIRouter(
    prefix="/investment-goals",
    tags=["Investment Goals"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_portfolio_value(db: Session, user_id: int, currency: str):
    holdings = build_holdings_response(db, user_id)
    total = Decimal("0")

    for holding in holdings:
        is_inr = holding.symbol.upper().endswith((".NS", ".BO"))
        holding_currency = "INR" if is_inr else "USD"

        if holding_currency == currency and holding.current_value is not None:
            total += Decimal(str(holding.current_value))

    return total


def get_manual_contributions(
    db: Session,
    goal_id: int,
    user_id: int,
):
    total = (
        db.query(func.coalesce(func.sum(InvestmentGoalContribution.amount), 0))
        .filter(
            InvestmentGoalContribution.goal_id == goal_id,
            InvestmentGoalContribution.user_id == user_id,
        )
        .scalar()
    )

    return Decimal(str(total))


def goal_response(db: Session, goal: InvestmentGoal, user_id: int):
    target = Decimal(str(goal.target_amount))

    # Tracking 1: Current portfolio market value
    portfolio_value = get_portfolio_value(
        db,
        user_id,
        goal.currency,
    )

    # Tracking 2: Manually recorded goal contributions
    manual_contributions = get_manual_contributions(
        db,
        goal.id,
        user_id,
    )

    portfolio_percentage = min(
        float((portfolio_value / target) * 100),
        100.0,
    )

    contribution_percentage = min(
        float((manual_contributions / target) * 100),
        100.0,
    )

    # Achievement is based on manual contributions only.
    is_completed = manual_contributions >= target

    # Record the first date the goal reaches its target.
    if is_completed and goal.achieved_at is None:
        goal.achieved_at = datetime.now(timezone.utc)
        db.flush()

    return {
        "id": goal.id,
        "goal_name": goal.goal_name,
        "description": goal.description,
        "target_amount": target,
        "currency": goal.currency,
        "deadline": goal.deadline,
        "created_at": goal.created_at,

        "portfolio_value": portfolio_value,
        "portfolio_progress_percentage": round(
            portfolio_percentage, 2
        ),

        "manual_contributions": manual_contributions,
        "contribution_progress_percentage": round(
            contribution_percentage, 2
        ),

        "achieved_at": goal.achieved_at,
        "is_completed": is_completed,

        # Backward-compatible fields
        "current_amount": manual_contributions,
        "progress_percentage": round(
            contribution_percentage, 2
        ),
        "remaining_amount": max(
            target - manual_contributions,
            Decimal("0"),
        ),
    }


@router.post("/", status_code=201)
def create_goal(
    data: InvestmentGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = InvestmentGoal(
        user_id=current_user.id,
        **data.model_dump(),
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    response = goal_response(db, goal, current_user.id)
    db.commit()

    return response


@router.get("/")
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goals = (
        db.query(InvestmentGoal)
        .filter(InvestmentGoal.user_id == current_user.id)
        .order_by(InvestmentGoal.created_at.desc())
        .all()
    )

    responses = [
        goal_response(db, goal, current_user.id)
        for goal in goals
    ]

    db.commit()
    return responses


@router.put("/{goal_id}")
def update_goal(
    goal_id: int,
    data: InvestmentGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = (
        db.query(InvestmentGoal)
        .filter(
            InvestmentGoal.id == goal_id,
            InvestmentGoal.user_id == current_user.id,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found",
        )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)

    response = goal_response(db, goal, current_user.id)
    db.commit()

    return response


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = (
        db.query(InvestmentGoal)
        .filter(
            InvestmentGoal.id == goal_id,
            InvestmentGoal.user_id == current_user.id,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found",
        )

    db.delete(goal)
    db.commit()

    return {"message": "Investment goal deleted successfully"}
