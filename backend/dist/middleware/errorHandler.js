"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const src_1 = require("../../../packages/contracts/src");
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    // If response was already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }
    let statusCode = 500;
    let errorCode = src_1.ERROR_CODES.INTERNAL_ERROR;
    let message = "Internal server error";
    // Handle specific error types
    if (err.name === "ValidationError") {
        statusCode = 400;
        errorCode = src_1.ERROR_CODES.VALIDATION_FAILED;
        message = "Validation failed";
    }
    else if (err.name === "UnauthorizedError" || err.status === 401) {
        statusCode = 401;
        errorCode = src_1.ERROR_CODES.UNAUTHORIZED;
        message = "Unauthorized";
    }
    else if (err.status === 403) {
        statusCode = 403;
        errorCode = src_1.ERROR_CODES.FORBIDDEN;
        message = "Forbidden";
    }
    else if (err.status === 404) {
        statusCode = 404;
        errorCode = src_1.ERROR_CODES.NOT_FOUND;
        message = "Not found";
    }
    else if (err.status === 429) {
        statusCode = 429;
        errorCode = src_1.ERROR_CODES.RATE_LIMITED;
        message = "Rate limit exceeded";
    }
    else if (err.status === 402) {
        statusCode = 402;
        errorCode = src_1.ERROR_CODES.QUOTA_EXCEEDED;
        message = "Quota exceeded";
    }
    const errorResponse = src_1.ErrorSchema.parse({
        error: {
            code: errorCode,
            message,
            details: err.details || err.message,
        },
    });
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map