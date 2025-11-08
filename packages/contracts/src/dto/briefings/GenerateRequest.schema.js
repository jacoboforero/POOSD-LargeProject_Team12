"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefingGenerateResponseSchema = exports.CustomNewsQueryRequestSchema = exports.BriefingGenerateRequestSchema = void 0;
const zod_1 = require("zod");
exports.BriefingGenerateRequestSchema = zod_1.z.object({
    // Optional overrides; otherwise use saved user prefs
    topics: zod_1.z.array(zod_1.z.string()).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    jobIndustry: zod_1.z.string().optional(),
    demographic: zod_1.z.string().optional(),
    // Optional idempotency/dedupe
    requestHash: zod_1.z.string().optional(),
});
const languageEnum = zod_1.z.enum([
    "ar",
    "de",
    "en",
    "es",
    "fr",
    "he",
    "it",
    "nl",
    "no",
    "pt",
    "ru",
    "sv",
    "ud",
    "zh",
]);
exports.CustomNewsQueryRequestSchema = zod_1.z.object({
    topics: zod_1.z.array(zod_1.z.string()).min(1).optional(),
    includeKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    excludeKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    preferredSources: zod_1.z.array(zod_1.z.string()).max(20).optional(),
    language: languageEnum.optional(),
    format: zod_1.z.enum(["narrative", "bullet_points"]).optional(),
    requestHash: zod_1.z.string().optional(),
});
exports.BriefingGenerateResponseSchema = zod_1.z.object({
    briefingId: zod_1.z.string(),
});
//# sourceMappingURL=GenerateRequest.schema.js.map
