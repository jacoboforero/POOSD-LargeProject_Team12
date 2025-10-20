"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const storage_1 = require("./storage");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
class AuthService {
    async requestOtp(request) {
        const { email } = request;
        // Create or get user
        let user = storage_1.storage.getUserByEmail(email);
        if (!user) {
            user = storage_1.storage.createUser({ email });
        }
        // Create OTP request
        const { code } = storage_1.storage.createOtpRequest(email);
        // Stub: Log OTP instead of sending email
        console.log(`OTP for ${email}: ${code}`);
        // In a real implementation, you would send an email here
        // await emailService.sendOtp(email, code);
    }
    async verifyOtp(email, code) {
        // Verify OTP
        const isValid = storage_1.storage.verifyOtpRequest(email, code);
        if (!isValid) {
            throw new Error("Invalid or expired OTP");
        }
        // Get or create user
        let user = storage_1.storage.getUserByEmail(email);
        if (!user) {
            user = storage_1.storage.createUser({ email });
        }
        // Mark email as verified
        user = storage_1.storage.updateUser(user._id, { emailVerified: true });
        if (!user) {
            throw new Error("Failed to update user");
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Create session
        const session = storage_1.storage.createSession(user, token);
        return session;
    }
    async validateToken(token) {
        try {
            // Verify JWT
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Get session from storage
            const session = storage_1.storage.getSession(token);
            if (!session) {
                return null;
            }
            return session;
        }
        catch (error) {
            return null;
        }
    }
    async logout(token) {
        storage_1.storage.deleteSession(token);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map