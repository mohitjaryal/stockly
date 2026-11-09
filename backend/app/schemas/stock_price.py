from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


class StockPriceResponse(BaseModel):
    id: int
    stock_id: int
    price: Decimal
    open_price: Decimal | None
    high_price: Decimal | None
    low_price: Decimal | None
    volume: int | None
    recorded_at: datetime

    model_config = {"from_attributes": True}