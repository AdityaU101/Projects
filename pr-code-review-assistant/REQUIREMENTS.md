# System Requirements

## Minimum Requirements

- **Python**: 3.11 or higher
- **Node.js**: 16 or higher (for frontend)
- **Docker**: 20.10+ (if using Docker)
- **Docker Compose**: 2.0+ (if using Docker)
- **RAM**: 2GB minimum (4GB+ recommended)
- **Disk Space**: 2GB for Docker images + dependencies

## Development Environment

### macOS
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install requirements
brew install python@3.11 node docker docker-compose
brew install --cask docker  # Docker Desktop

# Verify installations
python3 --version          # Python 3.11+
node --version            # v16+
docker --version          # 20.10+
docker-compose --version  # 2.0+
```

### Windows
1. **Python**: Download from https://www.python.org/downloads/ (3.11+)
   - Check "Add Python to PATH" during installation
   
2. **Node.js**: Download from https://nodejs.org/ (16+)
   - Use LTS version
   
3. **Docker Desktop**: https://www.docker.com/products/docker-desktop
   - Includes Docker and Docker Compose
   
4. **Verify**:
```powershell
python --version
node --version
docker --version
docker-compose --version
```

### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Python
sudo apt install python3.11 python3.11-venv python3-pip

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Docker
sudo apt install docker.io docker-compose

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER

# Verify
python3 --version
node --version
docker --version
docker-compose --version
```

---

## Project Dependencies

### Python Packages (Core)

#### Gateway Service
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
httpx==0.25.0
sqlmodel==0.0.14
psycopg2-binary==2.9.9
rq==1.14.1
redis==5.0.1
python-dotenv==1.0.0
```

#### Fetcher Service
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
httpx==0.25.0
pygithub==2.1.1
python-dotenv==1.0.0
requests==2.31.0
```

#### Analyzer Service
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
rq==1.14.1
redis==5.0.1
sqlmodel==0.0.14
psycopg2-binary==2.9.9
httpx==0.25.0
python-dotenv==1.0.0
```

### Testing Dependencies
```
pytest==7.4.3
pytest-cov==4.1.0
pytest-asyncio==0.21.1
```

### Development Dependencies (Optional)
```
black==23.11.0          # Code formatting
flake8==6.1.0          # Linting
mypy==1.7.1            # Type checking
pytest-mock==3.12.0    # Mocking for tests
```

### Frontend Dependencies

#### package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## External Services

### GitHub API
- **Required**: GitHub Personal Access Token
- **Get it**: https://github.com/settings/tokens
- **Scopes needed**: `repo` (read access to public/private repos)
- **Rate limit**: 5,000 requests/hour (authenticated)

### Database
- **PostgreSQL**: 15.x (optional if using SQLite for dev)
- **Default credentials**: user=user, pass=pass, db=prbot
- **Port**: 5432

### Message Queue
- **Redis**: 7.x
- **Port**: 6379
- **Purpose**: Job queue with RQ

---

## Environment Variables

### Required
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

### Optional
```bash
LLM_API_KEY=sk_xxxxxxxxxxxxx
DATABASE_URL=postgresql://user:pass@localhost:5432/prbot
REDIS_URL=redis://localhost:6379
FETCHER_URL=http://localhost:8001
```

### See `.env.example` for template

---

## Browser Requirements (Frontend)

### Modern Browsers Required
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Used
- ES2020+ JavaScript
- Fetch API
- LocalStorage
- CSS Grid/Flexbox

---

## Docker Image Sizes

| Image | Size |
|-------|------|
| python:3.11-slim | ~150MB |
| postgres:15 | ~300MB |
| redis:7 | ~100MB |
| **Total** | **~550MB** |

---

## System Performance

### Recommended for Production
- **CPU**: 2+ cores
- **RAM**: 4GB+
- **Storage**: 20GB SSD
- **Network**: 100Mbps+

### For Development
- **CPU**: 1+ core
- **RAM**: 2GB+
- **Storage**: 5GB SSD
- **Network**: 10Mbps+

---

## Port Requirements

| Service | Port | Protocol |
|---------|------|----------|
| Gateway | 8000 | HTTP |
| Fetcher | 8001 | HTTP |
| Analyzer | 8002 | HTTP |
| Frontend | 3000 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |

**Note**: If ports are in use, modify `docker-compose.yml` or service startup commands.

---

## Installation Verification

```bash
# Check all requirements
python -c "import sys; print(f'Python {sys.version}')"
node -v
npm -v
docker -v
docker-compose -v

# Clone and setup project
git clone <repo-url>
cd pr-code-review-assistant

# Copy environment
cp .env.example .env

# With Docker
docker-compose up --build

# Without Docker
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r services/gateway/requirements.txt
pip install -r services/fetcher/requirements.txt
pip install -r services/analyzer/requirements.txt
pip install -r tests/requirements-test.txt
```

---

## Troubleshooting

### Python version error
```bash
# Check version
python --version  # or python3 --version

# Update Python
# macOS: brew install python@3.11
# Windows: Download from https://www.python.org
# Linux: sudo apt install python3.11
```

### Docker daemon not running
```bash
# macOS/Windows: Start Docker Desktop

# Linux:
sudo systemctl start docker
sudo systemctl enable docker  # Auto-start on boot
```

### Port already in use
```bash
# Find what's using the port (Linux/macOS)
lsof -i :8000

# Windows
netstat -ano | findstr :8000

# Kill the process or change port in docker-compose.yml
```

### Memory insufficient
- Close other applications
- Increase Docker Desktop memory: Settings → Resources → Memory
- Use local development instead of Docker

---

## Bandwidth Requirements

| Operation | Size |
|-----------|------|
| Python packages | ~500MB |
| Node packages | ~300MB |
| Docker images | ~550MB |
| **Total Initial** | **~1.3GB** |

Per PR analysis: ~5-50KB (diff size)

---

## Security Notes

- Never commit `.env` with real tokens
- Use GitHub token with minimal scopes
- Rotate tokens regularly
- Consider using a secrets manager (AWS Secrets Manager, Vault)

---

## Getting Help

If requirements aren't met:
1. Check installation: `docker ps`, `python --version`
2. See QUICK_START.md for setup
3. Check DEVELOPMENT.md for environment-specific issues
4. Review troubleshooting section above

---

**Created**: December 27, 2025
