from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Numeric,
    DateTime,
    CheckConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class PortfolioTransaction(Base):
    __tablename__ = "portfolio_transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    stock_id = Column(
        Integer,
        ForeignKey("stocks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    transaction_type = Column(String(4), nullable=False)

    quantity = Column(Numeric(20, 8), nullable=False)

    price = Column(Numeric(20, 8), nullable=False)

    transaction_date = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    notes = Column(String(500), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User")
    stock = relationship("Stock")

    __table_args__ = (
        CheckConstraint(
            "transaction_type IN ('BUY', 'SELL')",
            name="ck_portfolio_transaction_type",
        ),
        CheckConstraint(
            "quantity > 0",
            name="ck_portfolio_quantity_positive",
        ),
        CheckConstraint(
            "price > 0",
            name="ck_portfolio_price_positive",
        ),
    )
