
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


class InvestmentGoalCreate(BaseModel):
    goal_name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    target_amount: Decimal = Field(gt=0)
    currency: Literal["INR", "USD"] = "INR"
    deadline: date | None = None


class InvestmentGoalUpdate(BaseModel):
    goal_name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    target_amount: Decimal | None = Field(default=None, gt=0)
    currency: Literal["INR", "USD"] | None = None
    deadline: date | None = None


class InvestmentGoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    goal_name: str
    description: str | None
    target_amount: Decimal
    currency: str
    deadline: date | None
    created_at: datetime

    # Portfolio value tracking
    portfolio_value: Decimal
    portfolio_progress_percentage: float

    # Manual contribution tracking
    manual_contributions: Decimal
    contribution_progress_percentage: float

    # Achievement tracking
    achieved_at: datetime | None
    is_completed: bool

    # Backward-compatible fields for existing frontend
    current_amount: Decimal
    progress_percentage: float
    remaining_amount: Decimal
