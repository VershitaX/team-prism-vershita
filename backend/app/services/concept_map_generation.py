from app.services.ollama_client import call_ollama
from app.schemas.schemas import Claim, ConceptMap, ConceptNode, ConceptEdge
import json


def _strip_json_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()
    return cleaned


def build_concept_map_prompt(claims: list[Claim]) -> str:
    claims_text = "\n".join(
        f"- ({c.claim_type}) {c.claim_text}" for c in claims
    )

    return f"""You are building a concept map from a research paper's extracted claims.

Claims:
{claims_text}

Extract the key concepts (methods, techniques, datasets, metrics, findings, limitations)
mentioned across these claims, and the relationships between them.

Respond with ONLY a valid JSON object in this exact format, nothing else:

{{
  "nodes": [
    {{"id": "n1", "label": "Attention Mechanism", "type": "method"}},
    {{"id": "n2", "label": "Computational Complexity", "type": "result"}}
  ],
  "edges": [
    {{"source": "n1", "target": "n2", "relationship": "reduces"}}
  ]
}}

Rules:
- "type" must be one of: "concept", "method", "result", "limitation"
- Keep labels short (2-5 words)
- Only include relationships that are directly supported by the claims above
- Aim for 4-8 nodes and 3-6 edges — enough to be useful, not overwhelming
- Every edge's source and target must reference a valid node id from the nodes list
"""


def generate_concept_map(paper_id: str, claims: list[Claim]) -> ConceptMap:
    if not claims:
        return ConceptMap(paper_id=paper_id, nodes=[], edges=[])

    prompt = build_concept_map_prompt(claims)
    raw_response = call_ollama(prompt)
    cleaned = _strip_json_fences(raw_response)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        print("Failed to parse concept map JSON:")
        print(raw_response)
        return ConceptMap(paper_id=paper_id, nodes=[], edges=[])

    valid_node_ids = {n["id"] for n in data.get("nodes", [])}

    nodes = [
        ConceptNode(id=n["id"], label=n["label"], type=n.get("type", "concept"))
        for n in data.get("nodes", [])
    ]

    # Only keep edges whose source/target actually exist as nodes
    edges = [
        ConceptEdge(source=e["source"], target=e["target"], relationship=e["relationship"])
        for e in data.get("edges", [])
        if e.get("source") in valid_node_ids and e.get("target") in valid_node_ids
    ]

    return ConceptMap(paper_id=paper_id, nodes=nodes, edges=edges)


# ---- Quick manual test ----
if __name__ == "__main__":
    from app.schemas.schemas import Citation

    fake_claims = [
        Claim(
            claim_id="c1", paper_id="test123",
            claim_text="We propose a novel attention mechanism that reduces computational complexity by 40%.",
            claim_type="claim",
            citation=Citation(chunk_id="c001", page=4, section="Methods"),
            status="verified", confidence=0.9,
        ),
        Claim(
            claim_id="c2", paper_id="test123",
            claim_text="Our experiments on three benchmark datasets show consistent improvements in accuracy.",
            claim_type="evidence",
            citation=Citation(chunk_id="c001", page=4, section="Methods"),
            status="verified", confidence=0.9,
        ),
        Claim(
            claim_id="c3", paper_id="test123",
            claim_text="Our method has not been tested on datasets larger than 1M samples.",
            claim_type="limitation",
            citation=Citation(chunk_id="c001", page=4, section="Methods"),
            status="verified", confidence=0.9,
        ),
    ]

    result = generate_concept_map("test123", fake_claims)
    print(result.model_dump_json(indent=2))