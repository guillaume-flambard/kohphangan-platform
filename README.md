# Koh Phangan Party Platform

Complete party booking and ticket management system for Koh Phangan events.

## 🎉 Features

- **Waterfall Party Echo** ticket system
- Tab payment integration (900 THB)
- QR code generation and validation
- PDF ticket downloads
- Mobile-optimized design
- Real-time booking management

## 🏗️ Architecture

```
kohphangan/
├── react-frontend/     # React + TypeScript + Tailwind frontend
├── laravel-api/       # Laravel 11 API backend
└── .github/           # GitHub Actions workflows
```

## 🚀 Environments

- **Production**: https://phangan.ai
- **Development**: Local development + GCP staging

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Tab Payment Widget

### Backend  
- Laravel 11
- MySQL (Cloud SQL)
- Docker

### Infrastructure
- Google Cloud Run
- Google Cloud SQL
- Google Artifact Registry
- GitHub Actions CI/CD

## 🏃‍♂️ Quick Start

### Frontend Development
```bash
cd react-frontend
npm install
npm run dev
```

### Backend Development  
```bash
cd laravel-api
composer install
php artisan serve
```

### Production Deployment
Deployments are handled automatically via GitHub Actions on push to `main`.

## 🌐 Live URLs

- **Main Site**: https://phangan.ai
- **Waterfall Tickets**: https://phangan.ai/events/waterfall/echo
- **API**: https://waterfall-api-877046715242.asia-southeast1.run.app

## 📱 Event Details

**Waterfall Party Echo**
- Date: Saturday, Aug 24, 2025
- Time: 8:00 PM - 4:00 AM
- Location: Secret Waterfall, Koh Phangan
- Price: 900 THB

---

Built with ❤️ for the Koh Phangan party community