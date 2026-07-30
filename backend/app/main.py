"""
App entrypoint. Run with:  uvicorn app.main:app --reload --port 8000
Then open http://localhost:8000/docs for the interactive API playground
(FastAPI auto-generates this — try uploading a PDF right from the browser).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import paper, extract

# Create all tables on startup if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LearnIQ Paper Briefing API")

# Allow the frontend (running on a different port, e.g. localhost:3000)
# to call this API from the browser. Wide open for hackathon purposes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(paper.router)
app.include_router(extract.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "LearnIQ Paper Briefing API"}