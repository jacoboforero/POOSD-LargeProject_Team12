# API Documentation

Complete REST API reference for the News Briefing backend.

## Base URLs

- **Local Development:** `http://localhost:3002` (or whatever `PORT` you set in `.env`)
- **Production:** `https://poosdproj.xyz` (proxied to `129.212.183.227:3001`)

## Authentication

Most endpoints require a JWT token obtained through OTP verification.

**Headers:**

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## Endpoints

### Health Check

**GET** `/health`

Check server status.

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.4",
  "environment": "development",
  "message": "Deployment pipeline test - successful!",
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

---

### Authentication

#### Check if User Exists (pre-login hint)

**POST** `/api/auth/check-user`

Returns whether the email already has an account. Helpful for deciding when to show the password field in the UI.

**Request:**

```json
{ "email": "person@example.com" }
```

**Response:**

```json
{ "exists": true, "message": "User exists" }
```

---

#### Register New User

**POST** `/api/auth/register`

Creates a new account, stores optional onboarding preferences, and emails a 6-digit OTP code.

**Request:**

```json
{
  "email": "newuser@example.com",
  "name": "Avery Patel",
  "password": "StrongPass!9",
  "topics": ["technology", "markets"],
  "interests": ["AI", "semiconductors"],
  "jobIndustry": "tech",
  "demographic": "young professional",
  "location": "San Francisco, CA",
  "lifeStage": "early career",
  "newsStyle": "thoughtful analysis",
  "newsScope": "global",
  "preferredHeadlines": ["deep dives"],
  "scrollPastTopics": ["celebrity gossip"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email for the verification code."
}
```

**Notes**

- Email delivery is handled through your SMTP configuration. The OTP is logged to the console only if the email fails.
- OTP codes expire after 10 minutes and allow 5 attempts.

---

#### Login (password + OTP)

**POST** `/api/auth/login-password`

Verifies the stored password (if set) and then emails an OTP.

```json
{
  "email": "user@example.com",
  "password": "StrongPass!9"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password verified! Please check your email for the OTP code."
}
```

Use `/api/auth/verify` afterwards with the emailed code to obtain a JWT.

---

#### Login (OTP-only legacy flow)

**POST** `/api/auth/login`

Sends an OTP email without requiring a password (legacy flow used by older clients).

```json
{ "email": "user@example.com" }
```

---

#### Verify OTP

**POST** `/api/auth/verify`

