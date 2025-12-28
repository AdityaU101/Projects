# PR Code Review Assistant

A pragmatic microservices architecture for automated PR code review using FastAPI, Redis, and PostgreSQL.

## Architecture

```
┌─────────┐
│ Frontend │ (React)
│ :3000   │
└────┬────┘
     │
┌────▼─────────────────┐
│   Gateway (8000)     │ ◄─── Manages jobs, calls Fetcher
│   FastAPI + DB       │
└────┬─────────────────┘
     │
     ├──────────────────────┬──────────────────────┐
     │                      │                      │
┌────▼──────────┐  ┌────────▼────────┐  ┌─────────▼──────┐
│ Fetcher       │  │  Analyzer       │  │  Worker Queue  │
│ (8001)        │  │  (8002)         │  │  (RQ)          │
│ Fetch PR diff │  │  Health check   │  │ Processes jobs │
└────┬──────────┘  └────┬────────────┘  └─────────┬──────┘
     │                  │                        │
     ├──────────────────┼────────────────────────┤
     │                  │                        │
┌────▼──────────────────▼────────────┐          │
│         Redis (6379)               │◄─────────┘
│         Job queue                  │
└───────────────────────────────────┘

┌──────────────────────────────────┐
│   PostgreSQL (5432)              │
│   Stores job status & results    │
└──────────────────────────────────┘
```

### Services

- **Gateway**: REST API for submitting PR URLs and checking job status
- **Fetcher**: Pulls PR diffs from GitHub API
- **Analyzer**: Worker that analyzes diffs and generates suggestions
- **Redis**: Job queue (RQ) and caching
- **PostgreSQL**: Persistent job storage

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 16+ (for frontend dev)
- GitHub Personal Access Token (get from [https://github.com/settings/tokens](https://github.com/settings/tokens))

### 1. Setup Environment

```bash
# Copy example env and fill in tokens
cp .env.example .env

# Edit .env and add your GitHub token
# GITHUB_TOKEN=ghp_xxxxx
```

### 2. Start Services (Docker)

```bash
docker-compose up --build
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Gateway API (port 8000)
- Fetcher API (port 8001)
- Analyzer API (port 8002)
- RQ Worker (processes analysis jobs)

### 3. Start Frontend (Local Dev)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test the Full Pipeline

**Via Web UI:**
1. Enter PR URL: `https://github.com/owner/repo/pull/123`
2. Click "Analyze"
3. Wait for results

**Via curl:**
```bash
# Submit PR for analysis
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"pr_url": "https://github.com/owner/repo/pull/123"}'

# Check status
curl http://localhost:8000/status/1
```

## API Endpoints

### Gateway

- `POST /analyze` - Submit PR for analysis
  ```json
  {"pr_url": "https://github.com/owner/repo/pull/123"}
  ```
  Returns: `{"job_id": 1}`

- `GET /status/{job_id}` - Check job status
  Returns: `{"job_id": 1, "status": "done", "result": "...suggestions..."}`

- `GET /health` - Health check

### Fetcher

- `GET /health` - Health check
- `POST /fetch` (internal) - Fetch diff and enqueue

### Analyzer

- `GET /health` - Health check

## Running Tests

```bash
# Unit tests
pip install -r tests/requirements-test.txt
pytest tests/test_*.py -v

# Integration tests
pytest tests/test_integration.py -v -m integration

# With coverage
pytest tests/ --cov=services --cov-report=html
```

## Project Structure

```
pr-code-review-assistant/
├── services/
│   ├── gateway/           # REST API & job management
│   │   ├── app/
│   │   │   ├── main.py    # FastAPI routes
│   │   │   ├── models.py  # SQLModel Job schema
│   │   │   └── db.py      # Database setup
│   │   └── requirements.txt
│   ├── fetcher/           # GitHub PR diff fetcher
│   │   ├── app/
│   │   │   ├── main.py    # FastAPI routes
│   │   │   └── github_client.py
│   │   └── requirements.txt
│   └── analyzer/          # Analysis worker
│       ├── app/
│       │   ├── main.py    # FastAPI health check
│       │   └── worker.py  # RQ job processor
│       └── requirements.txt
├── frontend/              # React UI
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── tests/                 # Unit & integration tests
├── docker-compose.yml     # Local dev environment
└── README.md
```

## Development

### Local Setup (No Docker)

For faster iteration:

```bash
# Create venv
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install all deps
pip install -r services/gateway/requirements.txt
pip install -r services/fetcher/requirements.txt
pip install -r services/analyzer/requirements.txt

# Run each service in separate terminals
uvicorn services.gateway.app.main:app --port 8000 --reload
uvicorn services.fetcher.app.main:app --port 8001 --reload
uvicorn services.analyzer.app.main:app --port 8002 --reload

# In another terminal, start worker
rq worker -u redis://localhost:6379 analyzer-queue

# Frontend
cd frontend && npm run dev
```

### Common Issues

**"Connection refused" errors:**
- Ensure Docker containers are running: `docker-compose ps`
- Check Redis: `redis-cli ping`
- Check PostgreSQL: `psql postgresql://user:pass@localhost:5432/prbot`

**"GITHUB_TOKEN not set" error:**
- Ensure `.env` file exists with valid token
- Reload containers: `docker-compose restart`

**Frontend can't reach API:**
- Check Gateway is running: `curl http://localhost:8000/health`
- Verify CORS is enabled (it is by default)

## Future Enhancements

- **LLM Integration**: Replace heuristics with OpenAI/Anthropic calls in `analyzer/worker.py`
- **Auth**: JWT tokens for per-user job scoping
- **Observability**: Prometheus metrics, Grafana dashboard, Sentry error tracking
- **Webhooks**: Listen to GitHub PR events and auto-analyze new PRs
- **Test Generation**: Automatically suggest specific test cases for changed code
- **S3 Storage**: Store large diffs in object storage instead of DB
- **Contract Tests**: Use Pact for gateway↔fetcher API contracts
- **Rate Limiting**: Throttle per GitHub user or IP
- **Caching**: Cache GitHub diffs to avoid re-fetching

## Interview Talking Points

✅ **Microservices**: Loosely coupled services with clear responsibilities
✅ **Async Processing**: RQ job queue for long-running tasks (diff analysis)
✅ **REST API Design**: Proper HTTP semantics, status codes, error handling
✅ **Database Design**: SQLModel ORM, migrations, indexing strategies
✅ **Testing**: Unit tests, integration tests, mocking external APIs
✅ **Docker**: Containerization, orchestration, local dev reproducibility
✅ **Error Handling**: Graceful degradation, retry logic, circuit breakers
✅ **Scalability**: How to add more workers, replicate services, cache results
✅ **Security**: Environment variables for secrets, input validation, rate limiting

## License

MIT
