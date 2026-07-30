"""
App entrypoint. Run with:  uvicorn app.main:app --reload --port 8000
Then open http://localhost:8000/docs for the interactive API playground
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import extract

app = FastAPI(title="Paper Briefing Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Person A's DB + upload router — wired in only if it's ready.
# This way the AI extraction endpoints keep working even while
# the database piece is still being finished.
try:
    from app.database import Base, engine
    from app.routes import paper

    Base.metadata.create_all(bind=engine)
    app.include_router(paper.router)
    db_status = "connected"
except Exception as e:
    print(f"[startup] Skipping DB/paper router — not ready yet: {e}")
    db_status = "not connected"

app.include_router(extract.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Paper Briefing Agent", "database": db_status}