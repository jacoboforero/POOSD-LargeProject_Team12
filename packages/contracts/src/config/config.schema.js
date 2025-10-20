"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = void 0;
const zod_1 = require("zod");
exports.ConfigSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    // Secrets/keys
    JWT_SECRET: zod_1.z.string().min(10),
    MONGODB_URI: zod_1.z.string().min(1),
    OPENAI_API_KEY: zod_1.z.string().min(1),
    NEWS_API_KEY: zod_1.z.string().min(1),
    EMAIL_PROVIDER: zod_1.z.enum(["resend", "sendgrid"]).default("resend"),
    RESEND_API_KEY: zod_1.z.string().min(1).optional(), // required if EMAIL_PROVIDER=resend
    SENDGRID_API_KEY: zod_1.z.string().min(1).optional(), // required if EMAIL_PROVIDER=sendgrid
    // Quotas
    DAILY_GENERATE_CAP: zod_1.z.coerce.number().int().min(1).default(3),
});
//# sourceMappingURL=config.schema.js.map