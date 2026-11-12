
import os

from sqlalchemy import create_engine, URL
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models import User, Stock, StockPrice, Alert
from app.core.config import Settings


if Settings.DATABASE_URL:
    database_url = Settings.DATABASE_URL

    # Render/Supabase URL compatibility with psycopg 3
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1,
        )
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://",
            "postgresql+psycopg://",
            1,
        )
else:
    database_url = URL.create(
        drivername="postgresql+psycopg",
        username=Settings.DB_USER,
        password=Settings.DB_PASSWORD,
        host=Settings.DB_HOST,
        port=Settings.DB_PORT,
        database=Settings.DB_NAME,
    )

engine = create_engine(database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)
