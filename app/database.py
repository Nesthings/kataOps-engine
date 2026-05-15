import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker, declarative_base

# Env var for RDS if not availiable uses squlite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kataops_local.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- TABLE MODEL ---
class DictionaryEntry(Base):
    __tablename__ = "dictionary_entries"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True, nullable=False)
    definition = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_agent = Column(String, nullable=True)

def init_db():
    # Create tables if not existent
    Base.metadata.create_all(bind=engine)

# Dependenciy to inject database to Fastapi
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()