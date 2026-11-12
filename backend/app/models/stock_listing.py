
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    UniqueConstraint,
    Index,
    func,
)

from app.db.base import Base


class StockListing(Base):
    __tablename__ = "stock_listings"

    id = Column(Integer, primary_key=True, index=True)

    symbol = Column(String(30), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)

    exchange = Column(String(30), nullable=False)
    country = Column(String(2), nullable=False)
    currency = Column(String(3), nullable=False)

    isin = Column(String(12), nullable=True)
    sector = Column(String(100), nullable=True)
    industry = Column(String(150), nullable=True)

    asset_type = Column(
        String(20),
        nullable=False,
        default="EQUITY",
        server_default="EQUITY",
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    source = Column(String(50), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        UniqueConstraint(
            "symbol",
            "exchange",
            name="uq_stock_listing_symbol_exchange",
        ),
        Index(
            "ix_stock_listings_country_exchange",
            "country",
            "exchange",
        ),
        Index(
            "ix_stock_listings_company_name",
            "company_name",
        ),
    )
