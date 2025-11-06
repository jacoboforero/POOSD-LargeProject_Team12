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
      name,
      email,
      topics = [],
      interests = [],
      jobIndustry,
      demographic,
      location,
      lifeStage,
      newsStyle,
      newsScope,
      preferredHeadlines = [],
      scrollPastTopics = []
    } = req.body;

    await authService.register(email, {
      topics: Array.isArray(topics) ? topics : [],
      interests: Array.isArray(interests) ? interests : [],
      jobIndustry,
      demographic,
      location,
      lifeStage,
      newsStyle,
      newsScope,
      preferredHeadlines: Array.isArray(preferredHeadlines) ? preferredHeadlines : [],
      scrollPastTopics: Array.isArray(scrollPastTopics) ? scrollPastTopics : [],
    }, name);
    
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
      message: "Login link sent! Please check your email for verification.",
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
