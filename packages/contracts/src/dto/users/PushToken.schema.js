"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushTokenUpsertSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../utils/common");
exports.PushTokenUpsertSchema = zod_1.z.object({
    platform: common_1.pushPlatform,
    token: zod_1.z.string(),
});
//# sourceMappingURL=PushToken.schema.js.map