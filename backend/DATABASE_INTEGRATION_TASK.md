# 🗄️ Database Integration Task

## 📋 **Task Overview**

**Objective:** Replace the current dummy/mock data implementation with real MongoDB database operations using Bryan's models.

**Current Status:** ✅ **Perfect API structure with dummy data**
**Target Status:** ✅ **Perfect API structure with real database**

---

## 🎯 **What You Need to Do**

### **Step 1: Install Dependencies**

```bash
cd backend
npm install mongoose
npm install @types/mongoose --save-dev
```

### **Step 2: Add Database Connection**

**Create: `backend/src/config/database.ts`**

```typescript
import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};
```

### **Step 3: Import Bryan's Models**

**Create: `backend/src/models/index.ts`**

```typescript
// Import Bryan's models
export { User, Briefing, Quota } from "bryan-models";
```

### **Step 4: Update Main App**

**Edit: `backend/src/index.ts`**

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

### **Step 5: Update Services**

**Edit: `backend/src/services/authService.ts`**

```typescript
// ❌ REPLACE THIS:
const users = new Map();
const otps = new Map();

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

  // TODO: Send real email (implement email service)
  console.log(`OTP for ${email}: ${otp}`); // For now, just log

  return { success: true };
};

export const verifyOtp = async (email: string, code: string) => {
  const user = await User.findOne({ email });
  if (!user || !user.otp) {
    throw new Error("OTP not found");
  }

  // Check if OTP is expired
  if (new Date() > new Date(user.otp.expiresAt)) {
    throw new Error("OTP expired");
  }

  // Verify OTP
  const isValid = await bcrypt.compare(code, user.otp.hash);
  if (!isValid) {
    user.otp.attempts += 1;
    await user.save();
    throw new Error("Invalid OTP");
  }

  // Clear OTP and mark email as verified
  user.otp = undefined;
  user.emailVerified = true;
  await user.save();

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);

  return { token, user };
};
```

**Edit: `backend/src/services/userService.ts`**

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

export const getUserUsage = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // TODO: Implement real usage calculation
  return {
    dailyGenerateCap: 5,
    generatedToday: 0,
    resetAt: new Date().toISOString(),
  };
};
```

**Edit: `backend/src/services/briefingService.ts`**

```typescript
// ❌ REPLACE THIS:
const briefings = new Map();

// ✅ WITH THIS:
import { Briefing, Quota } from "../models";

export const generateBriefing = async (userId: string, request: any) => {
  // TODO: Check quota using Bryan's function
  // const quotaCheck = await checkDailyQuota(userId);
  // if (!quotaCheck.allowed) {
  //   throw new Error('Daily quota exceeded');
  // }

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

export const getBriefingStatus = async (briefingId: string) => {
  const briefing = await Briefing.findById(briefingId);
  if (!briefing) {
    throw new Error("Briefing not found");
  }

  return {
    status: briefing.status,
    statusReason: briefing.statusReason,
    updatedAt: briefing.updatedAt,
  };
};

export const getBriefingDetails = async (briefingId: string) => {
  const briefing = await Briefing.findById(briefingId);
  if (!briefing) {
    throw new Error("Briefing not found");
  }

  return briefing;
};
```

### **Step 6: Add Environment Variables**

**Create: `backend/.env`**

```bash
MONGODB_URI=mongodb://localhost:27017/news-briefing
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DAILY_QUOTA_LIMIT=5
MONTHLY_QUOTA_LIMIT=100
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 **Testing Your Changes**

### **1. Test Database Connection**

```bash
npm run dev
# Should show: ✅ Connected to MongoDB
```

### **2. Test All Endpoints**

```bash
npm run test:api
# Should show: ✅ All 11 tests passing
```

### **3. Test with Real Data**

```bash
# Request OTP
curl -X POST http://localhost:3001/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check database - should see user created
```

---

## 📁 **Files You Need to Edit**

### **🔄 Edit These Files:**

1. **`backend/src/services/authService.ts`** - Replace mock OTP with real database operations
2. **`backend/src/services/userService.ts`** - Replace mock user data with real database queries
3. **`backend/src/services/briefingService.ts`** - Replace mock briefing creation with real database operations
4. **`backend/src/index.ts`** - Add database connection

### **🆕 Create These Files:**

1. **`backend/src/config/database.ts`** - Database connection logic
2. **`backend/src/models/index.ts`** - Import Bryan's models
3. **`backend/.env`** - Environment variables for database

### **✅ Keep These Files Unchanged:**

- **`backend/src/middleware/`** - All middleware is perfect
- **`backend/src/routes/`** - Route structure is perfect
- **`backend/src/app.ts`** - App configuration is perfect

---

## 🎯 **Key Points**

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

## 🚀 **Success Criteria**

**✅ All tests pass:** `npm run test:api` shows 11/11 tests passing
**✅ Database connected:** Server logs show "Connected to MongoDB"
**✅ Real data stored:** Check MongoDB to see actual user/briefing documents
**✅ API still works:** All endpoints return proper responses

---

## 📞 **Need Help?**

1. **Check the logs** - Look for database connection errors
2. **Verify environment variables** - Make sure MONGODB_URI is set
3. **Test incrementally** - Start with one service, then move to the next
4. **Use the working version** - `node schema-integrated-server.js` still works for reference

**The API structure is already perfect - you just need to wire in the real database!** 🎉
