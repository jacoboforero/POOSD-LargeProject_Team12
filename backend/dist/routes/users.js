"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const src_1 = require("../../../packages/contracts/src");
const userService_1 = require("../services/userService");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// GET /api/me
router.get("/me", auth_1.authenticateToken, rateLimiter_1.userRateLimit, rateLimiter_1.dailyQuotaCheck, (0, validation_1.validateResponse)(src_1.MeResponseSchema), async (req, res) => {
    try {
        const user = await userService_1.userService.getMe(req.user._id);
        res.json(user);
    }
    catch (error) {
        throw error;
    }
});
// GET /api/me/usage
router.get("/me/usage", auth_1.authenticateToken, rateLimiter_1.userRateLimit, rateLimiter_1.dailyQuotaCheck, (0, validation_1.validateResponse)(src_1.UsageResponseSchema), async (req, res) => {
    try {
        const usage = await userService_1.userService.getUsage(req.user._id);
        res.json(usage);
    }
    catch (error) {
        throw error;
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map