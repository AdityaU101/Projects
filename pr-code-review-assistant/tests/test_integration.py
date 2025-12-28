import pytest
import time
from unittest.mock import patch, MagicMock


@pytest.mark.integration
def test_full_pipeline():
    mock_diff = """diff --git a/app.py b/app.py
index 1234567..abcdefg 100644
--- a/app.py
+++ b/app.py
@@ -1,3 +1,4 @@
+# New line
 def process():
     pass
"""
    
    with patch('services.fetcher.app.github_client.requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.text = mock_diff
        mock_get.return_value = mock_response
        
        from services.fetcher.app.github_client import fetch_pr_diff
        from services.analyzer.app.worker import _simple_summarize
        
        diff = fetch_pr_diff("https://github.com/test/repo/pull/1")
        analysis = _simple_summarize(diff)
        
        assert len(analysis) > 0
        assert isinstance(analysis, str)
