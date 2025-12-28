import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient

from services.gateway.app.main import app
from services.gateway.app.db import get_session
from services.gateway.app.models import Job


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_job(client: TestClient, session: Session):
    response = client.post(
        "/analyze",
        json={"pr_url": "https://github.com/owner/repo/pull/123"},
    )
    assert response.status_code == 502  # Will fail because fetcher is not running, but job should exist
    
    # Query job from session
    jobs = session.query(Job).all()
    assert len(jobs) > 0
    assert jobs[0].pr_url == "https://github.com/owner/repo/pull/123"
