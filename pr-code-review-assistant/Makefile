.PHONY: help build up down logs test lint clean dev-setup

help:
	@echo "PR Code Review Assistant - Available commands:"
	@echo ""
	@echo "  make up              Start all Docker services"
	@echo "  make down            Stop all services"
	@echo "  make logs            View service logs"
	@echo "  make logs-gateway    View gateway logs"
	@echo "  make logs-fetcher    View fetcher logs"
	@echo "  make logs-analyzer   View analyzer logs"
	@echo ""
	@echo "  make test            Run all tests"
	@echo "  make test-unit       Run unit tests only"
	@echo "  make test-integration Run integration tests"
	@echo "  make coverage        Generate coverage report"
	@echo ""
	@echo "  make dev-setup       Setup local dev environment"
	@echo "  make dev-run         Run services locally (no Docker)"
	@echo "  make lint            Check code syntax"
	@echo "  make clean           Remove cache/build files"
	@echo ""

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "✓ Services started. Frontend: npm run dev in frontend/"

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-gateway:
	docker-compose logs -f gateway

logs-fetcher:
	docker-compose logs -f fetcher

logs-analyzer:
	docker-compose logs -f analyzer

test:
	pytest tests/ -v

test-unit:
	pytest tests/test_gateway.py tests/test_fetcher.py tests/test_analyzer.py -v

test-integration:
	pytest tests/test_integration.py -v -m integration

coverage:
	pytest tests/ --cov=services --cov-report=html
	@echo "✓ Coverage report: htmlcov/index.html"

dev-setup:
	python -m venv venv
	. venv/bin/activate && pip install -r services/gateway/requirements.txt
	. venv/bin/activate && pip install -r services/fetcher/requirements.txt
	. venv/bin/activate && pip install -r services/analyzer/requirements.txt
	. venv/bin/activate && pip install -r tests/requirements-test.txt
	@echo "✓ Virtual environment ready. Activate: source venv/bin/activate"

dev-run:
	@echo "Make sure Redis and PostgreSQL are running!"
	@echo "Run in separate terminals:"
	@echo "  uvicorn services.gateway.app.main:app --port 8000 --reload"
	@echo "  uvicorn services.fetcher.app.main:app --port 8001 --reload"
	@echo "  uvicorn services.analyzer.app.main:app --port 8002 --reload"
	@echo "  rq worker -u redis://localhost:6379 analyzer-queue"
	@echo "  cd frontend && npm run dev"

lint:
	python -m py_compile services/gateway/app/*.py
	python -m py_compile services/fetcher/app/*.py
	python -m py_compile services/analyzer/app/*.py
	@echo "✓ Syntax check passed"

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache htmlcov .coverage
	@echo "✓ Cleaned cache"
