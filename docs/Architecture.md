# System Architecture

Technical architecture overview for the Personalized News Briefing application.

## Current Status

**✅ Implemented**

- Express.js REST API (TypeScript) backed by MongoDB/Mongoose
- Password + OTP authentication, JWT sessions, SMTP email delivery
- User preference management, daily quotas, and per-user rate limiting
- NewsAPI ingestion + article scraping + GPT-4o summarization
- GitHub Actions deployment that ships pre-built backend + frontend artifacts to DigitalOcean
- React + Flutter clients sharing the same Zod contracts

**🚧 In Progress**

- Durable job queue (BullMQ/Redis) so background jobs survive restarts
- Production-ready mobile/web UX (push notifications, sharing, richer dashboards)
- Expanded observability + admin tooling (metrics, alerting)

---

## System Overview

```
┌─────────────────┐
│  GitHub Actions │ ──→ Automated Deployment
└─────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────────┐
│  DigitalOcean Server (poosdproj.xyz → 129.212.183.227:3001) │
│  ┌────────────────────────────────────────────┐             │
│  │  Express.js API (PM2)                      │             │
│  │  - Auth (password + OTP + JWT)             │             │
│  │  - User & Preferences                      │             │
│  │  - Briefing Pipeline (NewsAPI + GPT-4o)    │             │
│  │  - Rate Limiting & Quotas                  │             │
│  └────────────────────────────────────────────┘             │
└────────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────┐
│  MongoDB Atlas                                   │
│  - users collection                             │
│  - briefings collection                         │
└─────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend

- **Runtime:** Node.js 20
- **Framework:** Express.js 4 + TypeScript 5
- **Database:** MongoDB Atlas via Mongoose
- **Authentication:** bcrypt, JWT (jsonwebtoken), Nodemailer SMTP
- **Security:** Helmet, CORS, request IDs, centralized error handling
- **Rate Limiting:** express-rate-limit (`userRateLimit` active; `ipRateLimit` optional)
- **Process Manager:** PM2 (managed by GitHub Actions deploy)

### Frontends

- **Web:** React 19 + Vite + React Testing Library (prototype dashboard/onboarding)
- **Mobile:** Flutter (iOS + Android) w/ Provider + flutter_secure_storage
- **Shared Contracts:** `packages/contracts` (Zod schemas exported as TS types)

---

## Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  email: string,
  emailVerified: boolean,
  otp?: {
    hash: string,
    expiresAt: Date,
    attempts: number,
    lastRequestedAt: Date
  },
  preferences: {
    topics: string[],
    demographic?: string,
    jobIndustry?: string,
    interests: string[]
  },
  limits: {
    dailyGenerateCap: number,      // default: 3
    generatedCountToday: number,
    resetAt: Date
  },
  timezone?: string,
  notificationPrefs: {
    onBriefingReady: boolean
  },
  pushTokens: [{
    platform: 'ios' | 'android',
    token: string,
    addedAt: Date
  }],
  lastLoginAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Briefings Collection

```typescript
{
  _id: ObjectId,
  userId: string,
  status: 'queued' | 'fetching' | 'summarizing' | 'done' | 'error',
  statusReason?: string,
  request: {
    topics?: string[],
    interests?: string[],
    jobIndustry?: string,
    demographic?: string,
    source: string
  },
  articles: [{
    title?: string,
    url?: string,
    source?: string,
    publishedAt?: Date,
    content?: string
  }],
  summary?: {
    sections: [{
      category: string,
      text: string
    }],
    generatedAt: Date,
    llm: {
      provider: string,
      model: string,
      inputTokens: number,
      outputTokens: number
    }
  },
  error?: { message: string },
  queuedAt?: Date,
  fetchStartedAt?: Date,
  summarizeStartedAt?: Date,
  completedAt?: Date,
  progress?: number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Architecture

### Request Flow

```
Client Request
    ↓
Express App
    ↓
Middleware Stack:
├── requestId (add unique ID)
├── helmet (security headers)
├── cors (cross-origin)
├── morgan (logging with request IDs)
├── ipRateLimit (optional; disabled in development)
    ↓
Route Handler:
├── authenticateToken (JWT verification)
├── userRateLimit (per-user limiting)
├── Route logic
    ↓
Service Layer:
├── Business logic
├── Database operations
├── Error handling
    ↓
Response / Error Handler
    ↓
Client Response
```

### Middleware

**Security:**

- `helmet` - Security headers (CSP disabled so the bundled frontend can mount)
- `cors` - Uses `FRONTEND_URL` in development; production allow list is currently hard-coded to `http://129.212.183.227:3001` and `http://localhost:3000`
- `authenticateToken` - JWT verification

**Rate Limiting & Quotas:**

- `userRateLimit` – 200 requests / 15 minutes per authenticated user
- `ipRateLimit` – optional 100 requests / 15 minutes per IP (disabled today)
- `tryConsumeDailyGenerate` – DAO helper invoked before briefing generation to enforce daily caps

**Utilities:**

- `requestId` - Unique request IDs for tracing
- `morgan` - HTTP request logging
- `errorHandler` - Consistent error responses

---

## Authentication Flow

```
1. Client optionally calls /api/auth/check-user to decide if a password prompt is needed.
2. Registration or login POST (with optional password + onboarding data).
   └─→ AuthService hashes passwords, stores preferences, and issues a 6-digit OTP (bcrypt hashed with 10‑minute TTL + 5 attempts).
   └─→ EmailService uses Nodemailer + SMTP credentials to send the OTP (console logs only show the code when sending fails).
3. Client submits the OTP to /api/auth/verify (or /api/auth/otp/verify for legacy flows).
   └─→ Service validates TTL/attempts, marks the email verified, and creates a 7‑day JWT.
4. Protected routes read `Authorization: Bearer <token>`, verify the signature, attach `req.user`, and pass through business logic.
```

---

## Briefing Generation Flow

```
1. User submits POST /api/briefings/generate (custom) or /generate-daily
   └─→ userRateLimit + quota check
   └─→ Briefing document persisted with status "queued"

2. Background worker (setTimeout) processes the job
   └─→ Status → "fetching"
   └─→ NewsService hits NewsAPI using topic/source filters (respects historical window limits)
   └─→ ArticleScraper retrieves full text for up to 3 articles that clear quality thresholds

3. Summarization
   └─→ Status → "summarizing"
   └─→ BriefingService builds persona-aware prompt + citations
   └─→ OpenAI GPT-4o chat completion returns structured summary + usage stats

4. Completion
   └─→ Status → "done" (or "error" with message)
   └─→ Clients poll `/status` then fetch `/api/briefings/:id`
```

> ⚠️ Jobs currently run inside the API process. Restarting the server mid-job will drop in-flight work; migrating to a queue is on the roadmap.

---

## Deployment Pipeline

### GitHub Actions Workflow

```
Push to main
  ↓
GitHub Actions
  ├─ Checkout repo
  ├─ Setup Node.js 20
  ├─ npm ci + build (packages/contracts)
  ├─ npm ci + tsc (backend)
  ├─ npm ci + vite build (frontend)
  ├─ SCP backend/dist, frontend/dist, deploy scripts → /root/POOSD/POOSD-LargeProject_Team12/
  └─ SSH + run backend/deploy-no-build.sh
         ├─ npm ci --omit=dev
         ├─ pm2 restart/start via ecosystem.config.js
         └─ pm2 save
```

**Secrets Required**

- `SERVER_HOST` – `129.212.183.227`
- `SERVER_USER` – `root`
- `SERVER_SSH_KEY` – private key with access to the droplet

---

## Error Handling

All errors follow consistent format:

```typescript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable message',
    details?: any
  }
}
```

**Error Codes:**

- `UNAUTHORIZED` - Authentication required/failed
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `VALIDATION_FAILED` - Invalid request data
- `RATE_LIMITED` - Too many requests
- `QUOTA_EXCEEDED` - Daily quota exceeded
- `INTERNAL_ERROR` - Server error

---

## Security Measures

1. **Authentication**

   - OTP codes hashed with bcrypt + 10-minute TTL + 5-attempt ceiling
   - Optional password hashing (bcrypt) before OTP step
   - JWT (HS256) with 7-day default expiration
   - SMTP delivery via Nodemailer with graceful fallback logging

2. **Rate Limiting & Quotas**

   - `userRateLimit`: 200 requests / 15 min with standard rate-limit headers
   - `ipRateLimit`: available but disabled in `app.ts` (enable for public launch)
   - Daily quota: default 3 briefings/user/day enforced in MongoDB transaction helpers

3. **Security Headers:**

   - Helmet middleware
   - CORS configuration
   - Request ID tracking

4. **Data Protection**
   - OTP/password hashes (bcrypt)
   - Secrets stored via environment variables + GitHub secrets (no checked-in credentials)
   - Request IDs + morgan logs for traceability

---

## Shared Types (Contracts Package)

The `packages/contracts` directory contains shared TypeScript schemas using Zod:

**Purpose:**

- Type safety across frontend/backend
- Request/response validation
- Consistent data structures

**Contents:**

- Domain schemas (User, Briefing)
- DTOs (Data Transfer Objects)
- Error codes and schemas
- Validation utilities

---

## Future Architecture

### Job Queue & Workers

```
Client Request
    ↓
Express API ──→ Redis/BullMQ queue ──→ Worker Pods
                                ├── Fetch NewsAPI data
                                ├── Scrape articles in parallel
                                ├── Call OpenAI (retry/backoff)
                                └── Update MongoDB with status + summary
```

- Survives process restarts, supports concurrency limits, and keeps long-running work outside the web tier.

### Notifications & Delivery

```
Briefing Completed
    ↓
Event Bus
    ├── Email service (production SMTP or provider)
    ├── Push notification service (FCM/APNS)
    └── WebSocket/SSE gateway for React dashboard
```

- Pushes "briefing ready" events to users instead of polling every few seconds.

### Frontend Evolution

- Continue hardening the React + Vite dashboard (sharing, saved briefings, admin insights).
- Flutter app adds offline Briefing cache + push notification handling.
- Potential future Next.js shell once requirements for SEO/public marketing pages emerge.

---

## Performance Considerations

**Current:**

- In-memory background processing (setTimeout)
- Direct MongoDB queries
- No caching

**Future Optimizations:**

- Job queue (BullMQ + Redis)
- Article content caching
- Response caching
- CDN for frontend
- Database indexing

---

## Monitoring & Observability

**Current:**

- PM2 process management
- Console logging (morgan)
- Manual health checks

**Future:**

- Structured logging
- Error tracking (Sentry)
- Performance monitoring (APM)
- Uptime monitoring
- Log aggregation

---

## Development Workflow

```
Local Development:
├── Edit code in src/
├── TypeScript compiles on save
├── Nodemon restarts server
└── Test with curl/Postman

Production Deploy:
├── Push to main branch
├── GitHub Actions builds & deploys
├── PM2 restarts on server
└── Monitor logs with pm2 logs
```

---

## Environment Configuration

**Development:**

```bash
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/news-briefing
JWT_SECRET=dev-secret
```

**Production:**

```bash
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://...atlas.mongodb.net/news-briefing
JWT_SECRET=<strong-random-secret>
```

---

## Documentation

- **[README.md](../README.md)** - Project overview and quick start
- **[Backend README](../backend/README.md)** - Backend development guide
- **[API Documentation](../backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](../DEPLOYMENT.md)** - Production deployment
- **[Security Guide](../SECURITY.md)** - Security best practices

---

## Support & Resources

**Troubleshooting:**

1. Check server health: `curl http://129.212.183.227:3001/health`
2. View logs: `pm2 logs news-briefing-api`
3. Check GitHub Actions for deployment issues
4. Verify MongoDB connection in logs

**Key Endpoints:**

- Health: `/health`
- API Base: `/api`
- Production: `http://129.212.183.227:3001`
