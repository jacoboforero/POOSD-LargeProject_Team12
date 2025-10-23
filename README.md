# Personalized News Briefing App

A web application that generates personalized news briefings based on user preferences.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas account
- GitHub account (for deployment)

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd POOSD-LargeProject_Team12

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Run backend
npm run dev
```

Backend runs at `http://localhost:3002` (local dev)

**Note:** Production server uses port 3001 at `http://129.212.183.227:3001`

### Test the API

```bash
# Health check
curl http://localhost:3002/health

# Register new user
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check server logs for OTP code, then verify
curl -X POST http://localhost:3002/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "YOUR_OTP"}'

# Login existing user (returns new OTP)
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 📚 Documentation

- **[API Documentation](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Backend Setup](backend/README.md)** - Backend development guide
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment with GitHub Actions
- **[Architecture](docs/Architecture.md)** - System architecture overview
- **[Security](SECURITY.md)** - Security guidelines

## 🏗️ Tech Stack

- **Backend:** Express.js (TypeScript) + MongoDB
- **Authentication:** JWT with OTP via email
- **Deployment:** GitHub Actions → DigitalOcean Droplet
- **Future:** Next.js frontend, OpenAI integration, News APIs

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── models/        # MongoDB models
│   ├── middleware/    # Auth, rate limiting, errors
│   └── utils/         # JWT utilities
└── dist/              # Compiled JavaScript

packages/
└── contracts/         # Shared TypeScript schemas

.github/workflows/     # CI/CD pipelines
```

## 🔧 Current Status

**✅ Implemented:**

- OTP-based authentication with JWT
- User management and preferences
- Briefing generation API (with dummy data)
- MongoDB integration
- Rate limiting and security middleware
- Automated deployment pipeline

**🚧 In Progress:**

- News API integration
- OpenAI summarization
- Email service (OTPs currently log to console)
- Next.js frontend

## 📝 Environment Variables

Required for backend (see `backend/.env.example`):

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `PORT` - Server port (default: 3002 for local dev, 3001 for production)

Future integration:

- `OPENAI_API_KEY` - For summarization
- `NEWS_API_KEY` - For news articles
- `RESEND_API_KEY` - For email OTPs

## 🚀 Deployment

Automated deployment via GitHub Actions:

1. Push to `main` branch
2. GitHub Actions builds and tests
3. Deploys to DigitalOcean server via SSH
4. PM2 restarts the application

See [DEPLOYMENT.md](DEPLOYMENT.md) for setup instructions.

## 🆘 Troubleshooting

**Server won't start:**

- Check MongoDB connection string in `.env`
- Ensure Node.js 20+ is installed
- Run `npm install` in backend directory

**Authentication fails:**

- OTPs are logged to server console (check logs)
- OTPs expire after 10 minutes
- Maximum 5 attempts per OTP

**API returns 404:**

- Verify server is running: `curl http://localhost:3002/health` (local)
- Check correct port (3002 for local dev, 3001 for production)

## 👥 Team

POOSD Large Project - Team 12

## 📄 License

Educational project for Principles of Object-Oriented Software Design course.
