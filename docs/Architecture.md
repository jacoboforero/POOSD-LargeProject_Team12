# System Architecture

Technical architecture overview for the Personalized News Briefing application.

## Current Status: MVP Backend

**✅ Implemented:**

- Express.js REST API with TypeScript
- MongoDB database with Mongoose ODM
- OTP-based authentication with JWT
- User management and preferences
- Briefing generation pipeline (with stub data)
- Automated deployment via GitHub Actions

**🚧 In Progress:**

- News API integration
- OpenAI summarization
- Email service for OTPs
- Web frontend (Next.js)

---

## System Overview

```
┌─────────────────┐
│  GitHub Actions │ ──→ Automated Deployment
└─────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────┐
│  DigitalOcean Server (129.212.183.227:3001)    │
│  ┌──────────────────────────────────────┐      │
│  │  Express.js API (PM2)                │      │
│  │  - Authentication (OTP + JWT)        │      │
│  │  - User Management                   │      │
│  │  - Briefing Generation               │      │
│  │  - Rate Limiting                     │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
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
- **Framework:** Express.js 4
- **Language:** TypeScript 5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcrypt
- **Rate Limiting:** express-rate-limit
- **Process Manager:** PM2

### Future Additions

- **Frontend:** Next.js + Tailwind CSS
- **AI:** OpenAI GPT-4
- **News:** News API or similar
- **Email:** Resend or SendGrid

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
├── morgan (logging)
├── ipRateLimit (rate limiting)
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

- `helmet` - Security headers
- `cors` - Cross-origin resource sharing
- `authenticateToken` - JWT verification

**Rate Limiting:**

- `ipRateLimit` - 100 requests/15min per IP
- `userRateLimit` - 200 requests/15min per user

**Utilities:**

- `requestId` - Unique request IDs for tracing
- `morgan` - HTTP request logging
- `errorHandler` - Consistent error responses

---

## Authentication Flow

```
1. User requests OTP
   POST /api/auth/otp/request
   └─→ Generate random 6-digit code
   └─→ Hash with bcrypt
   └─→ Store in user.otp (10min expiration)
   └─→ Log code to console (no email yet)

2. User verifies OTP
   POST /api/auth/otp/verify
   └─→ Verify code with bcrypt
   └─→ Mark email as verified
   └─→ Generate JWT token (7 day expiration)
   └─→ Return token + user data

3. User makes authenticated requests
   Any protected route
   └─→ Extract Bearer token from header
   └─→ Verify JWT signature
   └─→ Load user from database
   └─→ Attach user to req.user
   └─→ Continue to route handler
```

---

## Briefing Generation Flow

```
1. User requests briefing
   POST /api/briefings/generate
   └─→ Check daily quota
   └─→ Create briefing doc (status: "queued")
   └─→ Return briefing ID
   └─→ Increment user quota

2. Background processing (setTimeout)
   └─→ Wait 3 seconds
   └─→ Generate stub data:
       ├── Dummy articles
       ├── Stub summary
       └── LLM metadata
   └─→ Update status to "done"

3. Client polls for completion
   GET /api/briefings/:id/status
   └─→ Return current status

4. Client retrieves briefing
   GET /api/briefings/:id
   └─→ Return full briefing with articles & summary
```

**Note:** Steps 2 will be replaced with real news fetching and OpenAI summarization.

---

## Deployment Pipeline

### GitHub Actions Workflow

```
Push to main branch
    ↓
GitHub Actions Runner:
├── 1. Checkout code
├── 2. Setup Node.js 20
├── 3. Install dependencies
├── 4. Build TypeScript
    ↓
SSH to DigitalOcean Server:
├── 5. Pull latest code
├── 6. Install dependencies
├── 7. Build on server
├── 8. Restart PM2
    ↓
Deployment Complete
```

**Secrets Required:**

- `SERVER_HOST` - Server IP (129.212.183.227)
- `SERVER_USER` - SSH username (root)
- `SERVER_SSH_KEY` - Private SSH key

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

1. **Authentication:**

   - OTP with bcrypt hashing
   - JWT with secret signing
   - 10-minute OTP expiration
   - 5 attempt limit per OTP

2. **Rate Limiting:**

   - Per-IP limits (100/15min)
   - Per-user limits (200/15min)
   - Daily briefing quota (3/day)

3. **Security Headers:**

   - Helmet middleware
   - CORS configuration
   - Request ID tracking

4. **Data Protection:**
   - Hashed OTP codes
   - No password storage (OTP-only auth)
   - Environment variables for secrets

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

### News Integration

```
User Request → Briefing Service → News API Service
                                      ├── Query news API
                                      ├── Fetch articles
                                      ├── Extract full text
                                      └── Return articles
```

### AI Summarization

```
Articles → LLM Service → OpenAI API
                         ├── Build prompt
                         ├── Send to GPT-4
                         ├── Parse response
                         └── Return summary
```

### Frontend

```
Next.js App → REST API
├── Authentication pages
├── Dashboard
├── Briefing viewer
└── Settings
```

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
