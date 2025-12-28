# Quick Start Guide

## 🚀 Fastest Way to Run Everything

### Option 1: Docker (Recommended for testing)

```bash
# 1. Navigate to project root
cd pr-code-review-assistant

# 2. Set up environment
cp .env.example .env
# Edit .env and add your GitHub Personal Access Token
# Get one from: https://github.com/settings/tokens (scope: repo)

# 3. Start all services
docker-compose up --build

# 4. In another terminal, start frontend
cd frontend
npm install
npm run dev

# 5. Open http://localhost:3000 in browser
```

### Option 2: Local Python (Faster iteration)

**Requirements:** Python 3.11+, Node.js 16+, Redis, PostgreSQL

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r services/gateway/requirements.txt
pip install -r services/fetcher/requirements.txt
pip install -r services/analyzer/requirements.txt
pip install python-dotenv

# 3. Start Redis and PostgreSQL (or use Docker just for these)
docker run -d -p 6379:6379 redis:7
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=prbot postgres:15

# 4. Start services (each in a new terminal)
uvicorn services.gateway.app.main:app --port 8000 --reload
uvicorn services.fetcher.app.main:app --port 8001 --reload
uvicorn services.analyzer.app.main:app --port 8002 --reload

# 5. Start worker (in another terminal)
rq worker -u redis://localhost:6379 analyzer-queue

# 6. Start frontend
cd frontend
npm install
npm run dev

# 7. Open http://localhost:3000
```

### Option 3: Quick Local Test (No services needed)

```bash
python test_local.py
```

## 📝 What Each Service Does

| Service | Port | Role |
|---------|------|------|
| **Gateway** | 8000 | REST API for submitting PRs & checking status |
| **Fetcher** | 8001 | Downloads PR diffs from GitHub |
| **Analyzer** | 8002 | Workers that analyze diffs and generate suggestions |
| **Redis** | 6379 | Job queue and caching |
| **PostgreSQL** | 5432 | Stores job metadata and results |
| **Frontend** | 3000 | React UI |

## ✅ Testing the API

### Submit a PR for analysis:
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"pr_url": "https://github.com/owner/repo/pull/123"}'
```

Response: `{"job_id": 1}`

### Check job status:
```bash
curl http://localhost:8000/status/1
```

Response: `{"job_id": 1, "status": "done", "result": "...suggestions..."}`

## 🧪 Running Tests

```bash
# Unit tests
pytest tests/test_gateway.py -v
pytest tests/test_fetcher.py -v
pytest tests/test_analyzer.py -v

# All tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=services --cov-report=html
open htmlcov/index.html
```

## 🐛 Troubleshooting

### Services won't start
- Check Docker Desktop is running: `docker ps`
- Ports in use? Change in `docker-compose.yml`

### Can't reach GitHub API
- Verify token in `.env`: `echo $GITHUB_TOKEN`
- Token has `repo` scope? Get new at https://github.com/settings/tokens

### PostgreSQL connection errors
- Is Postgres running? `docker ps | grep postgres`
- Credentials match `.env`? Default: user=user, pass=pass, db=prbot

### Redis connection errors
- Is Redis running? `redis-cli ping`
- Should return: `PONG`

## 📚 Next Steps

1. **Read the README.md** for full architecture and API docs
2. **Explore the code:**
   - `services/gateway/app/main.py` - REST API logic
   - `services/fetcher/app/github_client.py` - GitHub integration
   - `services/analyzer/app/worker.py` - Analysis heuristics
3. **Enhance the analyzer:**
   - Replace heuristics with LLM calls (OpenAI, Anthropic)
   - Add more specific test suggestions
   - Detect security vulnerabilities
4. **Add features:**
   - GitHub webhook support (auto-analyze new PRs)
   - JWT authentication
   - Rate limiting
   - Observability (Prometheus, Sentry)

## 🎤 Interview Talking Points

This project demonstrates:

✅ **Microservices Architecture** - Loosely coupled services with clear separation of concerns
✅ **Async Job Processing** - RQ for handling long-running analysis tasks
✅ **REST API Design** - Proper HTTP semantics and error handling
✅ **Database Design** - SQLModel ORM with PostgreSQL
✅ **Testing Strategy** - Unit, integration, and end-to-end tests
✅ **Containerization** - Docker for reproducible environments
✅ **Error Handling** - Graceful degradation and retry logic
✅ **Scalability** - How to add workers, replicate services, cache results

When asked in an interview: *"This microservices setup allows each service to scale independently. If we need more analysis capacity, we spin up more worker containers. The Redis queue decouples the fetcher from the analyzer, so slow analyses don't block new submissions. We could add caching for frequently analyzed PRs, implement webhooks to auto-trigger on GitHub events, or integrate with LLMs for smarter analysis."*

---

**Questions?** Check the README.md or explore the code! 🚀
