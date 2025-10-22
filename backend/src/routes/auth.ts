import { Router } from "express";
import { z } from "zod";
import {
  OtpRequestSchema,
  OtpVerifySchema,
  SessionSchema,
} from "../../../packages/contracts/src";
import { AuthService } from "../services/authService";
import { validateRequest, validateResponse } from "../middleware/validation";
import { ipRateLimit } from "../middleware/rateLimiter";

const router = Router();
const authService = new AuthService();

// POST /api/auth/otp/request
router.post(
  "/otp/request",
  ipRateLimit,
  async (req, res) => {
    try {
      await authService.requestOtp(req.body);
      res.json({ success: true });
    } catch (error) {
      throw error;
    }
  }
);

// POST /api/auth/otp/verify
router.post(
  "/otp/verify",
  ipRateLimit,
  async (req, res) => {
    try {
      const { email, code } = req.body;
      const session = await authService.verifyOtp(email, code);
      res.json(session);
    } catch (error) {
      throw error;
    }
  }
);

export default router;