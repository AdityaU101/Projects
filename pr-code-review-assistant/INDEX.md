# 📋 Documentation Index

Welcome to the PR Code Review Assistant! This guide helps you navigate all the documentation.

## 🚀 Start Here (First 5 Minutes)

**New to this project?** Read in this order:

1. **[QUICK_START.md](QUICK_START.md)** ⚡
   - Get the project running in 5 minutes
   - Three different setup options (Docker, Local, Quick Test)
   - Basic API testing

2. **[README.md](README.md)** 📖
   - Complete architecture overview
   - Full API documentation
   - Troubleshooting guide
   - Future enhancement ideas

3. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** 📊
   - What was created
   - File structure explained
   - Interview talking points

---

## 💻 Development & Deployment

**Want to modify code or deploy?**

- **[DEVELOPMENT.md](DEVELOPMENT.md)** 🛠️
  - Code style & best practices
  - Git workflow
  - Adding new features
  - Error handling patterns
  - Logging & monitoring

- **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀
  - Pre-production checklist
  - AWS/GCP/Kubernetes deployment
  - Database migrations
  - Performance optimization
  - Security hardening
  - Disaster recovery

---

## 📚 Architecture & Design

**Understanding the system:**

### Services
| Service | Documentation |
|---------|---|
| **Gateway** | REST API in `services/gateway/app/main.py` |
| **Fetcher** | GitHub integration in `services/fetcher/app/github_client.py` |
| **Analyzer** | Analysis logic in `services/analyzer/app/worker.py` |
| **Frontend** | React UI in `frontend/src/App.jsx` |

### Technology Stack
- **Backend**: FastAPI + SQLModel + PostgreSQL
- **Queue**: Redis + RQ
- **Frontend**: React + Vite
- **Deployment**: Docker + Docker Compose
- **Testing**: pytest

---

## 🧪 Testing

**Running Tests:**
```bash
# Quick test
python test_local.py

# All tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=services --cov-report=html
```

**Test Files:**
- `tests/test_gateway.py` - REST API tests
- `tests/test_fetcher.py` - GitHub integration tests
- `tests/test_analyzer.py` - Analysis logic tests
- `tests/test_integration.py` - End-to-end tests

---

## 🔧 Common Tasks

### Start Development
```bash
cd pr-code-review-assistant
docker-compose up --build
# In another terminal:
cd frontend && npm install && npm run dev
```

### Add a New Feature
1. Create branch: `git checkout -b feature/my-feature`
2. Code & test: `pytest tests/`
3. Format: `black services/`
4. Commit: `git commit -m "[feature] Description"`
5. Push & PR: `git push origin feature/my-feature`

### Deploy to Production
1. Update `DEPLOYMENT.md` checklist
2. Run security audit
3. Load test with expected traffic
4. Set up monitoring (Prometheus, Sentry)
5. Deploy to AWS/GCP/Kubernetes
6. Monitor metrics & logs

### Add LLM Integration
See `services/analyzer/app/worker.py` - replace `_simple_summarize()` with OpenAI call:
```python
def _simple_summarize(diff: str) -> str:
    # TODO: Replace with LLM call
    import openai
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Review this PR diff: {diff}"}]
    )
    return response.choices[0].message.content
```

---

## 📖 API Reference

### Gateway Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/analyze` | Submit PR for analysis |
| GET | `/status/{job_id}` | Check job status |
| GET | `/health` | Health check |

### Example Usage
```bash
# Submit PR
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"pr_url": "https://github.com/owner/repo/pull/123"}'

# Check status
curl http://localhost:8000/status/1
```

---

## 🎓 Interview Preparation

**This project demonstrates:**

✅ Microservices architecture with clear service boundaries
✅ Async job processing with RQ queue
✅ REST API design with FastAPI
✅ Database design with SQLModel ORM
✅ Docker containerization & Docker Compose
✅ Comprehensive test coverage
✅ React frontend with API polling
✅ Error handling & logging
✅ Git workflow & code review process
✅ Performance optimization & caching
✅ Security best practices
✅ Deployment strategies

