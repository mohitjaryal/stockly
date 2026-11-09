from datetime import datetime
from pydantic import BaseModel, Field


class WatchlistCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)


class WatchlistResponse(BaseModel):
    id: int
    symbol: str
    company_name: str
    exchange: str | None
    created_at: datetime
