"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefingsListResponseSchema = exports.BriefingListItemSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../utils/common");
exports.BriefingListItemSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    status: zod_1.z.enum(["queued", "fetching", "summarizing", "done", "error"]),
    statusReason: zod_1.z.string().optional(),
    createdAt: common_1.isoDate,
    updatedAt: common_1.isoDate,
    // minimal preview fields for list rendering
    summaryPreview: zod_1.z
        .object({
        sections: zod_1.z
            .array(zod_1.z.object({ category: zod_1.z.string(), text: zod_1.z.string() }))
            .max(3)
            .optional(),
    })
        .optional(),
});
exports.BriefingsListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.BriefingListItemSchema),
    nextCursor: zod_1.z.string().nullable(),
});
//# sourceMappingURL=ListResponse.schema.js.map