from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings


database_url = settings.DATABASE_URL

connect_args = (
    {"check_same_thread": False}
    if "sqlite" in database_url
    else {}
)


engine = create_engine(
    database_url,
    connect_args=connect_args,
    echo=False
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()