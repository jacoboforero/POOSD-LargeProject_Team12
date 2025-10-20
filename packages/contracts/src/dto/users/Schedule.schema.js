"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleUpdateSchema = void 0;
const zod_1 = require("zod");
exports.ScheduleUpdateSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    hourLocal: zod_1.z.number().int().min(0).max(23),
    daysOfWeek: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional(), // 0=Sun
});
//# sourceMappingURL=Schedule.schema.js.map