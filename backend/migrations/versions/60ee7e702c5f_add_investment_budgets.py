
"""add investment budgets"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "60ee7e702c5f"
down_revision: Union[str, Sequence[str], None] = "633ca414f564"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "investment_budgets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("budget_name", sa.String(100), nullable=False),
        sa.Column("amount", sa.Numeric(20, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("notes", sa.String(300), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount > 0", name="ck_investment_budget_amount_positive"),
        sa.CheckConstraint(
            "currency IN ('INR', 'USD')",
            name="ck_investment_budget_currency",
        ),
        sa.CheckConstraint(
            "month >= 1 AND month <= 12",
            name="ck_investment_budget_month",
        ),
        sa.CheckConstraint("year >= 2000", name="ck_investment_budget_year"),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id", "month", "year", "currency",
            name="uq_user_monthly_budget",
        ),
    )

    op.create_index(
        "ix_investment_budgets_id",
        "investment_budgets",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_investment_budgets_user_id",
        "investment_budgets",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_investment_budgets_user_id",
        table_name="investment_budgets",
    )
    op.drop_index(
        "ix_investment_budgets_id",
        table_name="investment_budgets",
    )
    op.drop_table("investment_budgets")
