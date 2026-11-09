
"""create watchlists table

Revision ID: d40c749ee8bc
Revises: 661da9a9ee98
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d40c749ee8bc"
down_revision: Union[str, Sequence[str], None] = "661da9a9ee98"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "watchlists",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("stock_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["stock_id"], ["stocks.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "stock_id",
            name="uq_watchlist_user_stock",
        ),
    )

    op.create_index(
        "ix_watchlists_id",
        "watchlists",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_watchlists_id", table_name="watchlists")
    op.drop_table("watchlists")
