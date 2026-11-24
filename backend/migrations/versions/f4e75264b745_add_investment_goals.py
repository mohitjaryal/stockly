"""add investment goals

Revision ID: f4e75264b745
Revises: cc82bbd93e61
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f4e75264b745"
down_revision: Union[str, Sequence[str], None] = "cc82bbd93e61"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "investment_goals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("goal_name", sa.String(120), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("target_amount", sa.Numeric(20, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "target_amount > 0",
            name="ck_investment_goal_target_positive",
        ),
        sa.CheckConstraint(
            "currency IN ('INR', 'USD')",
            name="ck_investment_goal_currency",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
    )
    op.create_index(
        "ix_investment_goals_user_id",
        "investment_goals",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_investment_goals_user_id",
        table_name="investment_goals",
    )
    op.drop_table("investment_goals")
