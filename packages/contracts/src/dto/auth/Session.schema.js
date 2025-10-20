"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSchema = void 0;
const zod_1 = require("zod");
const User_schema_1 = require("../../domain/User.schema");
exports.SessionSchema = zod_1.z.object({
    token: zod_1.z.string(),
    user: User_schema_1.UserSchema.pick({
        _id: true,
        email: true,
        emailVerified: true,
        preferences: true,
        timezone: true,
        notificationPrefs: true,
        createdAt: true,
        updatedAt: true,
    }),
});
//# sourceMappingURL=Session.schema.js.map