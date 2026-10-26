from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Literal
from datetime import datetime

# Create Alert
class AlertCreate(BaseModel):
    stock_id:int
    condition: Literal["above" , "below"]
    target_price: Decimal = Field(gt=0)

# Alert Response
class AlertResponse(BaseModel):
    id:int
    user_id: int
    stock_id: int
    condition: Literal['above','below']
    target_price: Decimal
    status: str
    created_at: datetime
    triggered_at: datetime | None
    model_config = {"from_attributes": True}

# Alert Update
class AlertUpdate(BaseModel):
    condition: Literal['above','below'] | None = None
    target_price: Decimal | None = Field(default=None, gt=0)