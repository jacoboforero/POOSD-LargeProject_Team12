import { Router } from "express";
import { BriefingService } from "../services/briefingService";
import { authenticateToken } from "../middleware/auth";
import { userRateLimit } from "../middleware/rateLimiter";
import { validateRequest } from "../middleware/validation";
import {
  BriefingGenerateRequestSchema,
  CustomNewsQueryRequestSchema,
} from "../../../packages/contracts/src";

const router = Router();
const briefingService = new BriefingService();

// POST /api/briefings/generate-daily
router.post(
  "/generate-daily",
  authenticateToken,
  userRateLimit,
  validateRequest({ body: BriefingGenerateRequestSchema }),
  async (req, res) => {
    try {
      const result = await briefingService.generateDailyBriefing(
        req.user._id,
        req.body
      );
      res.json(result);
    } catch (error) {
      throw error;
    }
  }
);

// POST /api/briefings/generate (custom)
router.post(
  "/generate",
  authenticateToken,
  userRateLimit,
  validateRequest({ body: CustomNewsQueryRequestSchema }),
  async (req, res) => {
    try {
      const result = await briefingService.generateCustomNewsQuery(
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
  async (req, res) => {
    try {
      const status = await briefingService.getStatus(req.params.id, req.user._id);
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
  async (req, res) => {
    try {
      const briefing = await briefingService.get(req.params.id, req.user._id);
      res.json(briefing);
    } catch (error) {
      throw error;
    }
  }
);

export default router;
