
"""add investment goal achievement timestamp"""

from alembic import op
import sqlalchemy as sa

revision = "633ca414f564"
down_revision = "5121e67b12dd"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "investment_goals",
        sa.Column("achieved_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("investment_goals", "achieved_at")
