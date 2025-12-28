from fastapi import FastAPI
from pydantic import BaseModel
from sqlmodel import Session, create_engine
from sqlalchemy import text
import os
from .worker import _simple_summarize

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
engine = create_engine(DATABASE_URL, echo=False)

app = FastAPI(title="analyzer")

class AnalyzeRequest(BaseModel):
    job_id: int
    pr_url: str
    diff: str

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE job SET status = :status WHERE id = :id"),
                {"status": "analyzing", "id": req.job_id}
            )
        
        result = _simple_summarize(req.diff)
        
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE job SET status = :status, result = :result WHERE id = :id"),
                {"status": "done", "result": result, "id": req.job_id}
            )
    except Exception as e:
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE job SET status = :status, result = :result WHERE id = :id"),
                {"status": "failed", "result": f"Error: {str(e)}", "id": req.job_id}
            )
        return {"ok": False, "error": str(e)}
    
    return {"ok": True, "result": result}

@app.get("/health")
def health():
    return {"status": "ok"}
