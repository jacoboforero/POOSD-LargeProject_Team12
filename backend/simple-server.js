const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request ID middleware
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || require("uuid").v4();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mock auth endpoints
app.post("/api/auth/otp/request", (req, res) => {
  // Validate request body
  if (!req.body.email || typeof req.body.email !== "string") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        details: [
          { field: "email", message: "Email is required and must be a string" },
        ],
      },
    });
  }

  console.log(`OTP requested for: ${req.body.email}`);
  res.json({ success: true });
});

app.post("/api/auth/otp/verify", (req, res) => {
  // Validate request body
  if (!req.body.email || typeof req.body.email !== "string") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        details: [
          { field: "email", message: "Email is required and must be a string" },
        ],
      },
    });
  }

  if (!req.body.code || typeof req.body.code !== "string") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        details: [
          { field: "code", message: "Code is required and must be a string" },
        ],
      },
    });
  }

  console.log(`OTP verification attempted for: ${req.body.email}`);
  res.json({
    token: "mock-jwt-token",
    user: {
      _id: "mock-user-id",
      email: req.body.email,
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
    },
  });
});

// Mock user endpoints
app.get("/api/me", (req, res) => {
  res.json({
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
  });
});

app.get("/api/me/usage", (req, res) => {
  res.json({
    totalBriefings: 0,
    completedBriefings: 0,
    queuedBriefings: 0,
    failedBriefings: 0,
    dailyUsage: 0,
    quota: { daily: 10, monthly: 100, remaining: 10 },
  });
});

// Mock briefing endpoints
app.post("/api/briefings/generate", (req, res) => {
  const briefingId = require("uuid").v4();
  res.json({ briefingId });
});

app.get("/api/briefings/:id/status", (req, res) => {
  res.json({
    _id: req.params.id,
    status: "done",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

app.get("/api/briefings/:id", (req, res) => {
  res.json({
    _id: req.params.id,
    userId: "mock-user-id",
    status: "done",
    summary: "This is a mock briefing summary",
    articles: [
      {
        title: "Sample Article",
        url: "https://example.com/article",
        summary: "Sample article summary",
        publishedAt: new Date(),
        source: "Example News",
      },
    ],
    topics: ["technology"],
    interests: ["AI"],
    jobIndustry: "tech",
    demographic: "professional",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong!",
    },
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
