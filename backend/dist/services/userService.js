"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const storage_1 = require("./storage");
class UserService {
    async getMe(userId) {
        const user = storage_1.storage.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return {
            _id: user._id,
            email: user.email,
            emailVerified: user.emailVerified,
            preferences: user.preferences,
            timezone: user.timezone,
            notificationPrefs: user.notificationPrefs,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async getUsage(userId) {
        const user = storage_1.storage.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const briefings = storage_1.storage.getUserBriefings(userId);
        // Calculate usage statistics
        const totalBriefings = briefings.length;
        const completedBriefings = briefings.filter((b) => b.status === "done").length;
        const queuedBriefings = briefings.filter((b) => b.status === "queued").length;
        const failedBriefings = briefings.filter((b) => b.status === "failed").length;
        // Calculate daily usage (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentBriefings = briefings.filter((b) => b.createdAt >= thirtyDaysAgo);
        const dailyUsage = recentBriefings.length;
        return {
            totalBriefings,
            completedBriefings,
            queuedBriefings,
            failedBriefings,
            dailyUsage,
            quota: {
                daily: 10, // Hardcoded for now
                monthly: 100, // Hardcoded for now
                remaining: Math.max(0, 10 - dailyUsage), // Daily remaining
            },
        };
    }
    async updatePreferences(userId, preferences) {
        const user = storage_1.storage.updateUser(userId, { preferences });
        if (!user) {
            throw new Error("User not found");
        }
        return {
            _id: user._id,
            email: user.email,
            emailVerified: user.emailVerified,
            preferences: user.preferences,
            timezone: user.timezone,
            notificationPrefs: user.notificationPrefs,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map