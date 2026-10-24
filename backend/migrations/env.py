
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool, URL
from alembic import context

from app.db.base import Base
import app.models
from app.core.config import Settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_database_url():
    return URL.create(
        drivername="postgresql+psycopg",
        username=Settings.DB_USER,
        password=Settings.DB_PASSWORD,
        host=Settings.DB_HOST,
        port=int(Settings.DB_PORT),
        database=Settings.DB_NAME,
    )


def run_migrations_offline() -> None:
    context.configure(
        url=get_database_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        {
            "sqlalchemy.url": get_database_url().render_as_string(
                hide_password=False
            )
        },
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
