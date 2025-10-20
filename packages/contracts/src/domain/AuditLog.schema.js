"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../utils/common");
exports.AuditLogSchema = zod_1.z.object({
    _id: zod_1.z.string(), // ObjectId as string
    userId: zod_1.z.string().optional(),
    briefingId: zod_1.z.string().optional(),
    event: zod_1.z.string(), // e.g., 'briefing.status_changed', 'auth.otp_requested'
    data: zod_1.z.unknown().optional(),
    createdAt: common_1.isoDate,
});
//# sourceMappingURL=AuditLog.schema.js.map