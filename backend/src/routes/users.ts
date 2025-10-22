import { Router } from "express";
import { UserService } from "../services/userService";
import { authenticateToken } from "../middleware/auth";
import { userRateLimit } from "../middleware/rateLimiter";

const router = Router();
const userService = new UserService();

// GET /api/me
router.get(
  "/me",
  authenticateToken,
  userRateLimit,
  async (req, res) => {
    try {
      const user = await userService.getUser(req.user._id);
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