from sqlmodel import create_engine, Session
from sqlalchemy import text
import os
import re

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
engine = create_engine(DATABASE_URL, echo=False)

def _simple_summarize(diff: str) -> str:
    files_changed = len(re.findall(r"^diff --git", diff, flags=re.MULTILINE))
    added_lines = sum(1 for l in diff.splitlines() if l.startswith('+') and not l.startswith('+++'))
    removed_lines = sum(1 for l in diff.splitlines() if l.startswith('-') and not l.startswith('---'))
    
    suggestions = []
    
    if "password" in diff.lower() or "secret" in diff.lower():
        suggestions.append("⚠️ Security: Check for secrets or hardcoded credentials.")
    
    if files_changed > 3 or added_lines > 100:
        suggestions.append(f"📊 Large change ({files_changed} files, {added_lines} lines added): Consider smaller PRs or add tests.")
    
    suggestions.append("✅ Test edge cases: empty input, None, negative values (common regressions).")
    
    if "for " in diff or "while " in diff:
        suggestions.append("⚡ Performance: Review loops for potential optimizations or nested complexity.")
    
    return "\n".join(suggestions)

def process_diff(job_id: int, pr_url: str, diff: str):
    try:
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE job SET status = :status WHERE id = :id"),
                {"status": "analyzing", "id": job_id}
            )
        
        result = _simple_summarize(diff)
        
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE job SET status = :status, result = :result WHERE id = :id"),
                {"status": "done", "result": result, "id": job_id}
            )
    except Exception as e:
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE job SET status = :status, result = :result WHERE id = :id"),
                {"status": "failed", "result": f"Error: {str(e)}", "id": job_id}
            )
        raise
    
    return True
