from fastapi import APIRouter, HTTPException
from app.schemas.schemas import ExtractRequest, ExtractResponse, Chunk, Claim
from app.services.extraction import extract_claims_from_chunk
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
    """
    if not request.chunks:
        raise HTTPException(status_code=400, detail="No chunks provided")

    # Step 1: Extract claims from every chunk
    all_claims: list[Claim] = []
    for chunk in request.chunks:
        claims = extract_claims_from_chunk(chunk)
        all_claims.extend(claims)

    if not all_claims:
        raise HTTPException(status_code=422, detail="No claims could be extracted")

    # Step 2: Verify each claim against its source chunk
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