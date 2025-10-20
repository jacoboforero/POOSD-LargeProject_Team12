import { Router } from "express";
import { z } from "zod";
import {
  MeResponseSchema,
  UsageResponseSchema,
} from "../../../packages/contracts/src";
import { userService } from "../services/userService";
import { validateRequest, validateResponse } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { userRateLimit, dailyQuotaCheck } from "../middleware/rateLimiter";

const router = Router();

// GET /api/me
router.get(
  "/me",
  authenticateToken,
  userRateLimit,
  dailyQuotaCheck,
  validateResponse(MeResponseSchema),
  async (req, res) => {
    try {
      const user = await userService.getMe(req.user._id);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }
);

// GET /api/me/usage
router.get(
  "/me/usage",
  authenticateToken,
  userRateLimit,
  dailyQuotaCheck,
  validateResponse(UsageResponseSchema),
  async (req, res) => {
    try {
      const usage = await userService.getUsage(req.user._id);
      res.json(usage);
    } catch (error) {
      throw error;
    }
  }
);

export default router;
