import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { RequestWithId } from "./types/request";

// Import middleware
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
// import { ipRateLimit } from "./middleware/rateLimiter";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import briefingRoutes from "./routes/briefings";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware - relax CSP for frontend assets
app.use(helmet({
  contentSecurityPolicy: false,  // Disable CSP for frontend to work
  crossOriginEmbedderPolicy: false,
}));
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? ["http://129.212.183.227:3001", "http://localhost:3000"]
      : (process.env.FRONTEND_URL || "http://localhost:3000"),
    credentials: true,
  })
);

// Request ID middleware
app.use(requestId);

// Logging with request IDs
morgan.token("id", (req) => (req as RequestWithId).requestId || "-");
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms req_id=:id')
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiting - DISABLED for demo
// app.use(ipRateLimit);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.4",
    environment: process.env.NODE_ENV || "development",
    message: "Deployment pipeline test - successful!",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/me", userRoutes);
app.use("/api/briefings", briefingRoutes);

// Serve built frontend if available so the IP serves the web app directly
const frontendDistPath = path.resolve(__dirname, "../../../../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

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
