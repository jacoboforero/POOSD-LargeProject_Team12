"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileUpdateSchema = void 0;
const zod_1 = require("zod");
const User_schema_1 = require("../../domain/User.schema");
const NotificationPrefsUpdateSchema = zod_1.z
    .object({
    onBriefingReady: zod_1.z.boolean().optional(),
})
    .partial()
    .optional();
exports.ProfileUpdateSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(120).optional(),
    timezone: zod_1.z.string().max(120).optional(),
    preferences: User_schema_1.UserPreferencesSchema.partial().optional(),
    notificationPrefs: NotificationPrefsUpdateSchema,
})
    .strict();
//# sourceMappingURL=ProfileUpdate.schema.js.map
