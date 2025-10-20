# Personalized News Briefing Web App

A MERN stack application that generates personalized news briefings for users based on their preferences and interests.

## Overview

This project provides on-demand personalized news briefings through a web interface and mobile app. Users can set their preferences for topics, demographics, and interests, and receive AI-generated summaries of relevant news articles.

## Tech Stack

- **Frontend**: Next.js (React) with Tailwind CSS
- **Mobile**: Flutter (cross-platform)
- **Backend**: Express.js (Node.js)
- **Database**: MongoDB Atlas
- **AI/ML**: OpenAI GPT for summarization
- **Deployment**: DigitalOcean Droplet

## Features

- Email-based authentication with OTP
- Personalized news briefings based on user preferences
- Real-time briefing generation with status polling
- Cross-platform support (Web + Mobile)
- Daily generation limits per user
- Responsive design with modern UI

## Project Structure

```
packages/
├── contracts/          # Shared TypeScript schemas and DTOs
│   ├── src/
│   │   ├── domain/     # Domain models
│   │   ├── dto/        # Data transfer objects
│   │   └── errors/     # Error handling schemas
│   └── README.md
└── docs/
    └── Architecture.md # Detailed architecture documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account
- OpenAI API key
- News API key
- Flutter SDK (for mobile development)

### Installation

1. Clone the repository
2. Install dependencies: `npm install` or `pnpm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

### Environment Variables

```bash
# API
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news-briefing-app
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-...
NEWS_API_KEY=your-news-api-key
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-key
DAILY_GENERATE_CAP=3

# Web
NEXT_PUBLIC_API_BASE=/api
```

## Development

- **Web**: `npm run dev` (Next.js development server)
- **API**: `npm run dev` (Express.js with hot reload)
- **Mobile**: `flutter run` (Flutter development)

## Documentation

For detailed architecture information, API specifications, and implementation details, see [docs/Architecture.md](docs/Architecture.md).

## License

This project is part of a university course (POOSD - Principles of Object-Oriented Software Design).
