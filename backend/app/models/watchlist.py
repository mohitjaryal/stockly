from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    stock_id = Column(
        Integer,
        ForeignKey("stocks.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="watchlist")
    stock = relationship("Stock", back_populates="watchlist")

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "stock_id",
            name="uq_watchlist_user_stock",
        ),
    )
