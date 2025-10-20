"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleCacheSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../utils/common");
exports.ArticleCacheSchema = zod_1.z.object({
    _id: zod_1.z.string(), // ObjectId as string
    url: common_1.urlString, // unique
    source: zod_1.z.string().optional(),
    publishedAt: common_1.isoDate.optional(),
    language: zod_1.z.string().optional(),
    contentExcerpt: zod_1.z.string().optional(), // truncated text
    contentHash: zod_1.z.string().optional(),
    allowedToStore: zod_1.z.boolean().default(false),
    lastFetchedAt: common_1.isoDate,
    createdAt: common_1.isoDate,
    updatedAt: common_1.isoDate,
});
//# sourceMappingURL=ArticleCache.schema.js.map