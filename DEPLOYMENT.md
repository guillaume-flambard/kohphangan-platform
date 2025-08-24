# 🚀 Deployment Guide

## Production Deployment

### Automatic Deployment (Recommended)
Push to `main` branch triggers automatic deployment to production:

```bash
git push origin main
```

### Manual Deployment 
```bash
# Build and deploy frontend
cd react-frontend
npm run build
gcloud run deploy waterfall-party-frontend \
  --source . --region asia-southeast1 \
  --allow-unauthenticated --port 8080

# Build and deploy API  
cd laravel-api
gcloud run deploy waterfall-api \
  --source . --region asia-southeast1 \
  --allow-unauthenticated --port 8080 \
  --add-cloudsql-instances strayeye:asia-southeast1:waterfall-db
```

## Development Setup

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Docker & Docker Compose
- MySQL 8.0

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/strayeye/kohphangan-platform.git
cd kohphangan-platform
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your local settings
```

3. **Start with Docker (Recommended)**
```bash
npm run dev
# Starts frontend (localhost:3000) + API (localhost:8000) + MySQL
```

4. **Or run individually**
```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend
```

### GitHub Actions Setup

Add these secrets in **Settings → Secrets and Variables → Actions**:

- `GCP_SA_KEY`: Google Cloud Service Account JSON key

### Service Account Permissions

Create a service account with these roles:
- Cloud Run Admin
- Cloud SQL Admin  
- Artifact Registry Writer
- Storage Admin

## Environment Variables

### Production (.env)
```bash
# Frontend
VITE_API_URL=https://waterfall-api-877046715242.asia-southeast1.run.app
VITE_TAB_BUSINESS_CODE=eeatl

# Backend
APP_ENV=production
APP_URL=https://phangan.ai
DB_HOST=/cloudsql/strayeye:asia-southeast1:waterfall-db
DB_PASSWORD=your_secure_password
```

### Development (.env)
```bash
# Frontend
VITE_API_URL=http://localhost:8000

# Backend  
APP_ENV=local
DB_HOST=127.0.0.1
DB_PASSWORD=password
```

## Monitoring

- **Frontend**: https://phangan.ai
- **API**: https://waterfall-api-877046715242.asia-southeast1.run.app
- **Cloud Console**: https://console.cloud.google.com/run?project=strayeye

## Troubleshooting

### Build Failures
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Rebuild containers
npm run build
docker system prune -f
```

### Database Issues
```bash
# Connect to Cloud SQL
gcloud sql connect waterfall-db --user=root --quiet

# Run migrations
php artisan migrate --force
```