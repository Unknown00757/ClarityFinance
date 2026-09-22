from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings


# Get the database URL from configuration
database_url = settings.DATABASE_URL


# If PostgreSQL is being used, explicitly use psycopg 3
if database_url.startswith("postgresql://"):
    database_url = database_url.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )


# SQLite connection arguments for multithreaded FastAPI requests
connect_args = (
    {"check_same_thread": False}
    if "sqlite" in database_url
    else {}
)


# Create SQLAlchemy engine
engine = create_engine(
    database_url,
    connect_args=connect_args,
    echo=False
)


# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for SQLAlchemy models
Base = declarative_base()


# FastAPI database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()