**Key Talking Points:**
- "This architecture allows services to scale independently"
- "RQ decouples the fetcher from analyzer, preventing blocking"
- "Type hints with SQLModel provide compile-time safety"
- "Docker Compose enables reproducible local development"
- "Comprehensive tests ensure refactoring safety"

---

## 📁 File Structure

```
pr-code-review-assistant/
├── QUICK_START.md           ← Start here!
├── README.md                ← Full documentation
├── PROJECT_SUMMARY.md       ← What was created
├── DEVELOPMENT.md           ← Coding guidelines
├── DEPLOYMENT.md            ← Production guide
├── INDEX.md                 ← You are here
│
├── services/
│   ├── gateway/             ← REST API service
│   ├── fetcher/             ← GitHub integration
│   └── analyzer/            ← Analysis worker
│
├── frontend/                ← React UI
├── tests/                   ← Test suite
│
├── docker-compose.yml       ← Local dev setup
├── Makefile                 ← Common commands
└── .env                     ← Environment config
```

---

## 🆘 Common Issues & Solutions

### Services won't start
- Check Docker: `docker ps`
- View logs: `docker-compose logs gateway`
- Verify ports: `netstat -tuln | grep 8000`

### Tests failing
- Install deps: `pip install -r tests/requirements-test.txt`
- Check Python version: `python --version` (need 3.11+)
- Run verbose: `pytest tests/ -v -s`

### Can't connect to GitHub
- Verify token: `echo $GITHUB_TOKEN`
- Token has `repo` scope?
- Get new token: https://github.com/settings/tokens

### Database errors
- Check Postgres: `psql postgresql://user:pass@localhost:5432/prbot`
- Verify `.env` credentials
- Reset: `docker-compose down -v && docker-compose up`

---

## 📊 Useful Commands

```bash
# Make shortcuts
make help           # Show all commands
make up             # Start services
make test           # Run tests
make coverage       # Generate coverage
make lint           # Check syntax
make clean          # Remove cache

# Docker commands
docker-compose up                   # Start all
docker-compose logs -f gateway      # View logs
docker-compose down                 # Stop all

# Testing
pytest tests/ -v                    # All tests
pytest tests/test_gateway.py -v     # Specific test
pytest tests/ --cov=services        # With coverage

# Development
cd frontend && npm run dev          # Frontend dev server
rq worker -u redis://localhost:6379 analyzer-queue  # Worker

# Git
git status                          # Current status
git log --oneline                   # Commit history
git diff                            # See changes
```

---

## 🔗 External Resources

### Documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLModel](https://sqlmodel.tiangolo.com/)
- [Redis RQ](https://python-rq.org/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)

### Learning Resources
- [REST API Best Practices](https://restfulapi.net/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Python Best Practices](https://peps.python.org/pep-0008/)
- [Git Workflow](https://git-scm.com/docs/gittutorial)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - Database management
- [Redis Insight](https://redis.com/redis-enterprise/redis-insight/) - Queue monitoring

---

## 📞 Getting Help

**Questions about...**

| Topic | File |
|-------|------|
| Getting started | QUICK_START.md |
| Architecture | README.md |
| Code style | DEVELOPMENT.md |
| Deployment | DEPLOYMENT.md |
| File structure | PROJECT_SUMMARY.md |
| API reference | README.md (Section: API Endpoints) |

---

## ✅ Next Steps

1. **[QUICK_START.md](QUICK_START.md)** - Get running
2. **[README.md](README.md)** - Understand architecture
3. **Explore code** - `services/gateway/app/main.py`
4. **Run tests** - `pytest tests/ -v`
5. **Make changes** - `git checkout -b feature/my-change`
6. **Deploy** - Follow `DEPLOYMENT.md`

---

**Happy coding! 🚀**

*Last Updated: December 27, 2025*
