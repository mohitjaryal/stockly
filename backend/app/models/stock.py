from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    exchange = Column(String(50), nullable=True)

    prices = relationship("StockPrice", back_populates="stock")
    alerts = relationship("Alert", back_populates="stock")