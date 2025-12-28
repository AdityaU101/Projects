# Deployment & Production Checklist

## Pre-Production Checklist

- [ ] All tests passing: `pytest tests/ -v`
- [ ] No hardcoded secrets (check `.env` is gitignored)
- [ ] Database migrations planned
- [ ] Error handling for all external API calls
- [ ] Logging configured for each service
- [ ] Rate limiting enabled on Gateway
- [ ] CORS properly configured (not `allow_origins=["*"]` in production)
- [ ] Health checks passing: `curl http://localhost:8000/health`

## Environment Setup

### AWS Deployment

```bash
# 1. Push image to ECR
aws ecr create-repository --repository-name pr-code-review-gateway
aws ecr create-repository --repository-name pr-code-review-fetcher
aws ecr create-repository --repository-name pr-code-review-analyzer

# 2. Build and push
docker build -t pr-code-review-gateway services/gateway/
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag pr-code-review-gateway:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/pr-code-review-gateway:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/pr-code-review-gateway:latest

# 3. Use ECS, EKS, or Fargate to orchestrate
```

### GCP Deployment

```bash
# Using Cloud Run
gcloud run deploy pr-gateway \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars GITHUB_TOKEN=$GITHUB_TOKEN,DATABASE_URL=$DATABASE_URL,REDIS_URL=$REDIS_URL
```

### Kubernetes Deployment

See `k8s/` folder for yaml manifests:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/gateway.yaml
kubectl apply -f k8s/fetcher.yaml
kubectl apply -f k8s/analyzer.yaml
```

## Monitoring & Observability

### Prometheus Metrics

Add to `services/gateway/app/main.py`:
```python
from prometheus_client import Counter, Histogram, generate_latest
from fastapi.responses import Response

JOBS_SUBMITTED = Counter('jobs_submitted_total', 'Total jobs submitted')
ANALYSIS_TIME = Histogram('analysis_time_seconds', 'Analysis duration')

@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")
```

### Sentry Error Tracking

```python
import sentry_sdk
sentry_sdk.init("https://key@sentry.io/123456")
```

### CloudWatch / DataDog

Configure environment variables for log aggregation:
```bash
DATADOG_API_KEY=xxx
DATADOG_APP_KEY=xxx
```

## Database Migrations

For production, use Alembic:

```bash
# Initialize migrations
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add Job table"

# Apply migrations
alembic upgrade head
```

## Scaling Strategies

### Horizontal Scaling
- Add more worker containers to RQ queue
- Use load balancer (ALB, Nginx) in front of Gateway
- Scale analyzer workers based on queue depth

### Vertical Scaling
- Increase service resource limits
- Tune PostgreSQL for large result storage
- Configure Redis persistence

### Caching
- Cache GitHub diffs by PR ID in Redis
- Cache analysis results by diff hash
- Use CDN for static frontend assets

## Security

### API Security
```python
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/analyze")
async def analyze(req: SubmitRequest, credentials = Security(security)):
    # Verify JWT token
    token = credentials.credentials
    # Validate...
```

### Secrets Management
- Use AWS Secrets Manager or HashiCorp Vault
- Never commit `.env` files
- Rotate tokens regularly
- Use separate tokens per environment

### Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/analyze")
@limiter.limit("100/minute")
async def analyze(req: SubmitRequest):
    pass
```

## Backup & Recovery

### Database Backups
```bash
# PostgreSQL backup
pg_dump postgresql://user:pass@localhost:5432/prbot > backup.sql

# Restore
psql postgresql://user:pass@localhost:5432/prbot < backup.sql
```

### Redis Backups
```bash
# Redis dump
redis-cli BGSAVE

# Check backup location
redis-cli CONFIG GET dir
```

## Performance Optimization

### Query Optimization
- Index frequently queried fields in Job table
- Use pagination for large result sets
- Connection pooling for database

### Worker Optimization
- Tune RQ job timeout settings
- Increase concurrency based on CPU
- Monitor queue depth

### Frontend Optimization
- Enable code splitting in Vite
- Compress assets
- Use service workers for offline support

## Disaster Recovery Plan

| Scenario | Action |
|----------|--------|
| Service crash | Health checks trigger auto-restart (Kubernetes) |
| Database failure | Restore from latest backup |
| Redis failure | Recreate from RDB dump |
| Complete outage | Failover to standby region |

## Post-Deployment

1. **Monitor metrics** - Check Prometheus/Grafana dashboards
2. **Review logs** - Check CloudWatch/Sentry for errors
3. **Performance testing** - Load test with `k6` or `Apache JMeter`
4. **Security audit** - Run OWASP scanning
5. **Feature monitoring** - Track user adoption and feature usage

## CI/CD Pipeline

See `.github/workflows/ci.yml` for automated testing and deployment.

```yaml
# On push to main
1. Run tests
2. Build Docker images
3. Push to registry
4. Deploy to staging
5. Run smoke tests
6. Deploy to production
```

## Support & Troubleshooting

### Common Production Issues

**High latency:**
- Check database query performance
- Review worker queue depth
- Scale horizontally if needed

**Out of memory:**
- Reduce batch sizes
- Enable pagination
- Profile memory usage with `memory_profiler`

**Increased error rate:**
- Check GitHub API rate limits
- Verify network connectivity
- Review error logs in Sentry

---

**Questions?** Contact: devops@company.com
