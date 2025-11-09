# Testing Strategy & Plan

This project now ships with automated unit test suites for both the backend (Node/Express) and frontend (React + Vite) layers. The goal is to give the instructor a concrete view into how critical logic is verified today and how to extend coverage as the system grows.

## Tooling Overview

- **Backend:** Jest + ts-jest run directly against the TypeScript source in `backend/src`. Tests live under `backend/tests` and rely on lightweight mocks for Mongoose models and Axios calls to keep them hermetic.
- **Frontend:** Vitest with the React Testing Library exercises UI flows and service helpers inside `frontend/src`. The suite runs in a jsdom environment so component logic (hooks, DOM updates) can be asserted without a browser.

## Current Coverage Highlights

### Backend

- **Quota & Queue Safety (`src/utils/dbUtils.ts`):** Tests verify that `tryConsumeDailyGenerate` correctly resets stale quotas, prevents overuse, and returns the next reset timestamp when users hit their cap. `claimQueuedBriefing` tests assert that leases are applied atomically to the oldest queued job.
- **News Service (`src/services/newsService.ts`):** Helper methods such as query building, parameter construction, historical window adjustment, and error parsing are validated. `fetchCustomArticles` is tested to ensure it retries automatically when the upstream API limits historical access windows.

### Frontend

- **Authentication Flow (`src/components/AuthScreen.tsx`):** Rendering tests simulate new vs. returning users, password validation, and the OTP handoff callbacks while mocking the auth API facade.
- **Auth API Facade (`src/services/authApi.ts`):** Ensures payload normalization, graceful fallback when lookups fail, and user-friendly error propagation for login/reset mutations.
- **User Profile Service (`src/services/userApi.ts`):** Confirms auth headers are added, profile updates keep the local cache in sync, and logout clears stored credentials.

## How to Run the Suites

```bash
# Backend (runs Jest + ts-jest)
cd backend
npm test

# Frontend (runs Vitest + RTL)
cd frontend
npm test
```
