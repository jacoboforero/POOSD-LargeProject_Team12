"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorCode = exports.pushPlatform = exports.briefingStatus = exports.cursor = exports.urlString = exports.isoDate = exports.objectId = void 0;
const zod_1 = require("zod");
/** Mongo ObjectId as 24-hex string */
exports.objectId = zod_1.z.string().regex(/^[a-f\d]{24}$/i, "ObjectId");
/** ISO-8601 datetime string with timezone offset (Z or ±hh:mm) */
exports.isoDate = zod_1.z.string().datetime({ offset: true });
/** Basic URL (http/https) */
exports.urlString = zod_1.z.string().url();
/** Pagination cursor (opaque) */
exports.cursor = zod_1.z.string().min(1);
/** Briefing status lifecycle */
exports.briefingStatus = zod_1.z.enum([
    "queued",
    "fetching",
    "summarizing",
    "done",
    "error",
]);
/** Platform enum for push tokens */
exports.pushPlatform = zod_1.z.enum(["ios", "android"]);
/** Error code enum kept small for MVP */
exports.errorCode = zod_1.z.enum([
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "RATE_LIMITED",
    "QUOTA_EXCEEDED",
    "VALIDATION_FAILED",
    "PROVIDER_ERROR",
    "INTERNAL_ERROR",
]);
//# sourceMappingURL=common.js.map