Verifies the 6-digit code and returns the session token + user profile.

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6718a5c3f4e2b3a1d8e9f012",
    "email": "user@example.com",
    "emailVerified": true,
    "preferences": {
      "topics": ["technology"],
      "interests": ["AI"]
    },
    "timezone": "UTC",
    "notificationPrefs": { "onBriefingReady": true },
    "createdAt": "2025-10-23T12:00:00.000Z",
    "updatedAt": "2025-10-23T12:10:00.000Z"
  }
}
```

Errors: `400` for invalid/expired code, `429` after 5 failed attempts.

---

#### Password Reset Flow

1. **Start reset:** `POST /api/auth/forgot-password`

   ```json
   { "email": "user@example.com" }
   ```

2. **Verify reset code:** `POST /api/auth/verify-reset-code`

   ```json
   { "email": "user@example.com", "code": "654321" }
   ```

3. **Set new password:** `POST /api/auth/reset-password`

   ```json
   {
     "email": "user@example.com",
     "code": "654321",
     "newPassword": "AnotherStrongPass!1"
   }
   ```

All steps send/expect codes via email using the same 10-minute TTL.

---

#### Legacy OTP Convenience Endpoints

- `POST /api/auth/otp/request` – single endpoint that registers or logs in depending on whether the email already exists.
- `POST /api/auth/otp/verify` – identical to `/api/auth/verify`; maintained for backwards compatibility.

---

### User Management

#### Get Current User

**GET** `/api/me`

Get current user's profile.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:**

```json
{
  "_id": "6718a5c3f4e2b3a1d8e9f012",
  "email": "user@example.com",
  "emailVerified": true,
  "preferences": {
    "topics": ["technology", "business"],
    "interests": ["AI", "startups"],
    "demographic": "professional",
    "jobIndustry": "tech"
  },
  "limits": {
    "dailyGenerateCap": 3,
    "generatedCountToday": 1,
    "resetAt": "2025-10-24T00:00:00.000Z"
  },
  "timezone": "UTC",
  "notificationPrefs": {
    "onBriefingReady": true
  },
  "createdAt": "2025-10-23T12:00:00.000Z",
  "updatedAt": "2025-10-23T12:00:00.000Z"
}
```

---

#### Update Profile & Preferences

**PUT** `/api/me`

Update the authenticated user's profile. Supports changing display name, timezone, notification settings, and all preference fields (topics, interests, industry, demographics, etc.). The email address cannot be updated through this endpoint.

**Request:**

```json
{
  "name": "Avery Patel",
  "timezone": "America/Los_Angeles",
  "notificationPrefs": {
    "onBriefingReady": true
  },
  "preferences": {
    "topics": ["technology", "markets"],
    "interests": ["AI", "venture capital"],
    "jobIndustry": "finance",
    "demographic": "young professional",
    "location": "San Francisco, CA",
    "lifeStage": "young professional",
    "newsStyle": "thoughtful analysis",
    "newsScope": "global",
    "preferredHeadlines": ["deep dives", "founder stories"],
    "scrollPastTopics": ["celebrity gossip"]
  }
}
```

**Response:**

```json
{
  "_id": "6718a5c3f4e2b3a1d8e9f012",
  "name": "Avery Patel",
  "email": "user@example.com",
  "emailVerified": true,
  "preferences": {
    "topics": ["technology", "markets"],
    "interests": ["AI", "venture capital"],
    "jobIndustry": "finance",
    "demographic": "young professional",
    "location": "San Francisco, CA",
    "lifeStage": "young professional",
    "newsStyle": "thoughtful analysis",
    "newsScope": "global",
    "preferredHeadlines": ["deep dives", "founder stories"],
    "scrollPastTopics": ["celebrity gossip"]
  },
  "limits": {
    "dailyGenerateCap": 3,
    "generatedCountToday": 1,
    "resetAt": "2025-10-24T00:00:00.000Z"
  },
  "timezone": "America/Los_Angeles",
  "notificationPrefs": {
    "onBriefingReady": true
  },
  "createdAt": "2025-10-23T12:00:00.000Z",
  "updatedAt": "2025-10-23T12:10:00.000Z"
}
```

---

#### Get User Usage

**GET** `/api/me/usage`

Get user's quota and usage statistics.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:**

```json
{
  "dailyGenerateCap": 3,
  "generatedCountToday": 1,
  "remaining": 2,
  "resetAt": "2025-10-24T00:00:00.000Z"
}
```

---

### Briefings

#### Generate Daily Briefing

**POST** `/api/briefings/generate-daily`

Generate the standard personalized briefing using the user's saved preferences. Optional overrides let you tweak topics/interests for a single run.

**Headers:** Requires `Authorization: Bearer <token>`

**Request (optional - uses user preferences if not provided):**

```json
{
  "topics": ["technology", "AI"],
  "interests": ["machine learning", "startups"],
  "jobIndustry": "tech",
  "demographic": "professional"
}
```

**Response:**

```json
{
  "briefingId": "6718a5c3f4e2b3a1d8e9f013"
}
```

**Notes**

- Processing happens asynchronously (queue → fetching → summarizing). Poll the status route until `status = "done"`.
- The server fetches articles via NewsAPI, scrapes up to 3 full-text sources, and runs them through GPT-4o to produce the summary payload.

---

#### Run Custom News Query

**POST** `/api/briefings/generate`

Create an ad-hoc news query with quick controls for topics, keywords, preferred sources, language, and output format. Use this for one-off research bursts.

**Headers:** Requires `Authorization: Bearer <token>`

**Request (all fields optional, combine as needed):**

```json
{
  "topics": ["technology", "manufacturing"],
  "includeKeywords": ["chips", "fabs"],
  "excludeKeywords": ["rumor"],
  "preferredSources": ["the-verge", "bloomberg"],
  "language": "en",
  "format": "bullet_points"
}
```

**Response:**

```json
{
  "briefingId": "6718a5c3f4e2b3a1d8e9f099"
}
```

**Notes:**

- `topics`, `includeKeywords`, `excludeKeywords`, and `preferredSources` accept comma-separated strings on the client (converted to arrays on the API).
- `preferredSources` must use NewsAPI source IDs (e.g., `bloomberg`, `the-verge`).
- `format` accepts `narrative` or `bullet_points`.
- The query scans the last 90 days of coverage (roughly 3 months).

---

#### Get Briefing Status

**GET** `/api/briefings/:id/status`

Check processing status of a briefing.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:**

```json
{
  "_id": "6718a5c3f4e2b3a1d8e9f013",
  "status": "done",
  "progress": 100,
  "createdAt": "2025-10-23T12:00:00.000Z",
  "updatedAt": "2025-10-23T12:00:03.000Z"
}
```

**Status values:** `queued`, `fetching`, `summarizing`, `done`, `error`

---

#### Get Briefing

**GET** `/api/briefings/:id`

Get complete briefing with articles and summary.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:**

```json
{
  "_id": "6718a5c3f4e2b3a1d8e9f013",
  "userId": "6718a5c3f4e2b3a1d8e9f012",
  "status": "done",
  "request": {
    "topics": ["technology"],
    "interests": ["AI"],
    "jobIndustry": "tech",
    "demographic": "professional",
    "source": "news_api"
  },
  "articles": [
    {
      "title": "Sample Article",
      "url": "https://example.com/article",
      "source": "Example News"
    }
  ],
  "summary": {
    "sections": [
      {
        "category": "overview",
        "text": "Chipmakers accelerated fab capacity expansions this week while regulators cleared a key AI alliance, signaling continued momentum across semiconductors and enterprise AI adoption."
      }
    ],
    "generatedAt": "2025-10-23T12:00:03.000Z",
    "llm": {
      "provider": "openai",
      "model": "gpt-4o",
      "inputTokens": 1850,
      "outputTokens": 410
    }
  },
  "queuedAt": "2025-10-23T12:00:00.000Z",
  "completedAt": "2025-10-23T12:00:03.000Z",
  "progress": 100,
  "createdAt": "2025-10-23T12:00:00.000Z",
  "updatedAt": "2025-10-23T12:00:03.000Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details"
  }
}
```

### Error Codes

| Code                | Status | Description              |
| ------------------- | ------ | ------------------------ |
| `UNAUTHORIZED`      | 401    | Invalid or missing token |
| `FORBIDDEN`         | 403    | Access denied            |
| `NOT_FOUND`         | 404    | Resource not found       |
| `VALIDATION_FAILED` | 400    | Invalid request data     |
| `RATE_LIMITED`      | 429    | Too many requests        |
| `QUOTA_EXCEEDED`    | 402    | Daily quota exceeded     |
| `INTERNAL_ERROR`    | 500    | Server error             |

---

## Rate Limiting & Quotas

- **Per user:** `userRateLimit` enforces 200 requests per 15 minutes (hard-coded values in `src/middleware/rateLimiter.ts`).
- **Per IP:** middleware exists but is disabled by default in `app.ts`; enable when you need network-level throttling (defaults to 100 / 15 min).
- **Briefings:** `tryConsumeDailyGenerate` limits each user to 3 generations per day (set `DAILY_QUOTA_LIMIT`).

Responses include standard headers:

```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1729684800
```

---

## Complete Flow Example

### New User Registration Flow

```bash
# 1. Health check
curl http://localhost:3002/health

