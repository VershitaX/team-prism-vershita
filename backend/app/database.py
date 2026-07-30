"""
Database connection setup.

We use SQLite for the hackathon demo (it's just one file on disk, zero setup).
If you later want Postgres, you only change DATABASE_URL below — nothing
else in the app changes, because SQLAlchemy abstracts the difference.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./learniq.db"

# check_same_thread=False is only needed for SQLite (FastAPI uses multiple threads)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All our models (Paper, Chunk, Claim) will inherit from this
Base = declarative_base()


def get_db():
    """
    FastAPI dependency: gives each request its own DB session,
    and always closes it afterward, even if an error happens.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
