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

// POST /api/auth/register
router.post("/register", ipRateLimit, async (req, res, next) => {
  try {
    const { 
      email, 
      topics = [], 
      interests = [], 
      jobIndustry, 
      demographic 
    } = req.body;
    
    await authService.register(email, {
      topics: Array.isArray(topics) ? topics : [],
      interests: Array.isArray(interests) ? interests : [],
      jobIndustry,
      demographic,
    });
    
    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your console for OTP code.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", ipRateLimit, async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.login(email);
    res.json({
      success: true,
      message: "OTP sent. Please check your console for the code.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify
router.post("/verify", ipRateLimit, async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const session = await authService.verifyOtp(email, code);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Legacy endpoint for backwards compatibility
// POST /api/auth/otp/request
router.post("/otp/request", ipRateLimit, async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.requestOtp(email);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Legacy endpoint for backwards compatibility
// POST /api/auth/otp/verify
router.post("/otp/verify", ipRateLimit, async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const session = await authService.verifyOtp(email, code);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
