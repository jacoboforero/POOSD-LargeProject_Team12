import { Router } from "express";
import { UserService } from "../services/userService";
import { authenticateToken } from "../middleware/auth";
import { userRateLimit } from "../middleware/rateLimiter";
import { validateRequest } from "../middleware/validation";
import { ProfileUpdateSchema } from "../../../packages/contracts/src";

const router = Router();
const userService = new UserService();

// GET /api/me
router.get("/", authenticateToken, userRateLimit, async (req, res) => {
  try {
    const user = await userService.getUser(req.user._id);
    res.json(user);
  } catch (error) {
    throw error;
  }
});

// PUT /api/me
router.put(
  "/",
  authenticateToken,
  userRateLimit,
  validateRequest({ body: ProfileUpdateSchema }),
  async (req, res, next) => {
    try {
      const user = await userService.updateProfile(req.user._id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/me/usage
router.get("/usage", authenticateToken, userRateLimit, async (req, res) => {
  try {
    const usage = await userService.getUsage(req.user._id);
    res.json(usage);
  } catch (error) {
    throw error;
  }
});

export default router;
