# Backend API

Express.js + TypeScript backend for personalized news briefings.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Server runs on `http://localhost:3001`

## Environment Variables

Create a `.env` file:

```bash
# Required
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/news-briefing
JWT_SECRET=your-secret-key-change-this

# Optional
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

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

- **OTP-based:** User requests OTP → receives code via console → verifies with code
- **JWT tokens:** 7-day expiration (configurable)
- **Protected routes:** Use `authenticateToken` middleware

Example protected route:

```typescript
router.get("/protected", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  res.json({ userId });
});
```

## Testing the API

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference.

Quick test:

```bash
# Health check
curl http://localhost:3001/health

# Request OTP
curl -X POST http://localhost:3001/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check server console for OTP code
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

## Rate Limiting

- Per-IP: 100 requests / 15 minutes
- Per-User: 200 requests / 15 minutes
- Daily briefing quota: 3 per user

## Current Status

**✅ Working:**

- OTP authentication with MongoDB
- JWT token generation and verification
- User management
- Briefing generation (with stub data)
- Rate limiting and security

**🚧 TODO:**

- Real news API integration
- OpenAI summarization
- Email service for OTPs

## Troubleshooting

**"MONGODB_URI is not defined"**

- Create `.env` file with `MONGODB_URI`

**"Cannot connect to MongoDB"**

- Check connection string format
- Verify database user credentials
- Check IP whitelist in MongoDB Atlas

**"Port 3001 already in use"**

- Change `PORT` in `.env`
- Or kill process: `lsof -ti:3001 | xargs kill`

## Deployment

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment instructions.

## Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Architecture](../docs/Architecture.md) - System architecture
- [Deployment](../DEPLOYMENT.md) - Deployment guide
