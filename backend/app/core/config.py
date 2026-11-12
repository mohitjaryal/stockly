
import os


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "5432"))
    DB_NAME = os.getenv("DB_NAME", "stockly")
    DB_USER = os.getenv("DB_USER", "mohit")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "@#mohitdb")
