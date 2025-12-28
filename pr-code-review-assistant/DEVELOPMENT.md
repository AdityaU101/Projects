# Development Guidelines

## Code Style & Best Practices

### Python Code Style
- Follow PEP 8: `pip install black && black .`
- Type hints on all functions
- Docstrings for modules, classes, functions
- Max line length: 100 characters

Example:
```python
def fetch_pr_diff(pr_url: str) -> str:
    """Fetch PR diff from GitHub API.
    
    Args:
        pr_url: GitHub PR URL like https://github.com/owner/repo/pull/123
    
    Returns:
        Raw diff content from GitHub API
    
    Raises:
        ValueError: If GITHUB_TOKEN not set
        requests.HTTPError: If GitHub API returns error
    """
```

### JavaScript/React Code Style
- Use ESLint (configure in frontend/)
- Functional components with hooks
- Props validation
- Clear component naming

```javascript
// ✅ Good
function AnalysisResults({ jobId, status, result }) {
  return (
    <div className="results">
      {result && <pre>{result}</pre>}
    </div>
  );
}

// ❌ Avoid
const AR = ({ j, s, r }) => (
  <div>{r}</div>
);
```

---

## Git Workflow

### Branch Naming
```
feature/feature-name          # New features
bugfix/bug-description        # Bug fixes
docs/documentation-update     # Documentation
refactor/refactoring-task     # Code cleanup
test/test-coverage            # Test improvements
```

### Commit Messages
```
[TYPE] Short description (50 chars max)

Longer explanation if needed (wrap at 72 chars)
- Explain the why, not the what
- Reference issues: Fixes #123
- Link PRs: Related to #456
```

Examples:
```
[feature] Add GitHub webhook support
[bugfix] Fix database connection pool leak
[docs] Add deployment guide
[test] Increase analyzer test coverage to 90%
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Related Issues
Closes #123

## Changes
- [ ] Added feature X
- [ ] Fixed bug Y
- [ ] Updated docs

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Deployment Notes
Any special deployment steps or migrations needed?
```

---

## Adding New Features

### 1. Feature Planning
```markdown
# Feature: LLM Integration for Analysis

## Goal
Replace heuristics with OpenAI API for smarter suggestions

## Scope
- [ ] Update analyzer/app/worker.py
- [ ] Add OPENAI_API_KEY to .env
- [ ] Update tests
- [ ] Document in README

## Timeline
- Estimated: 4 hours
- Depends on: OpenAI account setup
```

### 2. Development Process
```bash
# Create branch
git checkout -b feature/llm-integration

# Make changes and test
pytest tests/test_analyzer.py -v

# Format code
black services/analyzer/

# Commit regularly
git add services/analyzer/
git commit -m "[feature] Add OpenAI integration"

# Push and create PR
git push origin feature/llm-integration
```

### 3. Testing Requirements
- All new functions have unit tests
- Integration tests for service workflows
- Manual testing via UI or API
- Coverage report: `pytest --cov`

---

## Error Handling

### API Errors
```python
from fastapi import HTTPException

@app.post("/analyze")
async def analyze(req: SubmitRequest):
    try:
        # Validate input
        if not req.pr_url.startswith("https://github.com"):
            raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
        # Call service
        diff = await fetch_pr_diff(req.pr_url)
        
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="GitHub API timeout")
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Worker Errors
```python
def process_diff(job_id: int, pr_url: str, diff: str):
    try:
        result = _simple_summarize(diff)
        update_job(job_id, "done", result)
    except Exception as e:
        logger.exception(f"Worker failed for job {job_id}")
        update_job(job_id, "failed", str(e))
        # Re-raise to mark job as failed in RQ
        raise
```

### Database Errors
```python
from sqlalchemy.exc import IntegrityError

try:
    session.add(job)
    session.commit()
except IntegrityError as e:
    session.rollback()
    logger.error(f"Database error: {e}")
    raise HTTPException(status_code=409, detail="Job already exists")
```

---

## Logging Best Practices

### Setup Logging
```python
import logging
logger = logging.getLogger(__name__)

# INFO: Important business events
logger.info(f"Job {job_id} submitted by {user}")

# WARNING: Recoverable errors
logger.warning(f"GitHub API rate limit approaching: {remaining} calls left")

# ERROR: Service errors
logger.error(f"Failed to fetch PR: {str(e)}")

