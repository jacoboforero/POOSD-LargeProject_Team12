# Backend API

Express.js + TypeScript backend for personalized news briefings.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment (MongoDB, JWT, News API, OpenAI, SMTP, etc.)
cp .env.example .env
nano .env

# Development mode (with hot reload)
npm run dev   # respects PORT (defaults to 4000 if unset; template uses 3002)

# Build for production
npm run build

# Start production server from ./dist
npm start
```

Health check: `GET http://localhost:${PORT}/health`

## Environment Variables

Create a `.env` file:

```bash
# Required
PORT=3002
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/news-briefing
JWT_SECRET=your-secret-key-change-this

# Optional
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Required integrations
NEWS_API_KEY=your-newsapi-key
OPENAI_API_KEY=sk-...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=app-password
VERIFIED_DOMAIN=poosdproj.xyz
```

> `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` are currently only consumed by the optional IP rate limiter (disabled in `app.ts`). User-level throttling (200 req / 15 min) and the default daily cap (3 briefings) are stored directly on each user document.

## Project Structure

```
src/
├── app.ts              # Express app setup
├── index.ts            # Server entry point
├── config/
│   └── database.ts     # MongoDB connection
├── middleware/
│   ├── auth.ts         # JWT authentication
│   ├── rateLimiter.ts  # Rate limiting
│   ├── errorHandler.ts # Global error handler
│   └── validation.ts   # Request validation
├── models/
│   ├── User.model.ts   # User schema
│   └── Briefing.model.ts # Briefing schema
├── routes/
│   ├── auth.ts         # Authentication endpoints
│   ├── users.ts        # User management
│   └── briefings.ts    # Briefing generation
├── services/
│   ├── authService.ts  # OTP & JWT logic
│   ├── userService.ts  # User operations
│   └── briefingService.ts # Briefing generation
└── utils/
    └── jwt.ts          # JWT helpers
```

## Available Scripts

- `npm run dev` - Start development server with hot reload (nodemon)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server from compiled code
- `npm run test:api` - Test API endpoints
- `npm run test:api:local` - Test local API
- `npm run test:api:prod` - Test production API

## Development

### Adding a New Route

1. Create route file in `src/routes/`
2. Create service in `src/services/`
3. Register route in `src/app.ts`

Example:

```typescript
// src/routes/example.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, async (req, res) => {
  res.json({ message: "Hello" });
});

export default router;

// src/app.ts
import exampleRoutes from "./routes/example";
app.use("/api/example", exampleRoutes);
```

### Adding Middleware

```typescript
// src/middleware/custom.ts
import { Request, Response, NextFunction } from "express";

export const customMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Your logic
  next();
};
```

### Database Models

Uses Mongoose ODM:

```typescript
import mongoose, { Schema, Document } from "mongoose";

interface IExample extends Document {
  field: string;
}

const ExampleSchema = new Schema<IExample>(
  {
    field: { type: String, required: true },
  },
  { timestamps: true }
);

export const ExampleModel = mongoose.model<IExample>("Example", ExampleSchema);
```

## Authentication

- **Hybrid flow:** optional password check + mandatory OTP verification.
- **Delivery:** OTP codes are emailed through configured SMTP (Mailtrap, Gmail, etc.). The server logs the OTP only if email delivery fails.
- **Expiration:** codes are valid for 10 minutes with 5 attempts per request.
- **JWT tokens:** 7-day expiration by default (configurable via `JWT_EXPIRES_IN`).
- **Protected routes:** enforce `authenticateToken` (attaches `req.user`).

## Testing the API

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for a full reference.

```bash
# Health
curl http://localhost:3002/health

# Registration (sends OTP email)
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","topics":["technology"],"password":"StrongPass!9"}'

# OTP verification (code from email)
curl -X POST http://localhost:3002/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Authenticated profile lookup
curl http://localhost:3002/api/me \
  -H "Authorization: Bearer YOUR_JWT"
```

## Database

MongoDB is required. Create a database and configure `MONGODB_URI`.

**MongoDB Atlas** (recommended for production):

1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses
4. Copy connection string to `MONGODB_URI`

**Local MongoDB** (development):

```bash
MONGODB_URI=mongodb://localhost:27017/news-briefing
```

## Error Handling

All errors are caught by the global error handler. Throw errors in services/routes:

```typescript
if (!user) {
  throw new Error("User not found");
}
```

Error handler returns consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Rate Limiting & Quotas

- **Per user:** `userRateLimit` middleware enforces 200 req / 15 min.
- **Per IP:** `ipRateLimit` is available but disabled in `app.ts` for now; enable when ready.
- **Daily quota:** `tryConsumeDailyGenerate` in `src/utils/dbUtils.ts` tracks 3 briefing generations per user per day (configurable via env).

## Current Status

**✅ Working:**

- Password + OTP authentication with MongoDB persistence
- Email delivery via SMTP (registration, login, password reset)
- NewsAPI ingestion + article scraping + GPT-4o summarization
- User management, quotas, per-user rate limiting
- Automated GH Actions deployment copying pre-built assets

**🚧 TODO:**

- Move background processing to a queue (BullMQ/Redis)
- Push notifications + richer email templates
- Expanded admin instrumentation/logs

## Troubleshooting

**"MONGODB_URI is not defined"**

- Create `.env` file with `MONGODB_URI`

**"Cannot connect to MongoDB"**

- Check connection string format
- Verify database user credentials
- Check IP whitelist in MongoDB Atlas

**"Port already in use"**

- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:$PORT | xargs kill`

## Deployment

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment instructions.

## Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Architecture](../docs/Architecture.md) - System architecture
- [Deployment](../DEPLOYMENT.md) - Deployment guide
