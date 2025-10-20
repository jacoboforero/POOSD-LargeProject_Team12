"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const authService_1 = require("../services/authService");
const src_1 = require("../../../packages/contracts/src");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({
                error: {
                    code: src_1.ERROR_CODES.UNAUTHORIZED,
                    message: "Access token required",
                },
            });
        }
        const session = await authService_1.authService.validateToken(token);
        if (!session) {
            return res.status(401).json({
                error: {
                    code: src_1.ERROR_CODES.UNAUTHORIZED,
                    message: "Invalid or expired token",
                },
            });
        }
        req.user = session.user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: {
                code: src_1.ERROR_CODES.UNAUTHORIZED,
                message: "Authentication failed",
            },
        });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map