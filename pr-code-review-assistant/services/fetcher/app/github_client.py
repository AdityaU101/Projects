import os
import requests

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
USE_DUMMY_DATA = os.getenv("USE_DUMMY_DATA", "true").lower() == "true"

DUMMY_DIFF = """diff --git a/app.py b/app.py
index 1234567..abcdefg 100644
--- a/app.py
+++ b/app.py
@@ -1,10 +1,15 @@
 def process_data():
     password = "hardcoded_secret_123"
+    api_key = "sk_live_12345"
     
     for i in range(1000):
         for j in range(1000):
             result = expensive_operation(i, j)
             print(result)
+    
+    for item in large_list:
+        if not validate_input(item):
+            continue
+        process_item(item)
 
 def validate_input(x):
     return x is not None
"""

def fetch_pr_diff(pr_url: str) -> str:
    if USE_DUMMY_DATA:
        return DUMMY_DIFF
    
    if not GITHUB_TOKEN:
        raise ValueError("GITHUB_TOKEN environment variable not set")
    
    parts = pr_url.rstrip("/").split("/")
    owner, repo, pr_number = parts[-4], parts[-3], parts[-1]
    
    api = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3.diff"
    }
    
    r = requests.get(api, headers=headers, timeout=30)
    r.raise_for_status()
    return r.text
