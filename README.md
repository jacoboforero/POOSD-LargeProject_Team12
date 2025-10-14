# Personalized News Briefing Web App — Architecture README

> MERN stack (MongoDB, Express.js, React/Next.js, Node.js) deployed on DigitalOcean. MVP focuses on on‑demand personalized briefings; scheduled briefings are a stretch goal.

---

## 1) Overview

**Goal:** Generate a personalized news briefing for a user on demand via a backend endpoint that: (1) reads user preference fields, (2) queries a news API for relevant articles, (3) fetches full article text when possible, (4) summarizes with an LLM, and (5) returns a structured briefing to the client.

**MVP Scope:**

- Email-based 2‑step authentication (OTP).
- User profile with explicit preferences (topics, demographics, job/industry, interests).
- `POST /api/briefings/generate` (asynchronous) → returns a `briefingId` and status; client polls `GET /api/briefings/:id`.
- Global, English-language news.
- Basic daily generation cap per user.
- Minimal safety, testing, and observability.

**Stretch:** Scheduled daily briefings and a history feed (`GET /api/briefings?date=YYYY-MM-DD`).

---

## 2) High-Level Architecture

```
+-----------------------+          +------------------------+        +----------------------+
|    Next.js Web UI     |  HTTPS   |   Express.js API       |        |   MongoDB Atlas      |
|  (React + Tailwind)   +--------->|  (Node.js on DO Droplet)| +<------>|  (Managed Cloud)     |
|  - Auth screens       |          |  - Auth, email/pass    |        |  - users             |
|  - Generate briefing  |          |  - Briefing jobs       |        |  - briefings         |
|  - Briefing viewer    |          |  - Rate limiting       |        |  - (optional) jobs   |
+-----------+-----------+          +-----------+------------+        +----------------------+
            |                                   |
            |                                   v
            |                        +-----------------------+
            |                        |  News API Provider    |
            |                        |  (Third-party API)    |
            |                        +-----------+-----------+
            |                                    |
            |                                    v
            |                        +-----------------------+
            |                        |  Article Fetcher      |
            |                        |  (HTTP + Readability) |
            |                        +-----------+-----------+
            |                                    |
            |                                    v
            |                        +-----------------------+
            |                        |  LLM Summarizer       |
            |                        | (OpenAI)              |
            |                        +-----------------------+
            |
            |
+-----------------------+          +------------------------+
|    Flutter Mobile     |  HTTPS   |   Express.js API       |
|  (Cross-platform)    +--------->|  (Node.js on DO Droplet)|
|  - Auth screens       |          |  - Same API endpoints  |
|  - Generate briefing  |          |  - Shared backend     |
|  - Briefing viewer    |          |  - Mobile-optimized   |
+-----------------------+          +------------------------+
```

- **Hosting:** DigitalOcean Droplet (Ubuntu VPS) with Nginx reverse proxy and PM2 process manager. Three applications: `web` (Next.js), `api` (Express), and `mobile` (Flutter). Optional fourth: a one-off **Cron Job** for scheduling (stretch goal).
- **State:** MongoDB Atlas (managed cloud database). Connection via Mongoose ODM.
- **Secrets:** Environment variables stored on the Droplet.

---

## 3) Data Model (MongoDB)

### 3.1 `users` collection

