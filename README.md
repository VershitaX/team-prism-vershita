# Research Paper Briefing Agent

An AI agent that reads research papers and turns them into fast, trustworthy study aids — a presentation-ready brief, flashcards, and a concept map — with every claim traceable back to its exact source in the paper.

Built for **Track 2: AI Agent** — *Research Paper Briefing Agent* challenge.

## The Problem

Hackathon teams and students often don't have time to fully read a paper before deciding whether it matters to them. Generic summarizers compress text but don't tell you what's actually backed by evidence versus what's assumption or spin — and they rarely show you *where* a claim came from.

## What This Agent Does

1. **Ingests** a research paper (PDF), splitting it into page- and section-tagged chunks
2. **Extracts** claims, evidence, and limitations from each section using an LLM
3. **Verifies** every extracted claim against its original source text in a second pass — flagging anything that isn't actually supported, instead of trusting the first pass blindly
4. **Generates study aids** from the verified claims:
   - A short, presentation-ready **brief** with inline citations
   - **Flashcards** (Q&A pairs) for active recall
   - A **concept map** showing how the paper's key ideas relate to each other
5. Every claim, brief sentence, and flashcard links back to the **exact page and section** it came from

This is not a text-shortening tool — it's built to show its work, so a student can verify anything the agent tells them.

## Why This Approach

Most hackathon summarizers run one LLM pass and trust the output. We deliberately built a **two-pass architecture**: extract, then verify. In testing, this caught a deliberately fabricated claim ("99.9% accuracy on all datasets") that wasn't in the source text — the verification pass correctly flagged it instead of accepting it. That's the difference between a shortcut and a grounded agent.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | FastAPI (Python) |
| Auth | JWT-based signup/login, per-user paper access control |
| PDF Parsing | PyMuPDF |
| Database | PostgreSQL |
| AI / LLM | Groq API (`llama-3.3-70b-versatile`) |

## Architecture

```
Upload PDF
    ↓
Parse + chunk (page & section tagged)
    ↓
Extract claims per chunk (LLM pass 1)
    ↓
Verify each claim against its source chunk (LLM pass 2)
    ↓
Store verified claims
    ↓
Generate on demand: Brief | Flashcards | Concept Map
```

## API Endpoints (AI Module)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/paper/{paper_id}/extract` | Extracts and verifies claims from submitted chunks |
| `GET` | `/paper/{paper_id}/claims` | Returns stored, verified claims for a paper |
| `GET` | `/paper/{paper_id}/brief` | Generates a presentation-ready summary with citations |
| `GET` | `/paper/{paper_id}/flashcards` | Generates Q&A flashcards from verified claims |
| `GET` | `/paper/{paper_id}/concept-map` | Generates a node/edge concept graph |

### Example: Chunk input format

```json
{
  "chunk_id": "c001",
  "paper_id": "paper123",
  "page": 4,
  "section": "Methods",
  "text": "..."
}
```

### Example: Claim output format

```json
{
  "claim_id": "997f39b3",
  "paper_id": "demo1",
  "claim_text": "The proposed method reduces computational complexity by 40%.",
  "claim_type": "claim",
  "citation": { "chunk_id": "c001", "page": 4, "section": "Methods" },
  "status": "verified",
  "confidence": 0.9
}
```

## Judging Criteria — How We Address Them

**Factual grounding** — Every claim is checked against its source chunk in a dedicated verification pass before being surfaced. Fabricated or unsupported claims are flagged, not hidden.

**Clarity** — Outputs are structured (brief, flashcards, concept map) rather than a single wall of text, and every output traces back to a page and section.

**Genuinely helps learning, not just shortens text** — The agent produces three distinct study formats from the same verified claims, matching different study styles (reading, active recall, visual relationships) — rather than one generic summary.

## Team

| Role | Responsibility |
|---|---|
| Backend Core | PDF upload, parsing, chunking, database, auth |
| AI Agent | Extraction, verification, brief/flashcard/concept-map generation |
| Frontend | Upload flow, live processing view, results dashboard |

## Status

🚧 Hackathon prototype — actively in development. Core AI pipeline (extraction → verification → brief/flashcards/concept-map) is built and tested end-to-end. Backend auth and frontend integration in progress.
