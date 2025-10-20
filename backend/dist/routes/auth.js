"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const src_1 = require("../../../packages/contracts/src");
const authService_1 = require("../services/authService");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// POST /api/auth/otp/request
router.post("/otp/request", rateLimiter_1.ipRateLimit, (0, validation_1.validateRequest)({ body: src_1.OtpRequestSchema }), (0, validation_1.validateResponse)(zod_1.z.object({ success: zod_1.z.boolean() })), async (req, res) => {
    try {
        await authService_1.authService.requestOtp(req.body);
        res.json({ success: true });
    }
    catch (error) {
        throw error;
    }
});
// POST /api/auth/otp/verify
router.post("/otp/verify", rateLimiter_1.ipRateLimit, (0, validation_1.validateRequest)({ body: src_1.OtpVerifySchema }), (0, validation_1.validateResponse)(src_1.SessionSchema), async (req, res) => {
    try {
        const { email, code } = req.body;
        const session = await authService_1.authService.verifyOtp(email, code);
        res.json(session);
    }
    catch (error) {
        throw error;
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map