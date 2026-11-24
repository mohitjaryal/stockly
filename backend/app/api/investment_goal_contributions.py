
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import InvestmentGoal, InvestmentGoalContribution, User
from app.schemas.investment_goal_contribution import (
    InvestmentGoalContributionCreate,
    InvestmentGoalContributionResponse,
)
from app.core.security import get_current_user


router = APIRouter(
    prefix="/investment-goals",
    tags=["Investment Goal Contributions"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_owned_goal(db: Session, goal_id: int, user_id: int):
    goal = (
        db.query(InvestmentGoal)
        .filter(
            InvestmentGoal.id == goal_id,
            InvestmentGoal.user_id == user_id,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Investment goal not found",
        )

    return goal


def get_contribution_total(
    db: Session,
    goal_id: int,
    user_id: int,
):
    total = (
        db.query(
            func.coalesce(
                func.sum(InvestmentGoalContribution.amount),
                0,
            )
        )
        .filter(
            InvestmentGoalContribution.goal_id == goal_id,
            InvestmentGoalContribution.user_id == user_id,
        )
        .scalar()
    )

    return Decimal(str(total))


@router.post(
    "/{goal_id}/contributions",
    response_model=InvestmentGoalContributionResponse,
    status_code=201,
)
def add_contribution(
    goal_id: int,
    data: InvestmentGoalContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = get_owned_goal(db, goal_id, current_user.id)

    contribution = InvestmentGoalContribution(
        goal_id=goal_id,
        user_id=current_user.id,
        amount=data.amount,
        note=data.note,
    )

    db.add(contribution)
    db.flush()

    total = get_contribution_total(
        db,
        goal_id,
        current_user.id,
    )

    # Record the first time the manual savings target is reached.
    if total >= Decimal(str(goal.target_amount)):
        if goal.achieved_at is None:
            goal.achieved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(contribution)

    return contribution


@router.get(
    "/{goal_id}/contributions",
    response_model=list[InvestmentGoalContributionResponse],
)
def list_contributions(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_goal(db, goal_id, current_user.id)

    return (
        db.query(InvestmentGoalContribution)
        .filter(
            InvestmentGoalContribution.goal_id == goal_id,
            InvestmentGoalContribution.user_id == current_user.id,
        )
        .order_by(
            InvestmentGoalContribution.contributed_at.desc()
        )
        .all()
    )


@router.delete(
    "/contributions/{contribution_id}",
    status_code=204,
)
def delete_contribution(
    contribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contribution = (
        db.query(InvestmentGoalContribution)
        .filter(
            InvestmentGoalContribution.id == contribution_id,
            InvestmentGoalContribution.user_id == current_user.id,
        )
        .first()
    )

    if not contribution:
        raise HTTPException(
            status_code=404,
            detail="Contribution not found",
        )

    db.delete(contribution)
    db.commit()

    # Historical achieved_at is intentionally preserved.
    return None
