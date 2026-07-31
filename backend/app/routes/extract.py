from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Claim as ClaimModel
from app.schemas import ExtractRequest, ExtractResponse, Citation, Claim as ClaimSchema, Chunk
from app.services.extraction import extract_claims_from_chunk, extract_claims_from_chunks
from app.services.verification import verify_all_claims
from app.services.brief_generation import generate_brief
from app.services.flashcard_generation import generate_flashcards

router = APIRouter(prefix="/paper", tags=["extraction"])


def _to_schema(row: ClaimModel) -> ClaimSchema:
    return ClaimSchema(
        claim_id=row.id,
        paper_id=row.paper_id,
        claim_text=row.claim_text,
        claim_type=row.claim_type or "claim",
        citation=Citation(chunk_id=row.chunk_id or "", page=row.page or 0, section=row.section or ""),
        status=row.status,
        confidence=row.confidence,
    )


def _save_claims_to_db(paper_id: str, verified_claims: list, db: Session) -> list[ClaimModel]:
    """
    Clears any previous claims for this paper, then saves the newly
    verified claims to the database. Shared by both the manual /extract
    endpoint and the automatic run_extraction_pipeline.
    """
    db.query(ClaimModel).filter(ClaimModel.paper_id == paper_id).delete()

    saved_rows = []
    for c in verified_claims:
        row = ClaimModel(
            paper_id=paper_id,
            chunk_id=c.citation.chunk_id,
            claim_text=c.claim_text,
            claim_type=c.claim_type,
            page=c.citation.page,
            section=c.citation.section,
            confidence=c.confidence,
            status=c.status or "unverified",
        )
        db.add(row)
        saved_rows.append(row)

    db.commit()
    for row in saved_rows:
        db.refresh(row)

    return saved_rows


@router.post("/{paper_id}/extract", response_model=ExtractResponse)
def extract_and_verify(paper_id: str, request: ExtractRequest, db: Session = Depends(get_db)):
    """
    Takes chunks for a paper, extracts claims from each chunk,
    then verifies each claim against its source chunk, and saves to the database.
    Extraction and verification run in parallel (thread pool) for speed -
    see extract_claims_from_chunks / verify_all_claims.
    """
    if not request.chunks:
        raise HTTPException(status_code=400, detail="No chunks provided")

    # Step 1: Extract claims from every chunk (parallel)
    all_claims = extract_claims_from_chunks(request.chunks)

    if not all_claims:
        raise HTTPException(status_code=422, detail="No claims could be extracted")

    # Step 2: Verify each claim against its source chunk
    chunks_by_id = {chunk.chunk_id: chunk for chunk in request.chunks}
    verified_claims = verify_all_claims(all_claims, chunks_by_id)

    # Step 3: Save to DB (replaces any previous claims for this paper)
    saved_rows = _save_claims_to_db(paper_id, verified_claims, db)

    return ExtractResponse(paper_id=paper_id, claims=[_to_schema(r) for r in saved_rows])


@router.get("/{paper_id}/claims", response_model=ExtractResponse)
def get_claims(paper_id: str, db: Session = Depends(get_db)):
    rows = db.query(ClaimModel).filter(ClaimModel.paper_id == paper_id).all()
    if not rows:
        raise HTTPException(status_code=404, detail="No claims found for this paper_id. Run /extract first.")
    return ExtractResponse(paper_id=paper_id, claims=[_to_schema(r) for r in rows])


@router.get("/{paper_id}/brief")
async def get_brief(paper_id: str, db: Session = Depends(get_db)):
    rows = db.query(ClaimModel).filter(ClaimModel.paper_id == paper_id).all()
    if not rows:
        raise HTTPException(status_code=404, detail="No claims found for this paper_id. Run /extract first.")
    return await generate_brief(paper_id, [_to_schema(r) for r in rows])


@router.get("/{paper_id}/flashcards")
def get_flashcards(paper_id: str, db: Session = Depends(get_db)):
    rows = db.query(ClaimModel).filter(ClaimModel.paper_id == paper_id).all()
    if not rows:
        raise HTTPException(status_code=404, detail="No claims found for this paper_id. Run /extract first.")
    return generate_flashcards(paper_id, [_to_schema(r) for r in rows])


def run_extraction_pipeline(paper_id: str, db):
    """
    Called automatically once a paper finishes chunking (see paper.py).
    Reads the saved chunks from the DB, runs extraction + verification,
    and saves the results to the database - the same table /claims,
    /brief, and /flashcards read from.
    """
    from app.models import Chunk as DBChunk, Paper, ProcessingStatus

    db_chunks = (
        db.query(DBChunk)
        .filter(DBChunk.paper_id == paper_id)
        .order_by(DBChunk.chunk_index)
        .all()
    )
    if not db_chunks:
        return

    # Convert DB rows into the Pydantic Chunk schema extraction expects
    schema_chunks = [
        Chunk(
            chunk_id=c.id,
            paper_id=paper_id,
            page=c.page,
            section=c.section,
            text=c.text,
        )
        for c in db_chunks
    ]

    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if paper:
        paper.status = ProcessingStatus.extracting
        db.commit()

    all_claims = extract_claims_from_chunks(schema_chunks)

    if not all_claims:
        if paper:
            paper.status = ProcessingStatus.failed
            paper.error_message = "No claims could be extracted"
            db.commit()
        return

    if paper:
        paper.status = ProcessingStatus.verifying
        db.commit()

    chunks_by_id = {c.chunk_id: c for c in schema_chunks}
    verified_claims = verify_all_claims(all_claims, chunks_by_id)

    _save_claims_to_db(paper_id, verified_claims, db)

    if paper:
        paper.status = ProcessingStatus.ready
        db.commit()