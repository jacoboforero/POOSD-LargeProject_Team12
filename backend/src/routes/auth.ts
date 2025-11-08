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

// POST /api/auth/check-user
router.post("/check-user", ipRateLimit, async (req, res, next) => {
  try {
    const { email } = req.body;
    const exists = await authService.checkUserExists(email);
    res.json({
      exists,
      message: exists ? "User exists" : "New user"
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register
router.post("/register", ipRateLimit, async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
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
    }, name, password);

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your console for OTP code.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login-password
router.post("/login-password", ipRateLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await authService.loginWithPassword(email, password);
    res.json({
      success: true,
      message: "Password verified! Please check your console for OTP code.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login (legacy OTP method)
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

// POST /api/auth/forgot-password
router.post("/forgot-password", ipRateLimit, async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    res.json({
      success: true,
      message: "Password reset code sent! Please check your console for OTP code.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify-reset-code
router.post("/verify-reset-code", ipRateLimit, async (req, res, next) => {
  try {
    const { email, code } = req.body;
    await authService.verifyPasswordResetCode(email, code);
    res.json({
      success: true,
      message: "Code verified. You can now reset your password.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", ipRateLimit, async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    await authService.resetPassword(email, code, newPassword);
    res.json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
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
