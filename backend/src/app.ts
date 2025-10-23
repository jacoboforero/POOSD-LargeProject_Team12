import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Import middleware
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { ipRateLimit } from "./middleware/rateLimiter";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import briefingRoutes from "./routes/briefings";

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
app.use(requestId);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use(ipRateLimit);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.2",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/me", userRoutes);
app.use("/api/briefings", briefingRoutes);

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
app.use(errorHandler);

export default app;
