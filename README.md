# Personalized News Briefing App

A full-stack platform (web, mobile, API) that assembles personalized news briefings with live News API data, OpenAI summarization, and email-based OTP authentication.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas database + IP allow list
- NewsAPI.org key
- OpenAI API key
- SMTP credentials (Gmail, Mailtrap, Outlook, etc.)

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd POOSD-LargeProject_Team12

# Backend setup
cd backend
npm install
cp .env.example .env   # fill in MongoDB, JWT, NEWS_API_KEY, OPENAI_API_KEY, SMTP_*
npm run dev            # starts Express on PORT (default 3002 via .env)
```

Backend health: `GET http://localhost:3002/health`

Optional frontends:

```bash
# Web (React + Vite)
cd ../frontend
npm install
npm run dev            # http://localhost:3000, proxies /api to http://localhost:3001 by default
# Update `PORT` or `vite.config.ts` if your backend listens on a different port

# Flutter mobile
cd ../frontend_mobile
flutter pub get
flutter run            # defaults to https://poosdproj.xyz; use --dart-define API_BASE_URL=http://10.0.2.2:3002 for a local backend
```

**Production:** `https://poosdproj.xyz` (reverse proxy to the DigitalOcean droplet at `129.212.183.227:3001`)

### Smoke Tests

```bash
# Health check
curl http://localhost:3002/health

# Register and send OTP email
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","topics":["technology"],"password":"StrongPass!9"}'

# Verify OTP (code arrives via configured SMTP)
curl -X POST http://localhost:3002/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Authenticated request
curl http://localhost:3002/api/me \
  -H "Authorization: Bearer YOUR_JWT"
```

## 📚 Documentation

- **[API Documentation](backend/API_DOCUMENTATION.md)** – Endpoints, payloads, and flows
- **[Backend Setup](backend/README.md)** – Scripts, environment, and troubleshooting
- **[Deployment Guide](DEPLOYMENT.md)** – CI/CD pipeline and server setup
- **[Architecture](docs/Architecture.md)** – System and data-flow overview
- **[Security](SECURITY.md)** – Credential handling and hardening checklist
- **[Email Setup](EMAIL_SETUP.md)** – SMTP configuration guide
- **[Testing Plan](docs/TESTING.md)** – Current automated coverage

## 🏗️ Tech Stack

- **Backend:** Express.js (TypeScript), Mongoose, Nodemailer, Axios, OpenAI SDK
- **Data:** MongoDB Atlas
- **Authentication:** Password + OTP, JWT (HS256), bcrypt hashing
- **News Intake:** NewsAPI.org + custom scraper for full-text extraction
- **Summaries:** OpenAI GPT-4o
- **Frontend:** React 19 + Vite
- **Mobile:** Flutter (iOS + Android)
- **Deployment:** GitHub Actions → SCP artifacts → PM2 on DigitalOcean

## 📁 Project Structure

```
backend/             # Express API (TypeScript)
frontend/            # React + Vite prototype portal
frontend_mobile/     # Flutter client (iOS/Android)
packages/contracts/  # Shared Zod schemas & TS types
docs/                # Architecture, testing, etc.
.github/workflows/   # CI/CD pipelines
scripts/             # Server bootstrap helpers
```

## 🔧 Current Status

**✅ Implemented**

- Email-based OTP auth with optional password gate
- JWT session issuance and user preference management
- NewsAPI + scraper ingestion feeding GPT-4o summaries
- Briefing quota tracking and per-user rate limiting
- Automated deployment that ships built frontend + backend bundles
- React + Flutter clients consuming the same API contracts

**🚧 In Progress**

- Dedicated job queue (BullMQ/Redis) instead of in-process timers
- Production-grade push notifications & email templates
- Expanded frontend dashboard and sharing workflows

## 📝 Environment Variables (backend)

| Key | Purpose |
| --- | --- |
| `PORT` | API port (defaults to 4000 if unset; `.env.example` pins 3002) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT signing + expiration |
| `FRONTEND_URL` | Allowed origin for CORS (e.g. `http://localhost:3000`) |
| `NEWS_API_KEY` | Required – News API queries fail without it |
| `OPENAI_API_KEY` | Required – GPT-4o summarization |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | Required – OTP delivery |
| `VERIFIED_DOMAIN` | Used in email `from` address |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | Reserved for the optional IP rate limiter (user limiter uses built-in defaults) |
| `DAILY_QUOTA_LIMIT` | Placeholder for future runtime configuration; user docs currently store `limits.dailyGenerateCap` (default 3) |

See `backend/.env.example` for the full template.

## 🚀 Deployment

`main` branch pushes trigger GitHub Actions:

1. Install + build `packages/contracts`, backend, and frontend.
2. SCP the compiled artifacts (`backend/dist`, `frontend/dist`, scripts, package manifests) to `/root/POOSD/POOSD-LargeProject_Team12/`.
3. Run `backend/deploy-no-build.sh` on the droplet:
   - `npm ci --omit=dev`
   - Start/restart PM2 via `ecosystem.config.js`
4. Serve the React build as static assets behind the Express API (`poosdproj.xyz`).

Manual steps and server bootstrap instructions live in [DEPLOYMENT.md](DEPLOYMENT.md).

## 🆘 Troubleshooting

- **Server fails immediately:** Ensure `MONGODB_URI`, `NEWS_API_KEY`, `OPENAI_API_KEY`, and SMTP vars are set. Missing News/OpenAI keys prevent the Briefing service from instantiating.
- **OTP email missing:** Double-check SMTP credentials; logs fall back to printing the OTP if email delivery fails.
- **CORS errors:** Set `FRONTEND_URL` to the exact origin of your local frontend (`http://localhost:3000` for the Vite dev server).
- **Briefing errors:** Rate limit is 3 per day by default; look for status `error` with message about News API windows or missing content.
- **Health check fails in prod:** Hit `https://poosdproj.xyz/health` to confirm the droplet is reachable; confirm PM2 status with `pm2 logs news-briefing-api`.

## 👥 Team

POOSD Large Project – Team 12

## 📄 License

Educational project for the Principles of Object-Oriented Software Design course.
