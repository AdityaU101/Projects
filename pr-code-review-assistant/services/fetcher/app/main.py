from fastapi import FastAPI
from pydantic import BaseModel
import os
import requests
from .github_client import fetch_pr_diff
from redis import Redis
from rq import Queue

try:
    import fakeredis
    USE_FAKE_REDIS = True
except ImportError:
    USE_FAKE_REDIS = False

app = FastAPI(title="fetcher")

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
USE_DUMMY_DATA = os.getenv("USE_DUMMY_DATA", "true").lower() == "true"

if USE_FAKE_REDIS:
    redis_conn = fakeredis.FakeRedis(decode_responses=True)
    print("📍 Using FakeRedis (local development mode)")
else:
    redis_conn = Redis.from_url(redis_url, decode_responses=True)
    print(f"📍 Using Redis at {redis_url}")

q = Queue("analyzer-queue", connection=redis_conn)

class FetchRequest(BaseModel):
    job_id: int
    pr_url: str

@app.post("/fetch")
def fetch(req: FetchRequest):
    try:
        diff = fetch_pr_diff(req.pr_url)
    except Exception as e:
        return {"ok": False, "error": str(e)}
    
    if USE_DUMMY_DATA:
        try:
            requests.post(
                "http://localhost:8002/analyze",
                json={"job_id": req.job_id, "pr_url": req.pr_url, "diff": diff},
                timeout=30
            )
        except Exception as e:
            print(f"Error calling analyzer: {e}")
        return {"ok": True}
    
    try:
        q.enqueue(
            "analyzer.worker.process_diff",
            req.job_id,
            req.pr_url,
            diff,
            job_timeout=600
        )
    except Exception as e:
        return {"ok": False, "error": f"Queue error: {str(e)}"}
    
    return {"ok": True}

@app.get("/health")
def health():
    return {"status": "ok"}
