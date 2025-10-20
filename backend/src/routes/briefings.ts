import { Router } from "express";
import { z } from "zod";
import {
  BriefingGenerateRequestSchema,
  BriefingResponseSchema,
  BriefingStatusResponseSchema,
  BriefingGenerateResponseSchema,
} from "../../../packages/contracts/src";
import { briefingService } from "../services/briefingService";
import { validateRequest, validateResponse } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { userRateLimit, dailyQuotaCheck } from "../middleware/rateLimiter";

const router = Router();

// POST /api/briefings/generate
router.post(
  "/generate",
  authenticateToken,
  userRateLimit,
  dailyQuotaCheck,
  validateRequest({ body: BriefingGenerateRequestSchema }),
  validateResponse(BriefingGenerateResponseSchema),
  async (req, res) => {
    try {
      const result = await briefingService.generateBriefing(
        req.user._id,
        req.body
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }
);

// GET /api/briefings/:id/status
router.get(
  "/:id/status",
  authenticateToken,
  userRateLimit,
  dailyQuotaCheck,
  validateRequest({
    params: z.object({ id: z.string() }),
  }),
  validateResponse(BriefingStatusResponseSchema),
  async (req, res) => {
    try {
      const status = await briefingService.getBriefingStatus(req.params.id);
      res.json(status);
    } catch (error) {
      throw error;
    }
  }
);

// GET /api/briefings/:id
router.get(
  "/:id",
  authenticateToken,
  userRateLimit,
  dailyQuotaCheck,
  validateRequest({
    params: z.object({ id: z.string() }),
  }),
  validateResponse(BriefingResponseSchema),
  async (req, res) => {
    try {
      const briefing = await briefingService.getBriefing(req.params.id);
      res.json(briefing);
    } catch (error) {
      throw error;
    }
  }
);

export default router;
