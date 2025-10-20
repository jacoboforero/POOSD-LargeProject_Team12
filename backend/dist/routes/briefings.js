"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const src_1 = require("../../../packages/contracts/src");
const briefingService_1 = require("../services/briefingService");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// POST /api/briefings/generate
router.post("/generate", auth_1.authenticateToken, rateLimiter_1.userRateLimit, rateLimiter_1.dailyQuotaCheck, (0, validation_1.validateRequest)({ body: src_1.BriefingGenerateRequestSchema }), (0, validation_1.validateResponse)(src_1.BriefingGenerateResponseSchema), async (req, res) => {
    try {
        const result = await briefingService_1.briefingService.generateBriefing(req.user._id, req.body);
        res.json(result);
    }
    catch (error) {
        throw error;
    }
});
// GET /api/briefings/:id/status
router.get("/:id/status", auth_1.authenticateToken, rateLimiter_1.userRateLimit, rateLimiter_1.dailyQuotaCheck, (0, validation_1.validateRequest)({
    params: zod_1.z.object({ id: zod_1.z.string() }),
}), (0, validation_1.validateResponse)(src_1.BriefingStatusResponseSchema), async (req, res) => {
    try {
        const status = await briefingService_1.briefingService.getBriefingStatus(req.params.id);
        res.json(status);
    }
    catch (error) {
        throw error;
    }
});
// GET /api/briefings/:id
router.get("/:id", auth_1.authenticateToken, rateLimiter_1.userRateLimit, rateLimiter_1.dailyQuotaCheck, (0, validation_1.validateRequest)({
    params: zod_1.z.object({ id: zod_1.z.string() }),
}), (0, validation_1.validateResponse)(src_1.BriefingResponseSchema), async (req, res) => {
    try {
        const briefing = await briefingService_1.briefingService.getBriefing(req.params.id);
        res.json(briefing);
    }
    catch (error) {
        throw error;
    }
});
exports.default = router;
//# sourceMappingURL=briefings.js.map