```jsonc
{
  "_id": ObjectId,
  "email": "user@example.com",
  "emailVerified": true,
  "otp": {                 // transient; store hashed OTP + expiry
    "hash": "...",
    "expiresAt": ISODate
  },
  "preferences": {         // explicit-only signals for MVP
    "topics": ["technology", "finance"],
    "demographic": "GenZ",         // free-form or enum
    "jobIndustry": "software",     // free-form or enum
    "interests": ["AI", "startups", "climate"]
  },
  "limits": {
    "dailyGenerateCap": 3,          // per-user cap
    "generatedCountToday": 0,
    "resetAt": ISODate              // UTC midnight roll-over
  },
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### 3.2 `briefings` collection

```jsonc
{
  "_id": ObjectId,
  "userId": ObjectId,
  "status": "queued" | "fetching" | "summarizing" | "done" | "error",
  "request": {                     // immutable for audit/repro
    "topics": ["technology", "AI"],
    "interests": ["LLMs"],
    "jobIndustry": "software",
    "demographic": "GenZ",
    "source": "news_api"
  },
  "articles": [                    // raw metadata; optionally trimmed
    {
      "title": "...",
      "url": "https://...",
      "source": "The Verge",
      "publishedAt": ISODate,
      "language": "en",
      "content": "<extracted full text or null>",
      "fetchStatus": "ok" | "skipped" | "failed"
    }
  ],
  "summary": {                     // final structured output
    "sections": [
      { "category": "technology", "text": "paragraph..." },
      { "category": "jobIndustry", "text": "paragraph..." },
      { "category": "interests", "text": "paragraph..." }
    ],
    "generatedAt": ISODate,
    "llm": {
      "provider": "openai",
      "model": "gpt-4o-mini",
      "inputTokens": 0,
      "outputTokens": 0
    }
  },
  "error": { "message": "..." },
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

> **Note:** For MVP simplicity, we do **not** maintain a separate `jobs` collection. The `briefings.status` doubles as job state. If you later introduce a queue, add a `jobs` collection keyed by `briefingId`.

---

## 4) Authentication & Authorization

### 4.1 Email/Password Authentication

- **Flow**: `POST /api/auth/login` with email and password → validate credentials → return JWT token.
- On successful login, return a **JWT token** that the client stores in localStorage.
- **Registration**: `POST /api/auth/register` with email, password, and optional user details.

### 4.2 JWT Token Management

- **JWT in localStorage** for web clients; secure token storage for mobile clients.
- Token contents: `{ sub: userId, iat, exp }`. Keep lifespan moderate (e.g., 24 hours) with optional refresh.
- Client includes token in Authorization header: `Bearer <token>` for API requests.
- No server session store required; stateless authentication via JWT signature verification.

### 4.3 Basic Middleware

- `authRequired` extracts JWT from cookie, verifies signature.
- `rateLimit` per user (e.g., `express-rate-limit`) + daily generate cap in DB.

---

## 5) External Services

- **News API**: Third-party news API service (global coverage). Query by topics/keywords derived from preferences.
- **Article Text Extraction**: Attempt full‑text fetch of article URLs when allowed.

  - Fetch via `got/axios` → `jsdom` + **Mozilla Readability** to extract main content.
  - Respect robots.txt when feasible; fallback to API snippets if extraction fails or is disallowed.

- **LLM**: OpenAI (env‑configurable model, default `gpt-4o-mini`).

  - Summarize to **≤ 3 sections** (topic, industry, interests), one paragraph each.
  - Token guardrails: trim article text, chunk if needed, summarize per-article then synthesize.

- **Email**: Use **Resend** (or SendGrid) for OTP emails; both have free developer tiers. From‑address via DO-managed domain or custom domain.

---

## 6) API Design

Base URL for API service: `/api` (behind DO App Platform). All responses `application/json`.

### 6.1 Auth

- `POST /api/auth/register`

  - Body: `{ email, password, preferences? }`
  - Side effects: hash password, create user document, return JWT token.
  - 200: `{ user: { _id, email, preferences }, token: "jwt_token" }`

- `POST /api/auth/login`

  - Body: `{ email, password }`
  - **Web**: returns `{ user: { _id, email, preferences }, token: "jwt_token" }` for localStorage storage
  - **Mobile**: returns `{ user: { _id, email, preferences }, token: "jwt_token" }` for secure storage

- `POST /api/auth/logout`

  - **Web**: Returns success; client removes token from localStorage.
  - **Mobile**: Returns success; client removes stored token.

- `POST /api/auth/refresh` (optional)

  - Body: `{ token }`
  - Returns new JWT token for token rotation.

### 6.2 User & Preferences

- `GET /api/me` → current user profile.
- `PUT /api/me/preferences` → update `preferences` subdocument. Body mirrors schema (validated).

### 6.3 Briefings (MVP async flow)

- `POST /api/briefings/generate`

  - Body: optional overrides `{ topics?, interests?, jobIndustry?, demographic? }`
  - Behavior: checks daily cap → creates `briefings` doc with `status:"queued"` → immediately returns `{ briefingId }`.

- Background worker (in‑process interval or minimal job loop):

  - Transitions `queued → fetching → summarizing → done` (or `error`).

- `GET /api/briefings/:id`

  - Returns full briefing document (without internal tokens) for polling.

- `GET /api/briefings` (optional for history)

  - Query: `?limit=10&offset=0`.

**Response shape (example for `GET /api/briefings/:id`):**

```jsonc
{
  "_id": "...",
  "status": "done",
  "summary": {
    "sections": [
      { "category": "technology", "text": "..." },
      { "category": "jobIndustry", "text": "..." },
      { "category": "interests", "text": "..." }
    ],
    "generatedAt": "2025-10-13T12:00:00Z"
  },
  "articles": [{ "title": "...", "url": "...", "source": "..." }]
}
```

---

## 7) Frontend (Next.js Web + Flutter Mobile)

### 7.1 Web Frontend (Next.js + Tailwind)

- **Why Next.js**: simple routing, API typing (via shared types), good DX.
- **Auth UX**: email → enter OTP → set cookie by API → redirect to dashboard.
- **State/Data fetching**: **TanStack Query (React Query)** for request caching and polling `GET /api/briefings/:id`.
- **UI**: Tailwind CSS utility classes; minimal components for forms, cards, and lists.
- **Pages**:

  - `/login` (request OTP, verify)
  - `/onboarding` (collect preferences)
  - `/dashboard` (Generate button, status, recent briefings)
  - `/briefings/[id]` (viewer)

### 7.2 Mobile Frontend (Flutter)

- **Why Flutter**: cross-platform (iOS/Android), native performance, shared codebase.
- **Auth UX**: email → enter OTP → secure token storage → navigate to dashboard.
- **State/Data fetching**: **Riverpod** or **Bloc** for state management and API calls.
- **UI**: Material Design 3 components; responsive layouts for phones/tablets.
- **Screens**:

  - `/login` (request OTP, verify)
  - `/onboarding` (collect preferences)
  - `/dashboard` (Generate button, status, recent briefings)
  - `/briefings/[id]` (viewer)

### 7.3 Shared API Integration

- **Common API**: Both frontends consume the same REST API endpoints.
- **Authentication**: Web uses HTTP-only cookies, mobile uses secure token storage.
- **Responsive Design**: API returns consistent JSON; frontends handle presentation.
- **Offline Support**: Mobile app includes basic offline caching (stretch goal).

---

## 8) Rate Limiting & Quotas

- **Express middleware** using `express-rate-limit` keyed by user ID.
- **Daily cap** stored on user. On generation request: if `generatedCountToday >= dailyGenerateCap`, return `429`.
- Nightly reset via first write after date change or via a tiny cron (optional).

---

## 9) Error Handling & Minimal Safety

- Normalize errors via an `ApiError` class (code, message, safe details).
- **Content safety**: strip prompts of user‑provided URLs in LLM system prompt; ignore embedded instructions in fetched articles; basic profanity filter optional.
- Log `error.message` and stack in server logs (no PII in logs).

---

## 10) Deployment (DigitalOcean)

- **DigitalOcean Droplet**: Ubuntu VPS with manual setup:

  1. `web` → Next.js (build `npm run build`, serve with `npm start`).
  2. `api` → Express (build `npm run build`, run with PM2 `pm2 start dist/index.js`).
  3. `mobile` → Flutter (build for iOS/Android, deploy to app stores).
  4. **Nginx**: Reverse proxy configuration for web and API routing.
  5. **PM2**: Process manager for Node.js applications.

- **MongoDB**: MongoDB Atlas cloud database. Connection string in environment variables.
- **Domains/HTTPS**: Nginx handles TLS termination; configure SSL certificates.
- **Secrets**: Set `OPENAI_API_KEY`, `NEWS_API_KEY`, `RESEND_API_KEY` (or SendGrid), `JWT_SECRET`, `MONGODB_URI` on the Droplet.

---

## 11) Local Development

- **Requirements**: Node 20+, pnpm/npm, MongoDB Atlas connection, Flutter SDK, OpenAI key.
- `packages/` monorepo (optional) or three folders `apps/web`, `apps/api`, and `apps/mobile`.
- **Scripts**:

  - Web: `dev`, `build`, `start`.
  - API: `dev` (ts-node nodemon), `build` (tsc), `start` (node).
  - Mobile: `flutter run`, `flutter build apk/ios`, `flutter test`.

- **Database**: Mongoose ODM for schema definition and database operations.

- **.env.example** (top-level or per app):

```bash
# API
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news-briefing-app
JWT_SECRET=change-me
OPENAI_API_KEY=sk-...
NEWS_API_KEY=...
EMAIL_PROVIDER=resend
RESEND_API_KEY=...
DAILY_GENERATE_CAP=3

# Web
NEXT_PUBLIC_API_BASE=/api
```

---

## 12) Implementation Details

### 12.1 Article Fetching & Summarization Pipeline

1. Build keyword set from preferences (limit 3 categories max for MVP).
2. Query news API for recent articles (e.g., last 24–48 hours).
3. For each selected article (cap 6–9 total):

   - Attempt full‑text fetch with `got` → `jsdom` → `Readability`.
   - Truncate to max N characters/tokens.
   - Summarize per‑article (short). Store `content` minimally (or omit if ToS disallows storage).

4. Synthesize final 3‑paragraph briefing (topic, industry, interests).

**Prompt sketch** (system): “You are a concise news editor. Produce exactly three paragraphs: Technology, Industry, Interests. Each ≤ 90 words, factual, neutral tone, include source mentions inline.”

### 12.2 Background Worker (no external queue)

- A simple in‑process loop (setInterval or lightweight job runner) that picks `status:"queued"` documents, marks them `fetching`, runs pipeline, and updates the doc.
- Concurrency guard with a DB claim (e.g., update with filter `status:"queued"` + `updatedAt < now-1m`) to avoid duplicate processing across multiple pods.

> For higher reliability later, swap to BullMQ + Upstash/Redis.

### 12.3 Validation & Types

- **Mongoose Schemas**: Define user and briefing models with validation rules.
- Zod schemas for request/response DTOs.
- Central `types` shared between web and api (optional).

---

## 13) Security Notes (MVP‑appropriate)

- HTTP‑only, Secure cookies; SameSite=Lax.
- CORS: allow only the Web origin.
- Input validation for all endpoints; sanitize HTML from article fetches.
- Time‑boxed OTP validity (10 min) and max attempts per email per hour.

---

## 14) Testing Strategy (minimal)

- **API**: Supertest for `/auth/*` flow and `/briefings/generate` success path.
- **Unit**: preference→query builder, LLM prompt shaper, Readability wrapper.
- **E2E (optional)**: one happy-path from login to briefing view using Playwright.

---

## 15) CI/CD (GitHub Actions)

- Workflows:

  - `lint-test.yml`: Node setup, install, build, run tests for web/API; Flutter setup, build, test for mobile.
  - `deploy-droplet.yml`: on `main` push → build applications → use `scp` to copy files to Droplet → `ssh` to install dependencies and restart services with PM2.
  - `deploy-mobile.yml`: on `main` push → build Flutter app → deploy to app stores (manual approval for production).

---

## 16) Observability (simplest)

- Rely on DO App logs.
- Add request logging with `morgan` (omit bodies). Optional error tracking with Sentry if time permits.

---

## 17) Stretch Goal: Scheduled Briefings

- **Option A (simplest on DO)**: App Platform **Cron** component triggers `POST /api/briefings/generate` per user daily 7am UTC (or user’s local TZ if stored).
- **Option B**: Node worker with `node-cron` iterating eligible users.
- Store results in `briefings`; frontend `GET /api/briefings?date=...` shows daily list.

---

## 18) Open Questions / Future Enhancements

- Multi‑language support beyond English.
- Implicit personalization signals (clicks, dwell) once MVP is stable.
- Richer summary layout (bullets, citations, sentiment).
- Source deduplication and bias diversification.
- News API fallbacks and cost monitoring.

---

## 19) Folder Structure (suggested)

```
repo/
  apps/
    api/
      src/
        index.ts
        routes/
          auth.ts
          users.ts
          briefings.ts
        services/
          news.ts
          fetcher.ts
          summarizer.ts
          otp.ts
        middleware/
          auth.ts
          rateLimit.ts
        models/
          User.ts
          Briefing.ts
        utils/
          readability.ts
      package.json
    web/
      app/ (or pages/)
        login.tsx
        onboarding.tsx
        dashboard.tsx
        briefings/[id].tsx
      lib/api.ts
      components/
      styles/
      package.json
    mobile/
      lib/
        screens/
          login_screen.dart
          onboarding_screen.dart
          dashboard_screen.dart
          briefing_screen.dart
        services/
          api_service.dart
          auth_service.dart
        models/
          user_model.dart
          briefing_model.dart
        widgets/
        main.dart
      pubspec.yaml
  .github/workflows/
  README.md (this file)
  .env.example
```

---

## 20) Mobile-Specific Considerations

### 20.1 Authentication Differences

- **Web**: Uses JWT tokens stored in localStorage; manual token management.
- **Mobile**: Uses secure token storage (Keychain/Keystore); manual token refresh.
- **API**: Supports JWT authentication via Authorization header for both platforms.

### 20.2 Mobile UX Enhancements

- **Push Notifications**: Optional briefing completion notifications.
- **Offline Support**: Cache recent briefings for offline viewing.
- **Biometric Auth**: Optional fingerprint/face ID for quick access.
- **Responsive Design**: Optimized for various screen sizes and orientations.

### 20.3 Cross-Platform Consistency

- **Shared API**: Both platforms consume identical REST endpoints.
- **Data Models**: Consistent JSON schemas across web and mobile.
- **Feature Parity**: All core functionality available on both platforms.

---

## 21) Acceptance Criteria (MVP)

- A new user can request an OTP, verify, set preferences, and generate a briefing on **both web and mobile**.
- The generate call returns quickly with an ID; polling displays status transitions to `done` within a reasonable time.
- The final briefing shows **three paragraphs** mapped to the three categories.
- Daily cap enforcement works across both platforms.
- Deploys on DigitalOcean (web/API) and app stores (mobile) and works for a handful of users.

---

## 22) License & Compliance Notes

- Ensure compliance with news API terms of service. Only cache minimal text for summarization; store URLs and metadata primarily.
- Respect robots.txt and site ToS when fetching full content; fall back to summaries if disallowed.
