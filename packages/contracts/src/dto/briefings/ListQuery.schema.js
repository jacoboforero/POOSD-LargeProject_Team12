"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefingsListQuerySchema = void 0;
const zod_1 = require("zod");
exports.BriefingsListQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
});
//# sourceMappingURL=ListQuery.schema.js.map