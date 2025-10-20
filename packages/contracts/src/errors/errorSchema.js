"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../utils/common");
exports.ErrorSchema = zod_1.z.object({
    error: zod_1.z.object({
        code: common_1.errorCode,
        message: zod_1.z.string(),
        details: zod_1.z.unknown().optional(),
    }),
});
//# sourceMappingURL=errorSchema.js.map