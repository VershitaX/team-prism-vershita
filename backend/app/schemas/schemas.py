from pydantic import BaseModel
from typing import Optional, List


# ---- What Person A (PDF ingestion) hands to you ----

class Chunk(BaseModel):
    chunk_id: str          # e.g. "c001"
    paper_id: str          # which paper this chunk belongs to
    page: int              # page number in the PDF
    section: str            # e.g. "Methods", "Abstract", "Results"
    text: str               # the actual chunk text


# ---- What YOU (extraction) produce ----

class Citation(BaseModel):
    chunk_id: str
    page: int
    section: str


class Claim(BaseModel):
    claim_id: str
    paper_id: str
    claim_text: str
    claim_type: str         # "claim" | "evidence" | "limitation"
    citation: Citation
    status: Optional[str] = "pending"     # "pending" | "verified" | "flagged"
    confidence: Optional[float] = None    # 0.0 - 1.0, filled in after verification


# ---- Request/response shapes for your routes ----

class ExtractRequest(BaseModel):
    paper_id: str
    chunks: List[Chunk]


class ExtractResponse(BaseModel):
    paper_id: str
    claims: List[Claim]