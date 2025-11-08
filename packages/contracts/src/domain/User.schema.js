"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.PushTokenSchema = exports.OtpStateSchema = exports.UserLimitsSchema = exports.UserPreferencesSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../utils/common");
exports.UserPreferencesSchema = zod_1.z.object({
    topics: zod_1.z.array(zod_1.z.string()).default([]), // open-ended
    demographic: zod_1.z.string().optional(), // open-ended
    jobIndustry: zod_1.z.string().optional(), // open-ended
    interests: zod_1.z.array(zod_1.z.string()).default([]), // open-ended
    location: zod_1.z.string().optional(), // city, state, or country
    lifeStage: zod_1.z.string().optional(), // student, parent, retiree, etc.
    newsStyle: zod_1.z.string().optional(), // summaries vs analysis
    newsScope: zod_1.z.string().optional(), // global/local/both
    preferredHeadlines: zod_1.z.array(zod_1.z.string()).default([]), // what grabs attention
    scrollPastTopics: zod_1.z.array(zod_1.z.string()).default([]), // what users skip
});
exports.UserLimitsSchema = zod_1.z.object({
    dailyGenerateCap: zod_1.z.number().int().min(1).default(3),
    generatedCountToday: zod_1.z.number().int().min(0).default(0),
    resetAt: common_1.isoDate, // when counter resets (UTC midnight or computed)
});
exports.OtpStateSchema = zod_1.z.object({
    hash: zod_1.z.string(),
    expiresAt: common_1.isoDate,
    attempts: zod_1.z.number().int().min(0).default(0),
    lastRequestedAt: common_1.isoDate.optional(),
    throttledUntil: common_1.isoDate.optional(),
});
exports.PushTokenSchema = zod_1.z.object({
    platform: zod_1.z.enum(["ios", "android"]),
    token: zod_1.z.string(),
    addedAt: common_1.isoDate,
});
exports.UserSchema = zod_1.z.object({
    _id: zod_1.z.string(), // ObjectId as string; keep flexible for clients
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    emailVerified: zod_1.z.boolean().default(false),
    otp: exports.OtpStateSchema.optional(),
    preferences: exports.UserPreferencesSchema.default({
        topics: [],
        interests: [],
        preferredHeadlines: [],
        scrollPastTopics: [],
    }),
    limits: exports.UserLimitsSchema,
    timezone: zod_1.z.string().optional(), // IANA, e.g., "America/New_York"
    notificationPrefs: zod_1.z
        .object({
        onBriefingReady: zod_1.z.boolean().default(true),
    })
        .default({ onBriefingReady: true }),
    pushTokens: zod_1.z.array(exports.PushTokenSchema).default([]),
    acceptedTermsAt: common_1.isoDate.optional(),
    acceptedPrivacyAt: common_1.isoDate.optional(),
    lastLoginAt: common_1.isoDate.optional(),
    lastIp: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    createdAt: common_1.isoDate,
    updatedAt: common_1.isoDate,
});
//# sourceMappingURL=User.schema.js.map