# DEBUG: Development info
logger.debug(f"Diff size: {len(diff)} bytes")
```

### Log Aggregation
For production, pipe logs to:
- CloudWatch (AWS)
- Stackdriver (GCP)
- Datadog / New Relic
- ELK Stack

```bash
# In docker-compose.yml
logging:
  driver: "awslogs"
  options:
    awslogs-group: "/ecs/pr-gateway"
    awslogs-region: "us-east-1"
```

---

## Performance Optimization

### Database Queries
```python
# ❌ Slow - N+1 query problem
jobs = session.query(Job).all()
for job in jobs:
    print(job.status)  # Another query per job!

# ✅ Fast - Single query with join
jobs = session.query(Job).options(joinedload(Job.results)).all()
```

### Caching
```python
from functools import lru_cache
import redis

# Local cache for small data
@lru_cache(maxsize=128)
def parse_github_url(url: str):
    return url.split("/")

# Redis cache for shared data
redis_client = redis.Redis()
def get_pr_diff(pr_id):
    cached = redis_client.get(f"diff:{pr_id}")
    if cached:
        return json.loads(cached)
    diff = fetch_from_github(pr_id)
    redis_client.setex(f"diff:{pr_id}", 3600, json.dumps(diff))
    return diff
```

### Async Operations
```python
# ❌ Blocking
response = requests.get(url)

# ✅ Non-blocking
async with httpx.AsyncClient() as client:
    response = await client.get(url)
```

---

## Security Checklist

- [ ] No secrets in code (use `.env`)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use ORM)
- [ ] CSRF protection
- [ ] Rate limiting enabled
- [ ] HTTPS in production
- [ ] Dependencies up to date
- [ ] Security headers set

```python
# Add security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

---

## Documentation Standards

### Docstring Format
```python
def analyze_diff(diff: str) -> str:
    """Analyze a PR diff and generate suggestions.
    
    This function uses heuristics to detect common issues like:
    - Hardcoded secrets
    - Large changes without tests
    - Performance concerns
    
    Args:
        diff: Raw diff output from git/GitHub API
    
    Returns:
        String with newline-separated suggestions
    
    Raises:
        ValueError: If diff is empty or invalid
    
    Example:
        >>> diff = "diff --git\\n+password"
        >>> analyze_diff(diff)
        "Security: Check for secrets..."
    """
```

### README Format
- Problem statement
- Architecture diagram
- Quick start (copy-paste)
- API documentation
- Development guide
- Deployment steps
- Contributing guidelines

### Code Comments
```python
# ❌ Bad - Restates code
i = i + 1  # Increment i

# ✅ Good - Explains why
i = i + 1  # Start from 1 to account for header row

# ✅ Better - Complex logic
# Calculate exponential backoff: 2^attempt * base_delay (ms)
# Max 5 retries with 100ms base = up to 3.2 seconds total
delay = (2 ** attempt) * 100
```

---

## Monitoring & Alerts

### Key Metrics
```python
# Track in Prometheus
JOBS_SUBMITTED = Counter('jobs_submitted_total')
JOBS_FAILED = Counter('jobs_failed_total')
ANALYSIS_DURATION = Histogram('analysis_duration_seconds')
QUEUE_SIZE = Gauge('queue_size_jobs')

# Usage
JOBS_SUBMITTED.inc()
with ANALYSIS_DURATION.time():
    result = analyze(diff)
```

### Alert Thresholds
- **Queue size > 1000** - Scale up workers
- **Error rate > 5%** - Investigate failure cause
- **Response time > 2s** - Check database/API
- **Memory usage > 80%** - Review for leaks
- **GitHub API rate limited** - Implement backoff

---

## Continuous Improvement

### Code Review Checklist
- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] No hardcoded values
- [ ] Error handling present
- [ ] Logging for debugging
- [ ] Documentation updated
- [ ] Performance acceptable
- [ ] Security concerns addressed

### Weekly Tasks
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Update dependencies
- [ ] Profile slow queries
- [ ] Clean up dead code

### Monthly Tasks
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation review
- [ ] Database optimization
- [ ] Capacity planning

---

## Resources

- **Python**: https://peps.python.org/pep-0008/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Docker**: https://docs.docker.com/
- **Git**: https://git-scm.com/doc

---

**Last Updated:** December 27, 2025
