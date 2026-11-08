
"""add historical candles table

Revision ID: 661da9a9ee98
Revises: 64d504486593
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "661da9a9ee98"
down_revision: Union[str, Sequence[str], None] = "64d504486593"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "historical_candles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_id", sa.Integer(), nullable=False),
        sa.Column("resolution", sa.String(length=5), nullable=False),
        sa.Column("open_price", sa.Numeric(12, 4), nullable=False),
        sa.Column("high_price", sa.Numeric(12, 4), nullable=False),
        sa.Column("low_price", sa.Numeric(12, 4), nullable=False),
        sa.Column("close_price", sa.Numeric(12, 4), nullable=False),
        sa.Column("volume", sa.BigInteger(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["stock_id"], ["stocks.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "stock_id",
            "resolution",
            "recorded_at",
            name="uq_historical_candle_stock_resolution_time",
        ),
    )

    op.create_index(
        "ix_historical_candles_id",
        "historical_candles",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_historical_candles_id",
        table_name="historical_candles",
    )

    op.drop_table("historical_candles")
