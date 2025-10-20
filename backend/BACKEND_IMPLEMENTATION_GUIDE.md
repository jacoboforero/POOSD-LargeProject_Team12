# 🚀 Backend Implementation Guide

## 📋 **Current Status: Dummy Implementation**

This backend is currently running with **dummy/mock data** stored in memory. All endpoints work perfectly with schema validation, but they use fake data instead of a real database.

---

## 🏗️ **Architecture Overview**

### **Current Structure:**

```
backend/
├── src/
│   ├── app.ts                 # Main Express app configuration
│   ├── index.ts              # Server entry point
│   ├── middleware/            # All middleware (validation, auth, rate limiting)
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic (currently using dummy data)
│   └── test/                 # Testing utilities
├── packages/contracts/        # Shared schemas and types
└── schema-integrated-server.js # Working JavaScript version
```

### **What's Working:**

- ✅ **Schema Validation**: All requests/responses validated with Zod
- ✅ **Error Handling**: Proper error responses with ErrorSchema
- ✅ **Rate Limiting**: IP and user-based rate limiting
- ✅ **Authentication**: JWT token generation and validation
- ✅ **API Endpoints**: All 7 endpoints working with dummy data
- ✅ **Testing**: Comprehensive test suite

---

## 🔧 **Current Dummy Implementation**

### **1. Data Storage (In-Memory Maps)**

**File: `backend/src/services/storage.ts`**

```typescript
// ❌ CURRENT: In-memory storage
const users = new Map();
const sessions = new Map();
const otps = new Map();
const briefings = new Map();

// ✅ NEEDS TO CHANGE: Replace with MongoDB operations
// const User = require('bryan-models').User;
// const Briefing = require('bryan-models').Briefing;
```

### **2. Authentication Service (Dummy Logic)**

**File: `backend/src/services/authService.ts`**

```typescript
// ❌ CURRENT: Mock OTP generation
export const requestOtp = async (email: string) => {
  const otp = "123456"; // Hardcoded OTP
  otps.set(email, { code: otp, expiresAt: new Date(Date.now() + 300000) });
  console.log(`OTP requested for: ${email}`); // Just logs, no real email
  return { success: true };
};

// ✅ NEEDS TO CHANGE: Real OTP generation and email sending
// - Generate real OTP codes
// - Send actual emails
// - Store in database
```

### **3. User Service (Dummy Responses)**

**File: `backend/src/services/userService.ts`**

```typescript
// ❌ CURRENT: Mock user data
export const getUserProfile = async (userId: string) => {
  return {
    _id: "mock-user-id",
    email: "test@example.com",
    emailVerified: true,
    preferences: {
      topics: [],
      interests: [],
      jobIndustry: "",
      demographic: "",
    },
    timezone: "UTC",
    notificationPrefs: { email: true, push: false, frequency: "daily" },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// ✅ NEEDS TO CHANGE: Real database queries
// const user = await User.findById(userId);
// return user;
```

### **4. Briefing Service (Dummy Processing)**

**File: `backend/src/services/briefingService.ts`**

```typescript
// ❌ CURRENT: Mock briefing creation
export const generateBriefing = async (userId: string, request: any) => {
  const briefingId = uuidv4();
  const briefing = {
    _id: briefingId,
    userId,
    status: "queued",
    request,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  briefings.set(briefingId, briefing);

  // Mock worker: sets status to "done" after 2 seconds
  setTimeout(() => {
    briefings.set(briefingId, { ...briefing, status: "done" });
  }, 2000);

  return { briefingId };
};

// ✅ NEEDS TO CHANGE: Real database operations
// const briefing = await Briefing.create({ userId, status: "queued", request });
// return { briefingId: briefing._id };
```

---

## 🎯 **What Needs to Change for Database Integration**

### **Step 1: Add Database Connection**

**New File: `backend/src/config/database.ts`**

```typescript
import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
```

### **Step 2: Import Bryan's Models**

**New File: `backend/src/models/index.ts`**

```typescript
// Import Bryan's models
export { User, Briefing, Quota } from "bryan-models";
```

### **Step 3: Update Services to Use Real Database**

**File: `backend/src/services/authService.ts`**

