# News Briefing API Documentation

## Running API Locally

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment file:

   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Environment Variables

- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time (default: 7d)

## API Endpoints

### Authentication

#### Request OTP

```bash
curl -X POST http://localhost:3001/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**

```json
{
  "success": true
}
```

#### Verify OTP

```bash
curl -X POST http://localhost:3001/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "code": "123456"}'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "emailVerified": true,
    "preferences": {
      "topics": [],
      "interests": [],
      "jobIndustry": "",
      "demographic": ""
    },
    "timezone": "UTC",
    "notificationPrefs": {
      "email": true,
      "push": false,
      "frequency": "daily"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### User Endpoints

#### Get User Profile

```bash
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get User Usage

```bash
curl -X GET http://localhost:3001/api/me/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "totalBriefings": 5,
  "completedBriefings": 3,
  "queuedBriefings": 1,
  "failedBriefings": 1,
  "dailyUsage": 2,
  "quota": {
    "daily": 10,
    "monthly": 100,
    "remaining": 8
  }
}
```

### Briefing Endpoints

#### Generate Briefing

```bash
curl -X POST http://localhost:3001/api/briefings/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topics": ["technology", "AI"],
    "interests": ["machine learning"],
    "jobIndustry": "tech",
    "demographic": "professional"
  }'
```

**Response:**

```json
{
  "briefingId": "briefing-uuid"
}
```

#### Get Briefing Status

```bash
curl -X GET http://localhost:3001/api/briefings/{briefingId}/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "_id": "briefing-uuid",
  "status": "done",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get Briefing Details

```bash
curl -X GET http://localhost:3001/api/briefings/{briefingId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "_id": "briefing-uuid",
  "userId": "user-id",
  "status": "done",
  "summary": "This is a stub briefing summary...",
  "articles": [
    {
      "title": "Sample Article 1",
      "url": "https://example.com/article1",
      "summary": "This is a stub article summary.",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "source": "Example News"
    }
  ],
  "topics": ["technology", "AI"],
  "interests": ["machine learning"],
  "jobIndustry": "tech",
  "demographic": "professional",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

All errors follow the ErrorSchema format:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": ["email"],
        "message": "Expected string, received number"
      }
    ]
  }
}
```

### Error Codes

- `UNAUTHORIZED`: Authentication required or invalid token
- `FORBIDDEN`: Access denied
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `QUOTA_EXCEEDED`: Daily/monthly quota exceeded
- `VALIDATION_FAILED`: Request validation failed
- `PROVIDER_ERROR`: External service error
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Per-IP**: 100 requests per 15 minutes
- **Per-User**: 200 requests per 15 minutes (authenticated users)
- **Daily Quota**: 10 briefings per day (configurable)

## Testing the Complete Flow

1. **Request OTP:**

   ```bash
   curl -X POST http://localhost:3001/api/auth/otp/request \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Check console for OTP code** (stubbed implementation logs the code)

3. **Verify OTP:**

   ```bash
   curl -X POST http://localhost:3001/api/auth/otp/verify \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "code": "123456"}'
   ```

4. **Use the returned JWT token for authenticated requests**

5. **Generate a briefing:**

   ```bash
   curl -X POST http://localhost:3001/api/briefings/generate \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"topics": ["technology"]}'
   ```

6. **Check briefing status (wait 1-2 seconds):**

   ```bash
   curl -X GET http://localhost:3001/api/briefings/{briefingId}/status \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

7. **Get completed briefing:**
   ```bash
   curl -X GET http://localhost:3001/api/briefings/{briefingId} \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Health Check

```bash
curl -X GET http://localhost:3001/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
