"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import middleware
const requestId_1 = require("./middleware/requestId");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const briefings_1 = __importDefault(require("./routes/briefings"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
// Request ID middleware
app.use(requestId_1.requestId);
// Logging
app.use((0, morgan_1.default)("combined"));
// Body parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Global rate limiting
app.use(rateLimiter_1.ipRateLimit);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// API routes
app.use("/api/auth", auth_1.default);
app.use("/api/me", users_1.default);
app.use("/api/briefings", briefings_1.default);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: "Route not found",
        },
    });
});
// Error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map