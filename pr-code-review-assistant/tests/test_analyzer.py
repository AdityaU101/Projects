import pytest
from services.analyzer.app.worker import _simple_summarize


def test_simple_summarize_secrets():
    diff = """
    +password = "secret123"
    +api_key = "sk_live_xyz"
    """
    result = _simple_summarize(diff)
    assert "Security" in result or "secrets" in result.lower()


def test_simple_summarize_large_change():
    diff = "diff --git\n" * 4 + "+" * 110
    result = _simple_summarize(diff)
    assert "Large change" in result or "files" in result.lower()


def test_simple_summarize_loops():
    diff = """
    +for i in range(1000):
    +    process(i)
    """
    result = _simple_summarize(diff)
    assert "Performance" in result or "loop" in result.lower()


def test_simple_summarize_always_suggests_tests():
    diff = "minor change"
    result = _simple_summarize(diff)
    assert "edge" in result.lower() or "test" in result.lower()
