from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PortfolioTransactionCreate(BaseModel):
    stock_id: int
    transaction_type: Literal["BUY", "SELL"]
    quantity: Decimal = Field(gt=0)
    price: Decimal = Field(gt=0)
    transaction_date: datetime | None = None
    notes: str | None = Field(default=None, max_length=500)


class PortfolioStockInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    company_name: str
    exchange: str | None


class PortfolioTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    stock_id: int
    transaction_type: str
    quantity: Decimal
    price: Decimal
    transaction_date: datetime
    notes: str | None
    stock: PortfolioStockInfo


class PortfolioHoldingResponse(BaseModel):
    stock_id: int
    symbol: str
    company_name: str
    exchange: str | None
    quantity: Decimal
    average_buy_price: Decimal
    current_price: Decimal | None
    invested_value: Decimal
    current_value: Decimal | None
    unrealized_profit_loss: Decimal | None
    realized_profit_loss: Decimal


class PortfolioSummaryResponse(BaseModel):
    total_invested: Decimal
    current_value: Decimal
    unrealized_profit_loss: Decimal
    realized_profit_loss: Decimal
    total_profit_loss: Decimal
    holdings_count: int
    priced_holdings_count: int