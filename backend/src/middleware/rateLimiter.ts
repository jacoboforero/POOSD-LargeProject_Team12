import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { ERROR_CODES } from "../../../packages/contracts/src";

// Per-IP rate limiter
export const ipRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: ERROR_CODES.RATE_LIMITED,
      message: "Too many requests from this IP, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-user rate limiter (requires authentication)
export const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each user to 200 requests per windowMs
  keyGenerator: (req: Request) => {
    // Use user ID from JWT token if available
    const user = (req as any).user;
    return user?.id || req.ip;
  },
  message: {
    error: {
      code: ERROR_CODES.RATE_LIMITED,
      message: "Too many requests from this user, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Daily quota check middleware (stub for now)
export const dailyQuotaCheck = (
  req: Request,
  res: Response,
  next: Function
) => {
  // TODO: Implement actual quota checking when Bryan's quota system is ready
  // For now, this is a pass-through
  next();
};
