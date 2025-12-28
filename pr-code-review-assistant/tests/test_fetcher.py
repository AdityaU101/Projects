import pytest
from unittest.mock import patch, MagicMock


def test_fetch_pr_diff_parsing():
    from services.fetcher.app.github_client import fetch_pr_diff
    
    with patch('services.fetcher.app.github_client.requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.text = "diff --git a/file.py b/file.py\n+new line"
        mock_get.return_value = mock_response
        
        diff = fetch_pr_diff("https://github.com/owner/repo/pull/123")
        assert "diff --git" in diff
        assert "new line" in diff
        
        # Verify URL construction
        call_args = mock_get.call_args
        assert "api.github.com" in call_args[0][0]
        assert "owner/repo" in call_args[0][0]
        assert "123" in call_args[0][0]


def test_fetch_pr_diff_no_token():
    from services.fetcher.app.github_client import fetch_pr_diff
    
    with patch.dict('os.environ', {'GITHUB_TOKEN': ''}):
        with pytest.raises(ValueError, match="GITHUB_TOKEN"):
            fetch_pr_diff("https://github.com/owner/repo/pull/123")