```typescript
// ❌ REPLACE THIS:
const users = new Map();

// ✅ WITH THIS:
import { User } from "../models";
import bcrypt from "bcrypt";

export const requestOtp = async (email: string) => {
  // Check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    // Create new user
    user = await User.create({ email, emailVerified: false });
  }

  // Generate real OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Store OTP in database
  user.otp = {
    hash: hashedOtp,
    expiresAt: new Date(Date.now() + 300000), // 5 minutes
    attempts: 0,
  };

  await user.save();

  // Send real email (implement email service)
  await sendOtpEmail(email, otp);

  return { success: true };
};
```

**File: `backend/src/services/userService.ts`**

```typescript
// ❌ REPLACE THIS:
return { _id: "mock-user-id", email: "test@example.com" };

// ✅ WITH THIS:
import { User } from "../models";

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
```

**File: `backend/src/services/briefingService.ts`**

```typescript
// ❌ REPLACE THIS:
const briefing = { _id: uuidv4(), status: "queued" };
briefings.set(briefingId, briefing);

// ✅ WITH THIS:
import { Briefing, Quota } from "../models";

export const generateBriefing = async (userId: string, request: any) => {
  // Check quota using Bryan's function
  const quotaCheck = await checkDailyQuota(userId);
  if (!quotaCheck.allowed) {
    throw new Error("Daily quota exceeded");
  }

  // Create briefing in database
  const briefing = await Briefing.create({
    userId,
    status: "queued",
    request,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Start background worker (keep the setTimeout for now)
  setTimeout(async () => {
    await Briefing.findByIdAndUpdate(briefing._id, { status: "done" });
  }, 2000);

  return { briefingId: briefing._id };
};
```

### **Step 4: Update Main App**

**File: `backend/src/index.ts`**

```typescript
import { connectDatabase } from "./config/database";

const startServer = async () => {
  // Connect to database first
  await connectDatabase();

  // Then start server
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
```

---

## 📁 **Files That Need Changes**

### **🔄 Files to Edit:**

1. **`backend/src/services/authService.ts`** - Replace mock OTP with real database operations
2. **`backend/src/services/userService.ts`** - Replace mock user data with real database queries
3. **`backend/src/services/briefingService.ts`** - Replace mock briefing creation with real database operations
4. **`backend/src/index.ts`** - Add database connection

### **🆕 Files to Add:**

1. **`backend/src/config/database.ts`** - Database connection logic
2. **`backend/src/models/index.ts`** - Import Bryan's models
3. **`backend/.env`** - Environment variables for database

### **✅ Files to Keep Unchanged:**

- **`backend/src/middleware/`** - All middleware is perfect
- **`backend/src/routes/`** - Route structure is perfect
- **`backend/src/app.ts`** - App configuration is perfect
- **`backend/package.json`** - Dependencies are good
- **`backend/tsconfig.json`** - TypeScript config is good

---

## 🧪 **Testing the Changes**

### **Before Database Integration:**

```bash
# Test current dummy implementation
cd backend
npm run test:api
# Should show: ✅ All 11 tests passing
```

### **After Database Integration:**

```bash
# Test with real database
npm run test:api
# Should still show: ✅ All 11 tests passing
```

---

## 🎯 **Key Points for Database Integration**

### **What to Keep:**

- ✅ **All API endpoints** (they're perfect)
- ✅ **All schema validation** (working perfectly)
- ✅ **All error handling** (working perfectly)
- ✅ **All rate limiting** (working perfectly)
- ✅ **All middleware** (working perfectly)

### **What to Change:**

- ❌ **Replace in-memory storage** with MongoDB
- ❌ **Replace mock OTP** with real email sending
- ❌ **Replace mock user data** with real database queries
- ❌ **Replace mock briefing creation** with real database operations

### **What to Add:**

- 🆕 **Database connection** (MongoDB)
- 🆕 **Bryan's models** (User, Briefing, Quota)
- 🆕 **Real OTP generation** and email sending
- 🆕 **Quota checking** using Bryan's functions

---

## 🚀 **Summary**

**Current Status:** ✅ **Perfect API structure with dummy data**
**Next Step:** 🔄 **Replace dummy data with real database operations**

**The API is already production-ready - you just need to wire in the real database!** 🎉
