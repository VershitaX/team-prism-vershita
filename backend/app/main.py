from fastapi import FastAPI
from app.routes import extract

app = FastAPI(title="Paper Briefing Agent - AI Testing")

app.include_router(extract.router)


@app.get("/")
def root():
    return {"status": "AI extraction service running"}