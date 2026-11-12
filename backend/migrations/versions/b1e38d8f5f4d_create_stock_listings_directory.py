"""create stock listings directory

Revision ID: b1e38d8f5f4d
Revises: 54cf0f640637
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b1e38d8f5f4d"
down_revision: Union[str, Sequence[str], None] = "54cf0f640637"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "stock_listings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("symbol", sa.String(30), nullable=False),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("exchange", sa.String(30), nullable=False),
        sa.Column("country", sa.String(2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("isin", sa.String(12), nullable=True),
        sa.Column("sector", sa.String(100), nullable=True),
        sa.Column("industry", sa.String(150), nullable=True),
        sa.Column(
            "asset_type",
            sa.String(20),
            nullable=False,
            server_default="EQUITY",
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column("source", sa.String(50), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "symbol",
            "exchange",
            name="uq_stock_listing_symbol_exchange",
        ),
    )

    op.create_index(
        "ix_stock_listings_symbol",
        "stock_listings",
        ["symbol"],
    )
    op.create_index(
        "ix_stock_listings_company_name",
        "stock_listings",
        ["company_name"],
    )
    op.create_index(
        "ix_stock_listings_country_exchange",
        "stock_listings",
        ["country", "exchange"],
    )


def downgrade() -> None:
    op.drop_table("stock_listings")