# 2. Register new user
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com"}'

# 3. Check your email for the OTP code (logs include a fallback), then verify
curl -X POST http://localhost:3002/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "code": "123456"}'

# Save the token from response

# 4. Get user profile
curl http://localhost:3002/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Existing User Login Flow

```bash
# 1. Login existing user
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "existinguser@example.com"}'

# 2. Check your email for the OTP (server logs include fallback), then verify
curl -X POST http://localhost:3002/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "existinguser@example.com", "code": "123456"}'

# Save the token from response
```

### Using Authenticated Endpoints

```bash
# Get user profile
curl http://localhost:3002/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check usage
curl http://localhost:3002/api/me/usage \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Generate briefing
curl -X POST http://localhost:3002/api/briefings/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"topics": ["technology"]}'

# Save briefingId from response

# Check status (poll until status = "done")
curl http://localhost:3002/api/briefings/BRIEFING_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get complete briefing
curl http://localhost:3002/api/briefings/BRIEFING_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Current Limitations

- Background work runs inside the Express process via `setTimeout`. If the server restarts mid-run the job is lost.
- `ipRateLimit` middleware is disabled by default; only per-user throttling and daily quotas are enforced.
- SMTP delivery does not yet include retries/webhooks; failures surface in server logs and fallback OTP logging.
- Requires valid `NEWS_API_KEY` and `OPENAI_API_KEY` to boot because the Briefing service instantiates both clients at startup.

**Coming Soon**

- Redis-backed job queue (BullMQ) so briefings survive restarts
- Richer email templates + provider metrics
- Push notifications for completed briefings

---

## Need Help?

1. **Check server logs** for detailed error messages
2. **Verify JWT token** hasn't expired (7 day lifespan)
3. **Check rate limits** if getting 429 errors
4. **Ensure MongoDB** is connected (check `/health` endpoint)

For deployment issues, see [DEPLOYMENT.md](../DEPLOYMENT.md).
