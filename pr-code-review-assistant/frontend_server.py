#!/usr/bin/env python
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

class FrontendHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        return super().do_GET()

def start_frontend():
    frontend_path = Path(__file__).parent / "frontend"
    os.chdir(frontend_path)
    
    server_address = ('127.0.0.1', 3000)
    httpd = HTTPServer(server_address, FrontendHandler)
    
    print("✅ Frontend server started")
    print("📍 Open http://localhost:3000 in your browser")
    print("\nPress Ctrl+C to stop...\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✅ Frontend server stopped")
        httpd.server_close()

if __name__ == "__main__":
    start_frontend()
