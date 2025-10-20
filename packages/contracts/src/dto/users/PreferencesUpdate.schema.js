"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreferencesUpdateSchema = void 0;
const zod_1 = require("zod");
exports.PreferencesUpdateSchema = zod_1.z.object({
    topics: zod_1.z.array(zod_1.z.string()).optional(),
    demographic: zod_1.z.string().optional(),
    jobIndustry: zod_1.z.string().optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=PreferencesUpdate.schema.js.map