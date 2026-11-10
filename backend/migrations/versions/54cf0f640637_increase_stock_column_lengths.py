"""increase stock column lengths

Revision ID: 54cf0f640637
Revises: d40c749ee8bc
Create Date: 2026-11-10 19:55:33.451476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54cf0f640637'
down_revision: Union[str, Sequence[str], None] = 'd40c749ee8bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    op.alter_column(
        "stocks",
        "symbol",
        existing_type=sa.VARCHAR(length=10),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False,
    )

    op.alter_column(
        "stocks",
        "company_name",
        existing_type=sa.VARCHAR(length=150),
        type_=sa.VARCHAR(length=255),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "stocks",
        "company_name",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.VARCHAR(length=150),
        existing_nullable=False,
    )

    op.alter_column(
        "stocks",
        "symbol",
        existing_type=sa.VARCHAR(length=20),
        type_=sa.VARCHAR(length=10),
        existing_nullable=False,
    )

