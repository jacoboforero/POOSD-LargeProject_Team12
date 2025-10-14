# 📦 `contracts` — Shared Schema & Types Package

This folder contains the **single source of truth** for all **data structures and API shapes** in our project.  
✅ Backend and frontend both import from here.  
✅ We define everything **once** and reuse it everywhere.

---

## 🧠 Why This Exists

When different parts of the app (API, frontend, mobile, workers, etc.) use their own ad-hoc data shapes, things **get out of sync** fast:

- Backend might send fields the frontend doesn’t expect.
- Frontend might expect fields that don’t exist.
- Renaming a field can silently break stuff.

👉 To avoid that, we define all shapes and contracts **centrally** here.

We use **[Zod](https://zod.dev)** to:

- Define the structure of data.
- Validate it at runtime (backend).
- Automatically get **TypeScript types** (frontend + backend).

---

## 🏗️ What’s in this package

Inside `packages/contracts/src/` you’ll find:

```
src/
  utils/           → shared helpers like ObjectId format, date, status enums
  errors/          → standard API error codes and shapes
  config/          → environment variable schema (validate .env)
  domain/          → “database shapes” for User, Briefing, etc.
  dto/             → request/response shapes for each API endpoint
  index.ts         → exports everything in one place
```

### ✅ `domain/`

These schemas describe **what we store in the database** and the core data structures of the app:

- `User.schema.ts` — what a user object looks like (email, preferences, limits, etc.).
- `Briefing.schema.ts` — a generated briefing job + result.
- `ArticleCache.schema.ts` — article caching for reuse.
- `AuditLog.schema.ts` — basic audit log events.

These are not tied to any frontend screen or specific API call — they’re **the real shape of data in the system**.

---

### ✅ `dto/` (Data Transfer Objects)

These schemas describe **what goes in and out of the API**:

- **auth/** — OTP login flow: `OtpRequest`, `OtpVerify`, `Session`.
- **users/** — profile info, preferences update, usage info, push tokens.
- **briefings/** — how to generate a briefing, get briefing status, list briefings.

These are the **payloads used in API requests and responses**.  
They’re built using Zod so the backend can validate inputs, and the frontend can import the exact types to know what it will receive.

---

### ✅ `utils/`

- `common.ts` defines **small reusable building blocks** like:
  - `objectId` — valid MongoDB IDs
  - `isoDate` — ISO-8601 timestamp strings
  - `briefingStatus` — all valid statuses for a briefing
  - `pushPlatform` — `"ios"` or `"android"`

These are used inside the other schemas.

---

### ✅ `errors/`

- `errorCodes.ts` — the set of standard error codes we use (e.g. `VALIDATION_FAILED`, `UNAUTHORIZED`).
- `errorSchema.ts` — the shape of error responses the API returns:
  ```json
  {
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Missing email field",
      "details": { ... }
    }
  }
  ```

Frontend can rely on this shape to **handle errors consistently**.

---

### ✅ `config/`

- `config.schema.ts` — schema for validating environment variables (e.g. `JWT_SECRET`, `MONGODB_URI`).
- Backend runs this at startup to **fail fast** if env vars are missing.

---

## 🧑‍💻 How to use these schemas

### 🟦 Backend usage (API, workers, etc.)

In backend code, we use the schemas to **validate incoming requests** and **shape outgoing responses**:

```ts
import { OtpRequestSchema } from "contracts";

app.post("/api/auth/otp/request", (req, res) => {
  const parsed = OtpRequestSchema.parse(req.body); // ✅ throws if invalid
  // do backend logic here...
});
```

And to **validate outgoing responses**:

```ts
import { SessionSchema } from "contracts";

const response = { token: "abc", user: {...} };
SessionSchema.parse(response); // ✅ ensures we’re sending what the frontend expects
res.json(response);
```

✅ This gives strong guarantees: if the API and contracts disagree, we catch it early.

---

### 🟨 Frontend usage (Next.js, Flutter, etc.)

Frontend doesn’t need to use Zod to validate (it _can_, but usually doesn’t).  
Frontend just needs the **TypeScript types** that Zod gives us automatically:

```ts
import type { Session } from "contracts";

async function login(email: string, code: string): Promise<Session> {
  const res = await fetch("/api/auth/otp/verify", { method: "POST" });
  const data: Session = await res.json();
  // ✅ TypeScript now knows `data.user.email` etc.
  return data;
}
```

This means:

- No guessing what fields exist.
- Autocomplete just works.
- If backend changes something, TypeScript errors will appear in frontend code.

> **Note**: Flutter devs can use the OpenAPI spec later if we generate one, or just mirror the DTO shape manually.

---

## 🧰 Tips & Conventions

- **DO NOT** redefine shapes in frontend or backend. Always import from `contracts`.
- **DO NOT** rename fields without updating the schema here first.
- If you add new fields, make them optional unless required for MVP.
- If you change a DTO, check both backend and frontend to make sure nothing breaks.
- Use `pick` / `omit` if you need smaller shapes derived from domain schemas.

---

## 🚀 Example: Briefing lifecycle (end-to-end)

- Backend uses `BriefingGenerateRequestSchema` to validate the request body.
- It creates a new `Briefing` object in the database (following `BriefingSchema`).
- Later, frontend calls `/api/briefings/:id` and gets a response validated by `BriefingResponseSchema`.
- Frontend uses the **inferred `BriefingResponse` type** to render the page safely.

---

## 🧭 Naming conventions

- `Something.schema.ts` → a Zod schema file.
- `SomethingSchema` → the actual schema object.
- `Something` (no “Schema”) → the inferred TypeScript type.

```ts
import { UserSchema } from "contracts";
import type { User } from "contracts";
```

- Domain = DB shape
- DTO = request/response shape
- Utils = building blocks
- Errors = standard error responses

---

## 🧪 How to test locally

You can quickly check if a shape works:

```ts
import { UserSchema } from "contracts";

const testUser = {
  _id: "507f1f77bcf86cd799439011",
  email: "alice@example.com",
  emailVerified: true,
  preferences: { topics: ["tech"], interests: [] },
  limits: {
    dailyGenerateCap: 3,
    generatedCountToday: 0,
    resetAt: "2025-10-14T00:00:00Z",
  },
  createdAt: "2025-10-14T00:00:00Z",
  updatedAt: "2025-10-14T00:00:00Z",
};

UserSchema.parse(testUser); // ✅ no errors
```

If validation fails, you’ll get a clear error message showing **exactly what’s wrong**.

---

## 🛑 Common mistakes

- ❌ “I’ll just define the shape in the frontend too” → No. Import the type.
- ❌ “I’ll just ignore validation errors” → Don’t. They exist to catch bugs early.
- ❌ “I’ll edit the schema in backend folder” → Wrong place. Do it here.

---

## 📝 Summary

- **This package = single source of truth for data shapes.**
- **Backend:** use `.parse()` to validate input/output.
- **Frontend:** import types for autocomplete and safety.
- Updating schemas here updates the whole app.

---

## 🧑‍🤝‍🧑 Contributors

When adding or changing a schema:

1. Update the schema file here.
2. Re-export in `index.ts` if it’s new.
3. Check both backend & frontend compile without errors.
4. Test with example payloads.
5. Commit with a clear message:
   ```
   feat(contracts): add X to Y schema
   ```

---

## 📚 Useful Links

- Zod docs → https://zod.dev
- MongoDB ObjectId format → https://www.mongodb.com/docs/manual/reference/method/ObjectId/
- REST error response best practices → https://datatracker.ietf.org/doc/html/rfc7807
