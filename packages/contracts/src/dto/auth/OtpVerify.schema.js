"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpVerifySchema = void 0;
const zod_1 = require("zod");
exports.OtpVerifySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().min(4).max(8),
});
//# sourceMappingURL=OtpVerify.schema.js.map