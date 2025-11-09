# IntelliBrief Web Client

React + Vite prototype that drives the IntelliBrief authentication, onboarding, and briefing generation flows against the Express backend.

## 🔧 Prerequisites

- Node.js 20+
- Backend API running locally (defaults to `http://localhost:3002`, but see proxy notes below)
- npm 10+ (bundled with Node 20)

## 🚀 Getting Started

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The Vite dev server listens on **http://localhost:3000** and proxies any `/api/*` request to **http://localhost:3001**. Set your backend `PORT=3001` (in `backend/.env`) or update `vite.config.ts` if you prefer another port.

To build for production:

```bash
npm run build   # emits static assets in dist/
npm run preview # optional smoke test of the built bundle
```

## 📁 Project Structure

```
src/
├── App.tsx                 # Client-side router for auth/register/landing flows
├── components/             # Auth, OTP verification, password reset forms
├── pages/                  # Landing + onboarding screens
├── services/
│   ├── authApi.ts          # REST client for /api/auth endpoints
│   └── userApi.ts          # REST client for /api/me endpoints
├── hooks/                  # Local state helpers
├── styles/                 # Global CSS
└── setupTests.ts           # RTL/Vitest config
```

State is stored in `localStorage` (`token` + `user`) so browser refreshes keep the last session.

## 🔐 Supported Flows

- **Check existing user** (`/api/auth/check-user`) to decide whether to show the password field.
- **Registration** with onboarding preferences, optional password, and OTP verification via email.
- **Login** via password + emailed OTP or legacy OTP-only path.
- **Password reset** (`forgot-password`, `verify-reset-code`, `reset-password`).
- **Profile + usage fetch** once a JWT is stored.

All network helpers live in `src/services`. They rely on the Vite dev proxy, so you do **not** configure a `VITE_*` env var today; update `vite.config.ts` if your backend runs on a different host/port.

## 🧪 Testing

```bash
npm test          # Vitest + React Testing Library
npm run lint      # ESLint (flat config)
```

Key suites:

- `src/components/AuthScreen.test.tsx` – login/register happy paths + errors
- `src/services/authApi.test.ts` – DTO normalization + error propagation
- `src/services/userApi.test.ts` – Authorization header + caching

## ⚙️ Environment Notes

- The dev proxy target (`http://localhost:3001`) lives in `vite.config.ts`. Update `target` if your backend listens on `3002` or set `PORT=3001` in `backend/.env` to match.
- `FRONTEND_URL` in the backend `.env` should include `http://localhost:3000` so CORS succeeds in development.
- When deployed, the React build is copied to `/root/POOSD/POOSD-LargeProject_Team12/frontend/dist` and served by Express (`app.ts` static handler).

## 🆘 Troubleshooting

- **401 after login:** Confirm the OTP verification step succeeded and that the JWT is stored in `localStorage`. Clear storage if the payload schema changed.
- **CORS errors:** Ensure the backend `FRONTEND_URL` includes `http://localhost:3000` (dev) or update `app.ts` to allow your domain.
- **Proxy mismatch:** If backend runs on `3002`, either change `PORT` to `3001` or update `vite.config.ts → server.proxy['/api'].target`.
- **OTP email missing:** Check backend logs; when SMTP fails it logs the OTP to the console and rethrows the error propagated through the UI.

## 📦 Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `npm run dev`  | Start Vite dev server with API proxy         |
| `npm run build`| Type-check + build production assets         |
| `npm run preview` | Serve the production build locally        |
| `npm run lint` | ESLint (flat config)                         |
| `npm test`     | Vitest + React Testing Library suites        |

---

Maintained by POOSD Team 12. The backend is expected to live at `https://poosdproj.xyz` in production; configure DNS/CDN as needed when hosting the built `dist/` assets separately.
