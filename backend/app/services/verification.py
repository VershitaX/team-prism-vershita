from app.services.groq_client import call_groq
from app.schemas import Claim, Chunk
from concurrent.futures import ThreadPoolExecutor
import json


def build_verification_prompt(claim: Claim, source_text: str) -> str:
    return f"""You are fact-checking a claim against its source text.

Claim: "{claim.claim_text}"

Source text:
\"\"\"
{source_text}
\"\"\"

Does the source text actually support this claim?

Respond with ONLY a valid JSON object in this exact format, nothing else:
{{"status": "verified", "confidence": 0.9}}

or

{{"status": "flagged", "confidence": 0.3}}

Rules:
- "verified" means the source text clearly supports the claim
- "flagged" means the source text does not support it, contradicts it, or is unclear
- confidence is a number between 0 and 1 reflecting how sure you are
"""


def verify_claim(claim: Claim, chunk: Chunk) -> Claim:
    """
    Checks a single claim against its source chunk text.
    Returns the claim updated with status and confidence.
    """
    prompt = build_verification_prompt(claim, chunk.text)
    raw_response = call_groq(prompt)

    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()

    try:
        result = json.loads(cleaned)
        claim.status = result.get("status", "flagged")
        claim.confidence = float(result.get("confidence", 0.0))
    except (json.JSONDecodeError, ValueError):
        print(f"[VERIFY] Failed to parse verification response for claim {claim.claim_id}:", flush=True)
        print(raw_response, flush=True)
        claim.status = "flagged"
        claim.confidence = 0.0

    return claim


def verify_all_claims(claims: list[Claim], chunks_by_id: dict[str, Chunk], max_workers: int = 10) -> list[Claim]:
    """
    Verifies a list of claims IN PARALLEL using a thread pool.
    chunks_by_id maps chunk_id -> Chunk, so we can look up the right
    source text for each claim's citation.
    """
    def verify_one(claim: Claim) -> Claim:
        chunk = chunks_by_id.get(claim.citation.chunk_id)
        if chunk is None:
            claim.status = "flagged"
            claim.confidence = 0.0
            return claim
        return verify_claim(claim, chunk)

    verified: list[Claim] = []
    total = len(claims)
    completed = 0

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for result in executor.map(verify_one, claims):
            completed += 1
            print(f"[VERIFY] {completed}/{total} claims done - {result.status}", flush=True)
            verified.append(result)

    return verified


# ---- Quick manual test ----
if __name__ == "__main__":
    from app.schemas import Citation

    fake_chunk = Chunk(
        chunk_id="c001",
        paper_id="test_paper",
        page=4,
        section="Methods",
        text="""We propose a novel attention mechanism that reduces computational
        complexity by 40% compared to standard transformers. Our experiments on
        three benchmark datasets show consistent improvements in accuracy."""
    )

    # A true claim (should verify)
    true_claim = Claim(
        claim_id="claim1",
        paper_id="test_paper",
        claim_text="The proposed method reduces computational complexity by 40%.",
        claim_type="claim",
        citation=Citation(chunk_id="c001", page=4, section="Methods"),
    )

    # A false/unsupported claim (should flag)
    false_claim = Claim(
        claim_id="claim2",
        paper_id="test_paper",
        claim_text="The method achieves 99.9% accuracy on all datasets.",
        claim_type="claim",
        citation=Citation(chunk_id="c001", page=4, section="Methods"),
    )

    chunks_by_id = {"c001": fake_chunk}
    results = verify_all_claims([true_claim, false_claim], chunks_by_id)

    for r in results:
        print(f"{r.claim_text} -> {r.status} ({r.confidence})")