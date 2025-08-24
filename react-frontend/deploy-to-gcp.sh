#!/bin/bash

# Waterfall Party App - Emergency Deployment Script
# This deploys your React app to Cloud Run with custom domain support

set -e

PROJECT_ID="strayeye"
SERVICE_NAME="phangan-waterfall"
REGION="us-central1"

echo "🌊 Deploying Waterfall Party Ticket System to GCP..."

# 1. Build the application
echo "📦 Building React application..."
npm run build

# 2. Create optimized Dockerfile for Cloud Run
cat > Dockerfile.production << EOF
# Multi-stage build for smaller image
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage with nginx
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script for Cloud Run
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
EOF

# 3. Update nginx config for Cloud Run (port 8080)
cat > nginx.production.conf << EOF
server {
    listen 8080;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        
        # CORS headers for payment widget
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# 4. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production

# 5. Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "✅ Service deployed at: $SERVICE_URL"

# 6. Set up custom domain (if you have one configured in GCP)
echo "🌐 To connect your domain phangan.ai:"
echo "1. Add domain mapping in Cloud Console: https://console.cloud.google.com/run/domains"
echo "2. Point your domain's DNS to: ghs.googlehosted.com"
echo "3. Or use Cloud DNS for full GCP integration"

echo "🎉 Waterfall Party ticket system is live!"
echo "📱 Test the app: $SERVICE_URL/events/waterfall/echo"

# Cleanup
rm -f Dockerfile.production nginx.production.conf