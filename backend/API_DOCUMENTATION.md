# 📡 News Briefing API Documentation

Complete API reference for the News Briefing Backend service.

## 🌐 **Base URL**

```
http://localhost:3001
```

## 🔐 **Authentication**

The API uses JWT (JSON Web Token) authentication. Get a token by completing the OTP verification flow.

### **Authentication Flow**

1. Request OTP with email
2. Verify OTP with code
3. Receive JWT token
4. Use token in `Authorization: Bearer <token>` header

---

## 📋 **API Endpoints**

### **1. Health Check**

**GET** `/health`

Check server status and timestamp.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-22T22:40:34.603Z"
}
```

---

### **2. Request OTP**

**POST** `/api/auth/otp/request`

Request a one-time password for authentication.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true
}
```

**Note:** In dummy mode, any email works and OTP is always `123456`.

---

### **3. Verify OTP**

**POST** `/api/auth/otp/verify`

Verify OTP code and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**

```json
{
  "token": "mock-jwt-token",
  "user": {
    "_id": "mock-user-id",
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
    "createdAt": "2025-10-22T22:40:43.520Z",
    "updatedAt": "2025-10-22T22:40:43.520Z"
  }
}
```

---

### **4. Get User Profile**

**GET** `/api/me`

Get current user's profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "_id": "mock-user-id",
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
  "createdAt": "2025-10-22T22:40:43.520Z",
  "updatedAt": "2025-10-22T22:40:43.520Z"
}
```

---

### **5. Get User Usage**

**GET** `/api/me/usage`

Get user's usage statistics and quota information.

**Headers:**

```
Authorization: Bearer <jwt-token>
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

---

### **6. Generate Briefing**

**POST** `/api/briefings/generate`

Create a new personalized news briefing.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "topics": ["technology", "AI", "machine learning"],
  "interests": ["artificial intelligence", "data science"],
  "jobIndustry": "tech",
  "demographic": "professional"
}
```

**Response:**

```json
{
  "briefingId": "eec102de-121b-4f9f-8747-7c7de2be1000"
}
```

**Note:** Briefing processing takes ~2 seconds in dummy mode.

---

### **7. Get Briefing Status**

**GET** `/api/briefings/{briefingId}/status`

Check the processing status of a briefing.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "_id": "eec102de-121b-4f9f-8747-7c7de2be1000",
  "status": "done",
  "createdAt": "2025-10-22T22:40:46.960Z",
  "updatedAt": "2025-10-22T22:40:46.960Z"
}
```

**Status Values:**

- `queued` - Briefing is waiting to be processed
- `processing` - Briefing is being generated
- `done` - Briefing is complete
- `failed` - Briefing generation failed

---

### **8. Get Briefing Details**

**GET** `/api/briefings/{briefingId}`

Get the complete briefing with articles and summary.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "_id": "eec102de-121b-4f9f-8747-7c7de2be1000",
  "userId": "mock-user-id",
  "status": "done",
  "summary": "This is a comprehensive briefing covering the latest developments in technology and AI...",
  "articles": [
    {
      "title": "Breakthrough in Machine Learning",
      "url": "https://example.com/article1",
      "summary": "Researchers have made significant progress in neural network optimization...",
      "publishedAt": "2025-10-22T20:00:00.000Z",
      "source": "Tech News"
    },
    {
      "title": "AI Ethics in Healthcare",
      "url": "https://example.com/article2",
      "summary": "New guidelines address ethical concerns in AI-powered medical devices...",
      "publishedAt": "2025-10-22T18:30:00.000Z",
      "source": "Health Tech"
    }
  ],
  "topics": ["technology", "AI"],
  "interests": ["machine learning"],
  "jobIndustry": "tech",
  "demographic": "professional",
  "createdAt": "2025-10-22T22:40:46.960Z",
  "updatedAt": "2025-10-22T22:40:46.960Z"
}
```

---

## ❌ **Error Responses**

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "code": "validation_error",
        "expected": "string",
        "received": "number",
        "path": ["email"],
        "message": "Expected string, received number"
      }
    ]
  }
}
```

### **Error Codes**

| Code                | Description                              | HTTP Status |
| ------------------- | ---------------------------------------- | ----------- |
| `UNAUTHORIZED`      | Authentication required or invalid token | 401         |
| `FORBIDDEN`         | Access denied                            | 403         |
| `NOT_FOUND`         | Resource not found                       | 404         |
| `RATE_LIMITED`      | Too many requests                        | 429         |
| `QUOTA_EXCEEDED`    | Daily/monthly quota exceeded             | 429         |
| `VALIDATION_FAILED` | Request validation failed                | 400         |
| `PROVIDER_ERROR`    | External service error                   | 502         |
| `INTERNAL_ERROR`    | Server error                             | 500         |

---

## 🔒 **Rate Limiting**

- **Per-IP**: 100 requests per 15 minutes
- **Per-User**: 200 requests per 15 minutes (authenticated users)
- **Daily Quota**: 10 briefings per day (configurable)

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🧪 **Testing Examples**

### **Complete Flow Example**

```bash
# 1. Health check
curl http://localhost:3001/health

# 2. Request OTP
curl -X POST http://localhost:3001/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 3. Verify OTP
curl -X POST http://localhost:3001/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'

# 4. Get user profile (use token from step 3)
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer mock-jwt-token"

# 5. Generate briefing
curl -X POST http://localhost:3001/api/briefings/generate \
  -H "Authorization: Bearer mock-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"topics": ["technology"]}'

# 6. Check briefing status (use briefingId from step 5)
curl -X GET http://localhost:3001/api/briefings/{briefingId}/status \
  -H "Authorization: Bearer mock-jwt-token"

# 7. Get briefing details
curl -X GET http://localhost:3001/api/briefings/{briefingId} \
  -H "Authorization: Bearer mock-jwt-token"
```

---

## 📝 **Request/Response Examples**

### **Minimal Briefing Request**

```json
{
  "topics": ["news"]
}
```

### **Full Briefing Request**

```json
{
  "topics": ["technology", "business", "science"],
  "interests": ["AI", "startups", "research"],
  "jobIndustry": "tech",
  "demographic": "professional"
}
```

### **User Preferences**

```json
{
  "preferences": {
    "topics": ["technology", "AI"],
    "interests": ["machine learning"],
    "jobIndustry": "tech",
    "demographic": "professional"
  }
}
```

---

## 🔧 **Development Notes**

### **Dummy Data**

- **OTP Code**: Always `123456`
- **JWT Token**: `mock-jwt-token`
- **Processing Time**: ~2 seconds
- **Storage**: In-memory (resets on restart)

### **Production Considerations**

- Replace dummy OTP with real email service
- Replace in-memory storage with database
- Implement real briefing generation
- Add proper logging and monitoring

---

## 📚 **Additional Resources**

- **[Main README](./README.md)** - Quick start and overview
- **[Testing Guide](./TESTING.md)** - Comprehensive testing instructions
- **[Environment Setup](./.env.example)** - Environment configuration

---

## 🆘 **Support**

For issues or questions:

1. Check server logs for error details
2. Verify environment variables are set
3. Test individual endpoints with curl
4. Review this documentation for correct usage

**Happy coding!** 🚀
