from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StockListingResponse(BaseModel):
    id: int
    symbol: str
    company_name: str
    exchange: str
    country: str
    currency: str
    isin: str | None = None
    sector: str | None = None
    industry: str | None = None
    asset_type: str
    is_active: bool
    source: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
