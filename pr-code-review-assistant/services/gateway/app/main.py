from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
from rq import Queue
from redis import Redis
from .db import init_db, engine
from .models import Job
from sqlmodel import Session

try:
    import fakeredis
    USE_FAKE_REDIS = True
except ImportError:
    USE_FAKE_REDIS = False

init_db()

app = FastAPI(title="gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

if USE_FAKE_REDIS:
    redis_conn = fakeredis.FakeRedis(decode_responses=True)
    print("📍 Using FakeRedis (local development mode)")
else:
    redis_conn = Redis.from_url(redis_url, decode_responses=True)
    print(f"📍 Using Redis at {redis_url}")

q = Queue("analyzer-queue", connection=redis_conn)

FETCHER_URL = os.getenv("FETCHER_URL", "http://localhost:8001")

class SubmitRequest(BaseModel):
    pr_url: str

@app.post("/analyze")
async def analyze(req: SubmitRequest):
    with Session(engine) as session:
        job = Job(pr_url=req.pr_url, status="pending")
        session.add(job)
        session.commit()
        session.refresh(job)
        job_id = job.id

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{FETCHER_URL}/fetch",
                json={"job_id": job_id, "pr_url": req.pr_url}
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="fetcher failed")
    except Exception as e:
        with Session(engine) as session:
            job = session.get(Job, job_id)
            if job:
                job.status = "failed"
                session.add(job)
                session.commit()
        raise HTTPException(status_code=502, detail=f"Error calling fetcher: {str(e)}")
    
    return {"job_id": job_id}

@app.get("/status/{job_id}")
def status(job_id: int):
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="not found")
        return {"job_id": job.id, "status": job.status, "result": job.result}

@app.get("/health")
def health():
    return {"status": "ok"}
