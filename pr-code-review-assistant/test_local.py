import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test_local():
    print("✓ Testing analyzer logic...")
    from services.analyzer.app.worker import _simple_summarize
    
    test_diff = """
    diff --git a/app.py b/app.py
    index abc..def 100644
    --- a/app.py
    +++ b/app.py
    @@ -1,3 +1,4 @@
    +password = "secret"
     def process():
         pass
    """
    
    result = _simple_summarize(test_diff)
    assert "Security" in result or "secret" in result.lower()
    print(f"✓ Analysis works:\n{result}\n")
    
    print("✓ Testing GitHub URL parsing...")
    from services.fetcher.app.github_client import fetch_pr_diff
    from unittest.mock import patch, MagicMock
    
    with patch('services.fetcher.app.github_client.requests.get') as mock:
        mock_resp = MagicMock()
        mock_resp.text = "diff content"
        mock.return_value = mock_resp
        
        diff = fetch_pr_diff("https://github.com/owner/repo/pull/123")
        assert diff == "diff content"
        print("✓ GitHub client parsing works\n")
    
    print("✅ All local tests passed!")

if __name__ == "__main__":
    asyncio.run(test_local())
