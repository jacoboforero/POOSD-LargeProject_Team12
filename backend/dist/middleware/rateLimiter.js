"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyQuotaCheck = exports.userRateLimit = exports.ipRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const src_1 = require("../../../packages/contracts/src");
// Per-IP rate limiter
exports.ipRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: {
            code: src_1.ERROR_CODES.RATE_LIMITED,
            message: "Too many requests from this IP, please try again later.",
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Per-user rate limiter (requires authentication)
exports.userRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each user to 200 requests per windowMs
    keyGenerator: (req) => {
        // Use user ID from JWT token if available
        const user = req.user;
        return user?.id || req.ip;
    },
    message: {
        error: {
            code: src_1.ERROR_CODES.RATE_LIMITED,
            message: "Too many requests from this user, please try again later.",
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Daily quota check middleware (stub for now)
const dailyQuotaCheck = (req, res, next) => {
    // TODO: Implement actual quota checking when Bryan's quota system is ready
    // For now, this is a pass-through
    next();
};
exports.dailyQuotaCheck = dailyQuotaCheck;
//# sourceMappingURL=rateLimiter.js.map