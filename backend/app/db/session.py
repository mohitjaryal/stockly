from app.db.base import Base
from app.models import User, Stock, StockPrice, Alert
from sqlalchemy import create_engine, URL
from sqlalchemy.orm import sessionmaker
from app.core.config import Settings

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username=Settings.DB_USER,
    password=Settings.DB_PASSWORD,
    host=Settings.DB_HOST,
    port=Settings.DB_PORT,
    database=Settings.DB_NAME,
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)