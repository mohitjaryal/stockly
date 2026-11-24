
"""add investment plans

Revision ID: b81358a85b4f
Revises: 60ee7e702c5f
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b81358a85b4f"
down_revision: Union[str, Sequence[str], None] = "60ee7e702c5f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "investment_plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("investment_name", sa.String(150), nullable=False),
        sa.Column("asset_type", sa.String(30), nullable=False),
        sa.Column("planned_amount", sa.Numeric(20, 2), nullable=False),
        sa.Column("actual_amount", sa.Numeric(20, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("planned_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("notes", sa.String(300), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "planned_amount > 0",
            name="ck_investment_plan_planned_amount_positive",
        ),
        sa.CheckConstraint(
            "actual_amount >= 0",
            name="ck_investment_plan_actual_amount_nonnegative",
        ),
        sa.CheckConstraint(
            "currency IN ('INR', 'USD')",
            name="ck_investment_plan_currency",
        ),
        sa.CheckConstraint(
            "asset_type IN ('STOCK', 'MUTUAL_FUND', 'ETF', 'OTHER')",
            name="ck_investment_plan_asset_type",
        ),
        sa.CheckConstraint(
            "status IN ('PLANNED', 'COMPLETED', 'CANCELLED')",
            name="ck_investment_plan_status",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_investment_plans_id",
        "investment_plans",
        ["id"],
    )
    op.create_index(
        "ix_investment_plans_user_id",
        "investment_plans",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_investment_plans_user_id", table_name="investment_plans")
    op.drop_index("ix_investment_plans_id", table_name="investment_plans")
    op.drop_table("investment_plans")
