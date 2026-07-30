import json
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


BRIEF_PROMPT = """You are writing a short, presentation-ready research brief for a student.

Below are verified claims extracted from a paper, each tagged as claim / evidence / limitation,
with the page and section they came from.

{claims_block}

Write a brief with exactly these fields, returned as JSON:
{{
  "summary": "2-4 sentence overview of what the paper does, in plain language",
  "key_findings": ["short bullet points for each major claim/evidence, citing section names inline like (Methods, p.4)"],
  "limitations": ["short bullet points for each limitation, citing section names inline"]
}}

Base every sentence ONLY on the claims given above. Do not invent findings not present in the claims.
Return ONLY the JSON object. No preamble, no markdown fences, no explanation."""


def _format_claims_block(claims: List[Claim]) -> str:
    lines = []
    for c in claims:
        lines.append(
            f"- [{c.claim_type}] {c.claim_text} "
            f"(section: {c.citation.section}, page: {c.citation.page})"
        )
    return "\n".join(lines)


async def generate_brief(paper_id: str, claims: List[Claim]) -> dict:
    if not claims:
        return {
            "paper_id": paper_id,
            "summary": "No verified claims were found for this paper yet.",
            "key_findings": [],
            "limitations": [],
        }

    prompt = BRIEF_PROMPT.format(claims_block=_format_claims_block(claims))
    raw = call_ollama(prompt)
    cleaned = _strip_json_fences(raw)

    try:
        parsed = json.loads(cleaned)
        summary = parsed.get("summary", "")
        key_findings = parsed.get("key_findings", [])
        limitations = parsed.get("limitations", [])
    except json.JSONDecodeError:
        summary = "Brief generation returned an unexpected format; showing raw claims instead."
        key_findings = [c.claim_text for c in claims if c.claim_type in ("claim", "evidence")]
        limitations = [c.claim_text for c in claims if c.claim_type == "limitation"]

    return {
        "paper_id": paper_id,
        "summary": summary,
        "key_findings": key_findings,
        "limitations": limitations,
    }