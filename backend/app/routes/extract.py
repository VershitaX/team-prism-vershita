from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Claim as ClaimModel
from app.schemas import ExtractRequest, ExtractResponse, Citation, Claim as ClaimSchema
from app.services.extraction import extract_claims_from_chunk
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


@router.post("/{paper_id}/extract", response_model=ExtractResponse)
def extract_and_verify(paper_id: str, request: ExtractRequest, db: Session = Depends(get_db)):
    """
    Takes chunks for a paper, extracts claims from each chunk,
    then verifies each claim against its source chunk, and saves to the database.
    """
    if not request.chunks:
        raise HTTPException(status_code=400, detail="No chunks provided")

    all_claims = []
    for chunk in request.chunks:
        claims = extract_claims_from_chunk(chunk)
        all_claims.extend(claims)

    if not all_claims:
        raise HTTPException(status_code=422, detail="No claims could be extracted")

    chunks_by_id = {chunk.chunk_id: chunk for chunk in request.chunks}
    verified_claims = verify_all_claims(all_claims, chunks_by_id)

    # Clear any previous claims for this paper (re-running /extract replaces them)
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