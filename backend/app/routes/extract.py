from fastapi import APIRouter, HTTPException
from app.schemas import ExtractRequest, ExtractResponse, Chunk, Claim
from app.services.extraction import extract_claims_from_chunks
from app.services.verification import verify_all_claims
from app.services.brief_generation import generate_brief
from app.services.flashcard_generation import generate_flashcards
router = APIRouter(prefix="/paper", tags=["extraction"])

# Temporary in-memory storage until Person A's database is ready
# (paper_id -> list of claims)
_claims_store: dict[str, list[Claim]] = {}


@router.post("/{paper_id}/extract", response_model=ExtractResponse)
def extract_and_verify(paper_id: str, request: ExtractRequest):
    """
    Takes chunks for a paper, extracts claims from each chunk,
    then verifies each claim against its source chunk.
    Both extraction and verification run in parallel (thread pool)
    for speed - see extract_claims_from_chunks / verify_all_claims.
    """
    if not request.chunks:
        raise HTTPException(status_code=400, detail="No chunks provided")

    # Step 1: Extract claims from every chunk (parallel)
    all_claims: list[Claim] = extract_claims_from_chunks(request.chunks)

    if not all_claims:
        raise HTTPException(status_code=422, detail="No claims could be extracted")

    # Step 2: Verify each claim against its source chunk (parallel)
    chunks_by_id = {chunk.chunk_id: chunk for chunk in request.chunks}
    verified_claims = verify_all_claims(all_claims, chunks_by_id)

    # Step 3: Store results (temporary, until DB integration)
    _claims_store[paper_id] = verified_claims

    return ExtractResponse(paper_id=paper_id, claims=verified_claims)


@router.get("/{paper_id}/claims", response_model=ExtractResponse)
def get_claims(paper_id: str):
    """
    Returns previously extracted + verified claims for a paper.
    """
    claims = _claims_store.get(paper_id)
    if claims is None:
        raise HTTPException(status_code=404, detail="No claims found for this paper_id. Run /extract first.")

    return ExtractResponse(paper_id=paper_id, claims=claims)
@router.get("/{paper_id}/brief")
async def get_brief(paper_id: str):
    claims = _claims_store.get(paper_id)
    if claims is None:
        raise HTTPException(status_code=404, detail="No claims found for this paper_id. Run /extract first.")

    return await generate_brief(paper_id, claims)

@router.get("/{paper_id}/flashcards")
def get_flashcards(paper_id: str):
    claims = _claims_store.get(paper_id)
    if claims is None:
        raise HTTPException(status_code=404, detail="No claims found for this paper_id. Run /extract first.")

    return generate_flashcards(paper_id, claims)

def run_extraction_pipeline(paper_id: str, db):
    """
    Called automatically once a paper finishes chunking (see paper.py).
    Reads the saved chunks from the DB, runs extraction + verification,
    and stores results in _claims_store - the same store /claims,
    /brief, and /flashcards already read from.
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

    all_claims: list[Claim] = extract_claims_from_chunks(schema_chunks)

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

    _claims_store[paper_id] = verified_claims

    if paper:
        paper.status = ProcessingStatus.ready
        db.commit()