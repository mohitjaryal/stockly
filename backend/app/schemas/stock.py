
from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class StockBase(BaseModel):
    symbol: str
    company_name: str
    exchange: str | None = None


class StockCreate(StockBase):
    pass


class StockResponse(StockBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StockPriceResponse(BaseModel):
    stock_id: int
    price: Decimal
    open_price: Decimal | None = None
    high_price: Decimal | None = None
    low_price: Decimal | None = None
    volume: int | None = None

    model_config = ConfigDict(from_attributes=True)
