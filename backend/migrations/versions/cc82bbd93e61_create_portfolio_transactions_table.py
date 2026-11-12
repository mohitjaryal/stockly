"""create portfolio transactions table

Revision ID: cc82bbd93e61
Revises: b1e38d8f5f4d
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "cc82bbd93e61"
down_revision: Union[str, Sequence[str], None] = "b1e38d8f5f4d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "portfolio_transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("stock_id", sa.Integer(), nullable=False),
        sa.Column("transaction_type", sa.String(length=4), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column("price", sa.Numeric(precision=20, scale=8), nullable=False),
        sa.Column(
            "transaction_date",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "transaction_type IN ('BUY', 'SELL')",
            name="ck_portfolio_transaction_type",
        ),
        sa.CheckConstraint(
            "price > 0",
            name="ck_portfolio_price_positive",
        ),
        sa.CheckConstraint(
            "quantity > 0",
            name="ck_portfolio_quantity_positive",
        ),
        sa.ForeignKeyConstraint(
            ["stock_id"], ["stocks.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_portfolio_transactions_id",
        "portfolio_transactions",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_portfolio_transactions_user_id",
        "portfolio_transactions",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_portfolio_transactions_stock_id",
        "portfolio_transactions",
        ["stock_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_portfolio_transactions_stock_id",
        table_name="portfolio_transactions",
    )
    op.drop_index(
        "ix_portfolio_transactions_user_id",
        table_name="portfolio_transactions",
    )
    op.drop_index(
        "ix_portfolio_transactions_id",
        table_name="portfolio_transactions",
    )
    op.drop_table("portfolio_transactions")
