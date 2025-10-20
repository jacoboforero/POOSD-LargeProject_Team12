"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BriefingStatusResponseSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../utils/common");
exports.BriefingStatusResponseSchema = zod_1.z.object({
    status: common_1.briefingStatus,
    statusReason: zod_1.z.string().optional(),
    updatedAt: common_1.isoDate,
});
//# sourceMappingURL=BriefingStatus.schema.js.map