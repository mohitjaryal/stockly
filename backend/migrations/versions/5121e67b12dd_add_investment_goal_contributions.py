
"""add investment goal contributions

Revision ID: 5121e67b12dd
Revises: f4e75264b745
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "5121e67b12dd"
down_revision: Union[str, Sequence[str], None] = "f4e75264b745"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "investment_goal_contributions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "goal_id",
            sa.Integer(),
            sa.ForeignKey("investment_goals.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(20, 2), nullable=False),
        sa.Column("note", sa.String(300), nullable=True),
        sa.Column(
            "contributed_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "amount > 0",
            name="ck_goal_contribution_amount_positive",
        ),
    )

    op.create_index(
        "ix_investment_goal_contributions_goal_id",
        "investment_goal_contributions",
        ["goal_id"],
    )
    op.create_index(
        "ix_investment_goal_contributions_user_id",
        "investment_goal_contributions",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_investment_goal_contributions_user_id",
        table_name="investment_goal_contributions",
    )
    op.drop_index(
        "ix_investment_goal_contributions_goal_id",
        table_name="investment_goal_contributions",
    )
    op.drop_table("investment_goal_contributions")
