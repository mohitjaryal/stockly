
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class InvestmentGoalContributionCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    note: str | None = Field(default=None, max_length=300)


class InvestmentGoalContributionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    goal_id: int
    amount: Decimal
    note: str | None
    contributed_at: datetime
