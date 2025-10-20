"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageResponseSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../utils/common");
exports.UsageResponseSchema = zod_1.z.object({
    dailyGenerateCap: zod_1.z.number().int().min(1),
    generatedToday: zod_1.z.number().int().min(0),
    resetAt: common_1.isoDate,
});
//# sourceMappingURL=Usage.schema.js.map