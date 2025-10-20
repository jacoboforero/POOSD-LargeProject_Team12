"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefingGenerateResponseSchema = exports.BriefingGenerateRequestSchema = void 0;
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
exports.BriefingGenerateResponseSchema = zod_1.z.object({
    briefingId: zod_1.z.string(),
});
//# sourceMappingURL=GenerateRequest.schema.js.map