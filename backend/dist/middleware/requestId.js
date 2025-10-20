"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const uuid_1 = require("uuid");
const requestId = (req, res, next) => {
    // Generate or use existing request ID
    const requestId = req.headers["x-request-id"] || (0, uuid_1.v4)();
    // Add to request object for use in routes
    req.headers["x-request-id"] = requestId;
    // Add to response headers
    res.setHeader("X-Request-ID", requestId);
    next();
};
exports.requestId = requestId;
//# sourceMappingURL=requestId.js.map