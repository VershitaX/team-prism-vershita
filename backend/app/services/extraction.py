from app.services.ollama_client import call_ollama
from app.schemas.schemas import Chunk, Claim, Citation
import json
import uuid


def build_extraction_prompt(chunk: Chunk) -> str:
    return f"""You are analyzing a section of a research paper.

Section: {chunk.section}
Page: {chunk.page}
Text:
\"\"\"
{chunk.text}
\"\"\"

Extract the following as a JSON array. Each item must have:
- "claim_text": a single clear claim, piece of evidence, or limitation from this text
- "claim_type": one of "claim", "evidence", "limitation"

Respond with ONLY a valid JSON array. No preamble, no explanation, no markdown formatting.

Example format:
[
  {{"claim_text": "The model achieves 95% accuracy on the test set.", "claim_type": "evidence"}},
  {{"claim_text": "The proposed method outperforms baseline approaches.", "claim_type": "claim"}}
]
"""


def extract_claims_from_chunk(chunk: Chunk) -> list[Claim]:
    prompt = build_extraction_prompt(chunk)
    raw_response = call_ollama(prompt)

    # Clean up in case the model adds markdown fences anyway
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()

    try:
        items = json.loads(cleaned)
    except json.JSONDecodeError:
        print("Failed to parse JSON from Ollama response:")
        print(raw_response)
        return []

    claims = []
    for item in items:
        claim = Claim(
            claim_id=str(uuid.uuid4())[:8],
            paper_id=chunk.paper_id,
            claim_text=item.get("claim_text", ""),
            claim_type=item.get("claim_type", "claim"),
            citation=Citation(
                chunk_id=chunk.chunk_id,
                page=chunk.page,
                section=chunk.section,
            ),
        )
        claims.append(claim)

    return claims


# ---- Quick manual test using a fake chunk ----
if __name__ == "__main__":
    fake_chunk = Chunk(
        chunk_id="c001",
        paper_id="test_paper",
        page=4,
        section="Methods",
        text="""We propose a novel attention mechanism that reduces computational
        complexity by 40% compared to standard transformers. Our experiments on
        three benchmark datasets show consistent improvements in accuracy.
        However, our method has not been tested on datasets larger than 1M samples,
        which limits its applicability to large-scale industrial settings."""
    )

    results = extract_claims_from_chunk(fake_chunk)
    for r in results:
        print(r.model_dump())