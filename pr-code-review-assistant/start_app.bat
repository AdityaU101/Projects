@echo off
REM Start all services in separate windows using venv

cd /d c:\Users\DD\Documents\pr-code-review-assistant

echo Starting PR Code Review Assistant (Using Virtual Environment)...
echo.

start "Gateway Service (8000)" cmd /k ".venv\Scripts\activate.bat && python -m uvicorn services.gateway.app.main:app --port 8000 --reload"

timeout /t 2 /nobreak

start "Fetcher Service (8001)" cmd /k ".venv\Scripts\activate.bat && python -m uvicorn services.fetcher.app.main:app --port 8001 --reload"

timeout /t 2 /nobreak

start "Analyzer Service (8002)" cmd /k ".venv\Scripts\activate.bat && python -m uvicorn services.analyzer.app.main:app --port 8002 --reload"

timeout /t 2 /nobreak

start "Frontend Server (3000)" cmd /k ".venv\Scripts\activate.bat && python frontend_server.py"

echo.
echo All services started! 
echo.
echo Access the application at: http://localhost:3000
echo.
pause
