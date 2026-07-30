"""
The actual HTTP endpoints. This is what Person C's frontend calls.

  POST /paper/upload          -> upload a PDF, get back a paper_id immediately
  GET  /paper/{id}/status     -> poll this to drive the "processing" screen
  GET  /paper/{id}/chunks     -> the page-tagged chunks (Person B's input)
"""
import os
import shutil

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Paper, Chunk, ProcessingStatus
from app.schemas import PaperUploadOut, PaperStatusOut, PaperChunksOut, ChunkOut
from app.services.pdf_parser import extract_pages, guess_title
from app.services.chunker import chunk_pages

router = APIRouter(prefix="/paper", tags=["paper"])

UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=PaperUploadOut)
def upload_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    paper = Paper(filename=file.filename, status=ProcessingStatus.uploaded)
    db.add(paper)
    db.commit()
    db.refresh(paper)

    # Save the raw file to disk, named by paper_id so it can't collide
    save_path = os.path.join(UPLOAD_DIR, f"{paper.id}.pdf")
    with open(save_path, "wb") as out_file:
        shutil.copyfileobj(file.file, out_file)

    # Do the actual parsing/chunking AFTER responding, so the upload
    # request returns instantly and the frontend can show its
    # "Reading paper... Extracting sections..." loading screen while
    # polling GET /paper/{id}/status.
    background_tasks.add_task(process_paper, paper.id, save_path)

    return PaperUploadOut(paper_id=paper.id, filename=paper.filename, status=paper.status.value)


def process_paper(paper_id: str, pdf_path: str):
    """Runs in the background: extract text -> chunk it -> save to DB."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            return

        paper.status = ProcessingStatus.parsing
        db.commit()

        pages = extract_pages(pdf_path)
        paper.page_count = len(pages)
        paper.title = guess_title(pdf_path)
        db.commit()

        paper.status = ProcessingStatus.chunking
        db.commit()

        chunk_dicts = chunk_pages(pages)
        for c in chunk_dicts:
            db.add(Chunk(
                paper_id=paper.id,
                chunk_index=c["chunk_index"],
                page=c["page"],
                section=c["section"],
                text=c["text"],
                token_count=c["token_count"],
            ))

        # chunked = fully ready for Person B to pick up and run extraction on
        paper.status = ProcessingStatus.chunked
        db.commit()

    except Exception as e:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if paper:
            paper.status = ProcessingStatus.failed
            paper.error_message = str(e)
            db.commit()
    finally:
        db.close()


@router.get("/{paper_id}/status", response_model=PaperStatusOut)
def get_status(paper_id: str, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    chunk_count = db.query(Chunk).filter(Chunk.paper_id == paper_id).count()

    return PaperStatusOut(
        paper_id=paper.id,
        filename=paper.filename,
        title=paper.title,
        status=paper.status.value,
        page_count=paper.page_count,
        chunk_count=chunk_count,
        error_message=paper.error_message,
        created_at=paper.created_at,
    )


@router.get("/{paper_id}/chunks", response_model=PaperChunksOut)
def get_chunks(paper_id: str, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    chunks = (
        db.query(Chunk)
        .filter(Chunk.paper_id == paper_id)
        .order_by(Chunk.chunk_index)
        .all()
    )

    return PaperChunksOut(
        paper_id=paper.id,
        status=paper.status.value,
        chunks=[
            ChunkOut(
                chunk_id=c.id,
                chunk_index=c.chunk_index,
                page=c.page,
                section=c.section,
                text=c.text,
                token_count=c.token_count,
            )
            for c in chunks
        ],
    )
