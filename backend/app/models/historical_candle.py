
from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    ForeignKey,
    Numeric,
    DateTime,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class HistoricalCandle(Base):
    __tablename__ = "historical_candles"

    __table_args__ = (
        UniqueConstraint(
            "stock_id",
            "resolution",
            "recorded_at",
            name="uq_historical_candle_stock_resolution_time",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    stock_id = Column(
        Integer,
        ForeignKey("stocks.id"),
        nullable=False,
    )

    resolution = Column(String(5), nullable=False)

    open_price = Column(Numeric(12, 4), nullable=False)
    high_price = Column(Numeric(12, 4), nullable=False)
    low_price = Column(Numeric(12, 4), nullable=False)
    close_price = Column(Numeric(12, 4), nullable=False)

    volume = Column(BigInteger)

    recorded_at = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    stock = relationship("Stock")
