"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefingSchema = exports.BriefingRequestSchema = exports.BriefingSummarySchema = exports.BriefingCostsSchema = exports.BriefingCitationsSchema = exports.BriefingSectionSchema = exports.BriefingArticleSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../utils/common");
exports.BriefingArticleSchema = zod_1.z.object({
    title: zod_1.z.string(),
    url: common_1.urlString,
    source: zod_1.z.string().optional(),
    publishedAt: common_1.isoDate.optional(),
    language: zod_1.z.string().optional(),
    content: zod_1.z.string().nullable().optional(), // may be null or omitted
    fetchStatus: zod_1.z.enum(["ok", "skipped", "failed"]).optional(),
    cacheRef: zod_1.z.string().optional(), // e.g., ArticleCache _id
});
exports.BriefingSectionSchema = zod_1.z.object({
    category: zod_1.z.string(), // "technology" | "jobIndustry" | "interests" (open text ok)
    text: zod_1.z.string(),
});
exports.BriefingCitationsSchema = zod_1.z.array(zod_1.z.object({
    title: zod_1.z.string().optional(),
    url: common_1.urlString,
    source: zod_1.z.string().optional(),
    publishedAt: common_1.isoDate.optional(),
}));
exports.BriefingCostsSchema = zod_1.z.object({
    inputTokens: zod_1.z.number().int().min(0).default(0),
    outputTokens: zod_1.z.number().int().min(0).default(0),
    providerCostUsd: zod_1.z.number().nonnegative().optional(),
    durationMs: zod_1.z.number().int().nonnegative().optional(),
});
exports.BriefingSummarySchema = zod_1.z.object({
    sections: zod_1.z.array(exports.BriefingSectionSchema).max(3),
    generatedAt: common_1.isoDate,
    llm: zod_1.z.object({
        provider: zod_1.z.string().default("openai"),
        model: zod_1.z.string().default("gpt-4o-mini"),
        inputTokens: zod_1.z.number().int().min(0).default(0),
        outputTokens: zod_1.z.number().int().min(0).default(0),
    }),
    citations: exports.BriefingCitationsSchema.optional(),
});
exports.BriefingRequestSchema = zod_1.z.object({
    topics: zod_1.z.array(zod_1.z.string()).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    jobIndustry: zod_1.z.string().optional(),
    demographic: zod_1.z.string().optional(),
    source: zod_1.z.string().default("news_api"),
});
exports.BriefingSchema = zod_1.z.object({
    _id: zod_1.z.string(), // ObjectId as string
    userId: zod_1.z.string(),
    status: common_1.briefingStatus,
    statusReason: zod_1.z.string().optional(),
    request: exports.BriefingRequestSchema,
    articles: zod_1.z.array(exports.BriefingArticleSchema).default([]),
    summary: exports.BriefingSummarySchema.optional(),
    error: zod_1.z.object({ message: zod_1.z.string() }).optional(),
    // Timeline/progress
    queuedAt: common_1.isoDate.optional(),
    fetchStartedAt: common_1.isoDate.optional(),
    summarizeStartedAt: common_1.isoDate.optional(),
    completedAt: common_1.isoDate.optional(),
    progress: zod_1.z.number().min(0).max(100).optional(),
    // Query window used for the news search
    sourceWindow: zod_1.z.object({ from: common_1.isoDate, to: common_1.isoDate }).optional(),
    requestHash: zod_1.z.string().optional(),
    counters: zod_1.z
        .object({
        articleFetchCount: zod_1.z.number().int().min(0).default(0),
        articleFetchFailedCount: zod_1.z.number().int().min(0).default(0),
    })
        .optional(),
    costs: exports.BriefingCostsSchema.optional(),
    traceId: zod_1.z.string().optional(),
    createdAt: common_1.isoDate,
    updatedAt: common_1.isoDate,
});
//# sourceMappingURL=Briefing.schema.js.map