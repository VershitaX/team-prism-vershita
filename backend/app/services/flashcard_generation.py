# services/flashcard_generation.py
import json
import uuid
from typing import List
from app.schemas.schemas import Claim
from app.services.ollama_client import call_ollama

def _strip_json_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return text.strip()

FLASHCARD_PROMPT = """You are turning a verified research paper claim into a study flashcard.

Claim ({claim_type}): {claim_text}
Source: page {page}, section {section}

Write ONE flashcard as JSON with exactly these fields:
{{"question": "a clear question testing understanding of this claim", "answer": "a concise correct answer based only on the claim text above"}}

Return ONLY the JSON object. No preamble, no markdown fences, no explanation."""

def generate_flashcard_for_claim(claim: Claim) -> dict:
    prompt = FLASHCARD_PROMPT.format(
        claim_type=claim.claim_type,
        claim_text=claim.claim_text,
        page=claim.citation.page,
        section=claim.citation.section,
    )

    raw = call_ollama(prompt)
    cleaned = _strip_json_fences(raw)

    try:
        parsed = json.loads(cleaned)
        question = parsed["question"]
        answer = parsed["answer"]
    except (json.JSONDecodeError, KeyError):
        # fail-soft: hackathon demo should never 500 on a bad LLM response
        question = f"What does the paper claim regarding: {claim.claim_text[:60]}...?"
        answer = claim.claim_text

    return {
        "flashcard_id": str(uuid.uuid4())[:8],
        "claim_id": claim.claim_id,
        "question": question,
        "answer": answer,
        "citation": {
            "chunk_id": claim.citation.chunk_id,
            "page": claim.citation.page,
            "section": claim.citation.section,
        },
    }

def generate_flashcards(paper_id: str, claims: List[Claim]) -> dict:
    if not claims:
        return {"paper_id": paper_id, "flashcards": []}

    flashcards = [generate_flashcard_for_claim(c) for c in claims]
    return {"paper_id": paper_id, "flashcards": flashcards}