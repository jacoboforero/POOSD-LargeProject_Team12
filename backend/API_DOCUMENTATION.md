# API Documentation

Complete REST API reference for the News Briefing backend.

## Base URLs

- **Local Development:** `http://localhost:3001`
- **Production:** `http://129.212.183.227:3001`

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
  "version": "1.0.3",
  "environment": "development",
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

---

### Authentication

#### Register New User

**POST** `/api/auth/register`

Register a new user account. Creates a new user and sends an OTP for verification.

**Request:**

```json
{
  "email": "newuser@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful. Please check your console for OTP code."
}
```

**Errors:**

- `400` - User already exists (use `/api/auth/login` instead)

**Note:** OTP is logged to server console. Check server logs for the 6-digit code. OTP expires in 10 minutes.

---

#### Login Existing User

**POST** `/api/auth/login`

Login an existing user. Sends an OTP for authentication.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent. Please check your console for the code."
}
```

**Errors:**

- `400` - User not found (use `/api/auth/register` instead)

**Note:** OTP is logged to server console. Check server logs for the 6-digit code. OTP expires in 10 minutes.

---

#### Verify OTP

**POST** `/api/auth/verify`

Verify OTP code and receive JWT authentication token. Works for both registration and login flows.

**Request:**

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
      "topics": [],
      "interests": []
    },
    "timezone": "UTC",
    "notificationPrefs": {
      "onBriefingReady": true
    },
    "createdAt": "2025-10-23T12:00:00.000Z",
    "updatedAt": "2025-10-23T12:00:00.000Z"
  }
}
```

**Errors:**

- `400` - Invalid OTP code
- `400` - OTP expired (request new OTP)
- `400` - Too many failed attempts (request new OTP)

---

### User Management

#### Get Current User

**GET** `/api/me/me`

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

#### Generate Briefing

**POST** `/api/briefings/generate`

Generate a new personalized news briefing.

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

**Note:** Processing happens in background. Poll status endpoint to check completion.

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
        "category": "technology",
        "text": "This is a stub summary. Real news integration coming soon."
      }
    ],
    "generatedAt": "2025-10-23T12:00:03.000Z",
    "llm": {
      "provider": "openai",
      "model": "gpt-4o-mini",
      "inputTokens": 0,
      "outputTokens": 0
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

## Rate Limiting

- **Per IP:** 100 requests per 15 minutes
- **Per User:** 200 requests per 15 minutes
- **Daily Briefings:** 3 per user (configurable)

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1729684800
```

---

## Complete Flow Example

### New User Registration Flow

```bash
# 1. Health check
curl http://localhost:3001/health

# 2. Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com"}'

# 3. Check server logs for OTP code, then verify
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "code": "123456"}'

# Save the token from response

# 4. Get user profile
curl http://localhost:3001/api/me/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Existing User Login Flow

```bash
# 1. Login existing user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "existinguser@example.com"}'

# 2. Check server logs for OTP, then verify
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "existinguser@example.com", "code": "123456"}'

# Save the token from response
```

### Using Authenticated Endpoints

```bash
# Get user profile
curl http://localhost:3001/api/me/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check usage
curl http://localhost:3001/api/me/usage \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Generate briefing
curl -X POST http://localhost:3001/api/briefings/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"topics": ["technology"]}'

# Save briefingId from response

# Check status (poll until status = "done")
curl http://localhost:3001/api/briefings/BRIEFING_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get complete briefing
curl http://localhost:3001/api/briefings/BRIEFING_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Current Limitations

**⚠️ MVP Status - Dummy Data:**

- Articles and summaries are placeholder data
- No real news API integration yet
- No OpenAI integration yet
- OTPs are logged to console (no email service yet)

**Coming Soon:**

- Real news article fetching
- AI-powered summarization
- Email delivery for OTPs
- Frontend web application

---

## Need Help?

1. **Check server logs** for detailed error messages
2. **Verify JWT token** hasn't expired (7 day lifespan)
3. **Check rate limits** if getting 429 errors
4. **Ensure MongoDB** is connected (check `/health` endpoint)

For deployment issues, see [DEPLOYMENT.md](../DEPLOYMENT.md).
