from sqlalchemy import Column, Integer, ForeignKey, Numeric, BigInteger, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class StockPrice(Base):
    __tablename__ = "stock_prices"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    price = Column(Numeric(12, 4), nullable=False)
    open_price = Column(Numeric(12, 4))
    high_price = Column(Numeric(12, 4))
    low_price = Column(Numeric(12, 4))
    volume = Column(BigInteger)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    stock = relationship("Stock", back_populates="prices")