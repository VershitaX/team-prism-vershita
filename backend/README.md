# LearnIQ Paper Briefing — Backend (Person A: Ingestion & Chunking)

This is the PDF upload → parsing → chunking → database piece of the project.
It's a complete, working slice — you can run it right now.

## What this does

1. Accepts a PDF upload
2. Extracts text page by page (using PyMuPDF)
3. Tags each page with a guessed section name (Abstract, Methods, Results, etc.)
   using a heading-detection heuristic
4. Splits the text into ~300–500 token chunks, each carrying its page number
   and section tag
5. Stores everything in a SQLite database
6. Exposes it all over a REST API for Person B (extraction) and Person C
   (frontend) to consume

## How to run it

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then open **http://localhost:8000/docs** — this is FastAPI's auto-generated
interactive playground. You can upload a real PDF from the browser and see
the JSON responses without writing any client code. Great for testing before
Person C's frontend exists.

## The API (this is the contract your teammates build against)

### `POST /paper/upload`
Upload a PDF file (multipart form, field name `file`). Returns immediately —
parsing/chunking happens in the background so the upload doesn't block.

```json
{
  "paper_id": "af6eb9f4-484c-4672-92a9-08d4351d7495",
  "filename": "test_paper.pdf",
  "status": "uploaded"
}
```

### `GET /paper/{paper_id}/status`
Poll this every ~1 second to drive a "Reading paper... Extracting sections..."
loading screen. `status` moves through:
`uploaded → parsing → chunking → chunked` (or `failed`, check `error_message`).
Once Person B's extraction step exists, they'll extend this to also move
through `extracting → verifying → ready`.

```json
{
  "paper_id": "af6eb9f4-...",
  "filename": "test_paper.pdf",
  "title": "Attention Is All You Need",
  "status": "chunked",
  "page_count": 5,
  "chunk_count": 5,
  "error_message": null,
  "created_at": "2026-07-30T07:01:13.165692"
}
```

### `GET /paper/{paper_id}/chunks`
The page-tagged chunks — **this is Person B's input**. Each chunk is a
self-contained piece of text with enough metadata to cite it later.

```json
{
  "paper_id": "af6eb9f4-...",
  "status": "chunked",
  "chunks": [
    {
      "chunk_id": "c5938ca2-...",
      "chunk_index": 0,
      "page": 1,
      "section": "Abstract",
      "text": "This paper studies how large language models can summarize...",
      "token_count": 65
    }
  ]
}
```

## Database tables (`app/models.py`)

- **Paper** — one row per upload, tracks processing status
- **Chunk** — the page/section-tagged text pieces (this file's main output)
- **Claim** — table is already defined and ready for Person B to write into.
  Shape: `{claim_text, claim_type, page, section, confidence, status, chunk_id}`.
  `chunk_id` is a foreign key back to the exact chunk the claim came from —
  that's what makes the "click a citation, jump to source text" UI possible.

## For Person B (extraction)

Call `GET /paper/{id}/chunks`, loop over `chunks`, run your extraction prompt
per chunk, and insert rows into the `Claim` table using `chunk_id` from the
chunk you extracted from — that FK is what gives you free, exact citations.
I'd suggest adding your own `POST /paper/{id}/extract` and `GET /paper/{id}/claims`
routes in a new `app/routes/claims.py` file (same pattern as `paper.py`) so we
don't step on each other's files in git.

## For Person C (frontend)

You can start building against this today — real responses, not mocks.
CORS is wide open (`allow_origins=["*"]`) so you can call this directly from
`localhost:3000` or wherever your dev server runs. Poll `/status` for the
transparency screen, use `/chunks` to show source text in the side panel
once citations exist.

## Known limitations (be upfront about these in the demo)

- Section detection is a heading-keyword heuristic, not true layout analysis.
  It works well on clean, single-column arXiv PDFs — which is exactly why the
  team scoped the demo to 2–3 pre-tested papers rather than "any PDF."
- Token counts are approximated (word count × 1.3), not a real tokenizer.
  Fine for chunk sizing, not exact.
- SQLite, not Postgres — identical code either way, just change `DATABASE_URL`
  in `app/database.py` if you want to switch before submission.

## Project structure

```
backend/
  app/
    main.py              # FastAPI app, CORS, mounts routes
    database.py           # SQLite connection + session
    models.py              # Paper, Chunk, Claim tables
    schemas.py              # JSON response shapes (the API contract)
    routes/
      paper.py               # upload / status / chunks endpoints
    services/
      pdf_parser.py           # PDF -> pages with section tags
      chunker.py               # pages -> 300-500 token chunks
  requirements.txt
```
