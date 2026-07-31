"""
Database tables.

Paper  -> one row per uploaded PDF
Chunk  -> many rows per paper (each is a page/section-tagged slice of text)
Claim  -> many rows per paper (filled in by Person B's extraction step,
          but the table lives here so everyone can build against it now)
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum, Float, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    papers = relationship("Paper", back_populates="owner", cascade="all, delete-orphan")


class ProcessingStatus(str, enum.Enum):
    uploaded = "uploaded"        # file saved, nothing done yet
    parsing = "parsing"          # extracting text from PDF right now
    chunking = "chunking"        # splitting into chunks right now
    chunked = "chunked"          # done — ready for Person B to extract claims
    extracting = "extracting"    # Person B's step in progress
    verifying = "verifying"      # Person B's verification pass in progress
    ready = "ready"              # fully done, ready for frontend
    failed = "failed"


class Paper(Base):
    __tablename__ = "papers"

    id = Column(String, primary_key=True, default=gen_id)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    title = Column(String, nullable=True)          # guessed from PDF later
    status = Column(Enum(ProcessingStatus), default=ProcessingStatus.uploaded)
    error_message = Column(Text, nullable=True)
    page_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="papers")
    chunks = relationship("Chunk", back_populates="paper", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="paper", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String, primary_key=True, default=gen_id)
    paper_id = Column(String, ForeignKey("papers.id"), nullable=False)

    chunk_index = Column(Integer, nullable=False)   # order within the paper, 0,1,2...
    page = Column(Integer, nullable=False)           # 1-indexed page number
    section = Column(String, nullable=False)         # e.g. "Methods", "Unknown"
    text = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=False)

    paper = relationship("Paper", back_populates="chunks")


class Claim(Base):
    """
    This table is Person B's output target. Defined now so the API
    contract is fixed and Person C can build the frontend against it
    with fake/mock data before Person B's extraction logic is ready.
    """
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=gen_id)
    paper_id = Column(String, ForeignKey("papers.id"), nullable=False)
    chunk_id = Column(String, ForeignKey("chunks.id"), nullable=True)

    claim_text = Column(Text, nullable=False)
    claim_type = Column(String, nullable=True)      # "claim" | "limitation" | "evidence"
    page = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)        # 0.0 - 1.0
    status = Column(String, default="unverified")     # "verified" | "flagged" | "unverified"

    paper = relationship("Paper", back_populates="claims")
