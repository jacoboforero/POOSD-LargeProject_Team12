import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Request ID middleware
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Define schemas inline to avoid import issues
const OtpRequestSchema = z.object({
  email: z.string().email(),
});

const OtpVerifySchema = z.object({
  email: z.string().email(),
  code: z.string(),
});

const SessionSchema = z.object({
  token: z.string(),
  user: z.object({
    _id: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    preferences: z.object({
      topics: z.array(z.string()),
      interests: z.array(z.string()),
      jobIndustry: z.string(),
      demographic: z.string(),
    }),
    timezone: z.string(),
    notificationPrefs: z.object({
      email: z.boolean(),
      push: z.boolean(),
      frequency: z.string(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

const MeResponseSchema = z.object({
  _id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  preferences: z.object({
    topics: z.array(z.string()),
    interests: z.array(z.string()),
    jobIndustry: z.string(),
    demographic: z.string(),
  }),
  timezone: z.string(),
  notificationPrefs: z.object({
    email: z.boolean(),
    push: z.boolean(),
    frequency: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UsageResponseSchema = z.object({
  dailyGenerateCap: z.number(),
  generatedToday: z.number(),
  resetAt: z.string(),
});

const BriefingGenerateRequestSchema = z.object({
  topics: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  jobIndustry: z.string().optional(),
  demographic: z.string().optional(),
});

const BriefingStatusResponseSchema = z.object({
  _id: z.string(),
  status: z.enum(["error", "queued", "fetching", "summarizing", "done"]),
  statusReason: z.string().optional(),
  updatedAt: z.string(),
});

const BriefingResponseSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  status: z.enum(["error", "queued", "fetching", "summarizing", "done"]),
  request: z.object({
    source: z.string(),
    topics: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    jobIndustry: z.string().optional(),
    demographic: z.string().optional(),
  }),
  summary: z.object({
    sections: z.array(
      z.object({
        category: z.string(),
        text: z.string(),
      })
    ),
    generatedAt: z.string(),
    llm: z.object({
      provider: z.string(),
      model: z.string(),
      inputTokens: z.number(),
      outputTokens: z.number(),
    }),
  }),
  articles: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      source: z.string().optional(),
      publishedAt: z.string().optional(),
      language: z.string().optional(),
      content: z.string().optional(),
      fetchStatus: z.enum(["ok", "skipped", "failed"]).optional(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

// Helper function to validate request body
const validateRequestBody = (schema: z.ZodSchema) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorResponse = ErrorSchema.parse({
          error: {
            code: "VALIDATION_FAILED",
            message: "Validation failed",
            details: error.errors,
          },
        });
        return res.status(400).json(errorResponse);
      }
      next(error);
    }
  };
};

// Helper function to validate response
const validateResponse = (schema: z.ZodSchema) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const originalJson = res.json;
    res.json = function (data: any) {
      try {
        const validatedData = schema.parse(data);
        return originalJson.call(this, validatedData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Response validation failed:", error.errors);
          const errorResponse = ErrorSchema.parse({
            error: {
              code: "INTERNAL_ERROR",
              message: "Response validation failed",
              details: error.errors,
            },
          });
          return originalJson.call(this, errorResponse);
        }
        return originalJson.call(this, data);
      }
    };
    next();
  };
};

// POST /api/auth/otp/request - Uses OtpRequestSchema
app.post(
  "/api/auth/otp/request",
  validateRequestBody(OtpRequestSchema),
  validateResponse(z.object({ success: z.boolean() })),
  (req, res) => {
    console.log(`OTP requested for: ${req.body.email}`);
    res.json({ success: true });
  }
);

// POST /api/auth/otp/verify - Uses OtpVerifySchema and SessionSchema
app.post(
  "/api/auth/otp/verify",
  validateRequestBody(OtpVerifySchema),
  validateResponse(SessionSchema),
  (req, res) => {
    console.log(`OTP verification attempted for: ${req.body.email}`);

    // Create response that matches SessionSchema
    const sessionResponse = SessionSchema.parse({
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    res.json(sessionResponse);
  }
);

// GET /api/me - Uses MeResponseSchema
app.get("/api/me", validateResponse(MeResponseSchema), (req, res) => {
  const meResponse = MeResponseSchema.parse({
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.json(meResponse);
});

// GET /api/me/usage - Uses UsageResponseSchema
app.get("/api/me/usage", validateResponse(UsageResponseSchema), (req, res) => {
  const usageResponse = UsageResponseSchema.parse({
    dailyGenerateCap: 10,
    generatedToday: 0,
    resetAt: new Date().toISOString(),
  });

  res.json(usageResponse);
});

// POST /api/briefings/generate - Uses BriefingGenerateRequestSchema
app.post(
  "/api/briefings/generate",
  validateRequestBody(BriefingGenerateRequestSchema),
  validateResponse(z.object({ briefingId: z.string() })),
  (req, res) => {
    const briefingId = uuidv4();
    res.json({ briefingId });
  }
);

// GET /api/briefings/:id/status - Uses BriefingStatusResponseSchema
app.get(
  "/api/briefings/:id/status",
  validateResponse(BriefingStatusResponseSchema),
  (req, res) => {
    const statusResponse = BriefingStatusResponseSchema.parse({
      _id: req.params.id,
      status: "done",
      statusReason: undefined,
      updatedAt: new Date().toISOString(),
    });

    res.json(statusResponse);
  }
);

// GET /api/briefings/:id - Uses BriefingResponseSchema
app.get(
  "/api/briefings/:id",
  validateResponse(BriefingResponseSchema),
  (req, res) => {
    const briefingResponse = BriefingResponseSchema.parse({
      _id: req.params.id,
      userId: "mock-user-id",
      status: "done",
      request: {
        source: "manual",
        topics: ["technology"],
        interests: ["AI"],
        jobIndustry: "tech",
        demographic: "professional",
      },
      summary: {
        sections: [
          {
            category: "Technology",
            text: "This is a mock briefing summary about technology trends.",
          },
        ],
        generatedAt: new Date().toISOString(),
        llm: {
          provider: "openai",
          model: "gpt-4",
          inputTokens: 100,
          outputTokens: 50,
        },
      },
      articles: [
        {
          title: "Sample Article",
          url: "https://example.com/article",
          source: "Example News",
          publishedAt: new Date().toISOString(),
          language: "en",
          content: "Sample article content",
          fetchStatus: "ok",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json(briefingResponse);
  }
);

// 404 handler
app.use("*", (req, res) => {
  const errorResponse = ErrorSchema.parse({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
  res.status(404).json(errorResponse);
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    const errorResponse = ErrorSchema.parse({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong!",
      },
    });
    res.status(500).json(errorResponse);
  }
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Fixed schema-integrated server running on port ${PORT}`);
  console.log(`📋 Using inline Zod schemas for validation`);
});

export default app;
