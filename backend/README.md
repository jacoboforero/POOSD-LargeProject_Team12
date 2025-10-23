# 🚀 News Briefing Backend API

Production-ready Express.js API for personalized news briefings.

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Server runs on `http://localhost:3001`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=3001
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
NEWS_API_KEY=your-news-api-key
RESEND_API_KEY=your-resend-key
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Project Structure

```
src/
├── app.ts              # Express app configuration
├── index.ts            # Server entry point
├── config/             # Configuration (database, etc.)
├── middleware/         # Auth, validation, error handling
├── models/             # MongoDB models
├── routes/             # API route handlers
├── services/           # Business logic
└── utils/              # Utilities (JWT, etc.)
```

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Validation**: Zod
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
