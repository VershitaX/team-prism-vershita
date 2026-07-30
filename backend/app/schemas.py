"""
Pydantic schemas = the exact JSON shape the API sends/receives.
This file IS the contract you show your teammates. Person C (frontend)
builds against ChunkOut / PaperStatusOut. Person B (extraction) reads
ChunkOut as input for their prompts.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ChunkOut(BaseModel):
    chunk_id: str
    chunk_index: int
    page: int
    section: str
    text: str
    token_count: int

    class Config:
        from_attributes = True


class PaperUploadOut(BaseModel):
    paper_id: str
    filename: str
    status: str


class PaperStatusOut(BaseModel):
    paper_id: str
    filename: str
    title: Optional[str]
    status: str
    page_count: Optional[int]
    chunk_count: int
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PaperChunksOut(BaseModel):
    paper_id: str
    status: str
    chunks: List[ChunkOut]


# ---- Extraction (Person B) schemas ----

class Chunk(BaseModel):
    chunk_id: str          # e.g. "c001"
    paper_id: str          # which paper this chunk belongs to
    page: int              # page number in the PDF
    section: str           # e.g. "Methods", "Abstract", "Results"
    text: str              # the actual chunk text


class Citation(BaseModel):
    chunk_id: str
    page: int
    section: str


class Claim(BaseModel):
    claim_id: str
    paper_id: str
    claim_text: str
    claim_type: str        # "claim" | "evidence" | "limitation"
    citation: Citation
    status: Optional[str] = "pending"     # "pending" | "verified" | "flagged"
    confidence: Optional[float] = None    # 0.0 - 1.0, filled in after verification


class ExtractRequest(BaseModel):
    paper_id: str
    chunks: List[Chunk]


class ExtractResponse(BaseModel):
    paper_id: str
    claims: List[Claim]