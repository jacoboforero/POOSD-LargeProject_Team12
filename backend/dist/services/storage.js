"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const uuid_1 = require("uuid");
// In-memory storage for development
class InMemoryStorage {
    constructor() {
        this.users = new Map();
        this.briefings = new Map();
        this.sessions = new Map();
        this.otpRequests = new Map();
    }
    // User operations
    createUser(userData) {
        const user = {
            _id: (0, uuid_1.v4)(),
            email: userData.email,
            emailVerified: false,
            preferences: userData.preferences || {
                topics: [],
                interests: [],
                jobIndustry: "",
                demographic: "",
            },
            timezone: userData.timezone || "UTC",
            notificationPrefs: userData.notificationPrefs || {
                email: true,
                push: false,
                frequency: "daily",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(user._id, user);
        return user;
    }
    getUserById(id) {
        return this.users.get(id);
    }
    getUserByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return undefined;
    }
    updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user)
            return undefined;
        const updatedUser = { ...user, ...updates, updatedAt: new Date() };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    // Session operations
    createSession(user, token) {
        const session = {
            token,
            user: {
                _id: user._id,
                email: user.email,
                emailVerified: user.emailVerified,
                preferences: user.preferences,
                timezone: user.timezone,
                notificationPrefs: user.notificationPrefs,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
        this.sessions.set(token, session);
        return session;
    }
    getSession(token) {
        return this.sessions.get(token);
    }
    deleteSession(token) {
        return this.sessions.delete(token);
    }
    // OTP operations
    createOtpRequest(email) {
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        this.otpRequests.set(email, { email, code, expiresAt });
        return { code, expiresAt };
    }
    verifyOtpRequest(email, code) {
        const request = this.otpRequests.get(email);
        if (!request)
            return false;
        if (request.expiresAt < new Date()) {
            this.otpRequests.delete(email);
            return false;
        }
        if (request.code !== code)
            return false;
        this.otpRequests.delete(email);
        return true;
    }
    // Briefing operations
    createBriefing(userId, request) {
        const briefing = {
            _id: (0, uuid_1.v4)(),
            userId,
            status: "queued",
            createdAt: new Date(),
            updatedAt: new Date(),
            // Stub fields - will be populated by worker
            summary: "",
            articles: [],
            topics: request.topics || [],
            interests: request.interests || [],
            jobIndustry: request.jobIndustry || "",
            demographic: request.demographic || "",
        };
        this.briefings.set(briefing._id, briefing);
        return briefing;
    }
    getBriefing(id) {
        return this.briefings.get(id);
    }
    updateBriefing(id, updates) {
        const briefing = this.briefings.get(id);
        if (!briefing)
            return undefined;
        const updatedBriefing = { ...briefing, ...updates, updatedAt: new Date() };
        this.briefings.set(id, updatedBriefing);
        return updatedBriefing;
    }
    getUserBriefings(userId) {
        const userBriefings = [];
        for (const briefing of this.briefings.values()) {
            if (briefing.userId === userId) {
                userBriefings.push(briefing);
            }
        }
        return userBriefings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
}
// Export singleton instance
exports.storage = new InMemoryStorage();
//# sourceMappingURL=storage.js.map