"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResponse = exports.validateRequest = void 0;
const zod_1 = require("zod");
const src_1 = require("../../../packages/contracts/src");
const validateRequest = (options) => {
    return (req, res, next) => {
        try {
            // Validate request body
            if (options.body) {
                req.body = options.body.parse(req.body);
            }
            // Validate query parameters
            if (options.query) {
                req.query = options.query.parse(req.query);
            }
            // Validate route parameters
            if (options.params) {
                req.params = options.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorResponse = src_1.ErrorSchema.parse({
                    error: {
                        code: src_1.ERROR_CODES.VALIDATION_FAILED,
                        message: "Validation failed",
                        details: error.errors,
                    },
                });
                return res.status(400).json(errorResponse);
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
const validateResponse = (schema) => {
    return (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            try {
                const validatedData = schema.parse(data);
                return originalJson.call(this, validatedData);
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    console.error("Response validation failed:", error.errors);
                    const errorResponse = src_1.ErrorSchema.parse({
                        error: {
                            code: src_1.ERROR_CODES.INTERNAL_ERROR,
                            message: "Response validation failed",
                            details: error.errors,
                        },
                    });
                    return originalJson.call(this, errorResponse);
                }
                return originalJson.call(this, data);
            }
        };
        next();
    };
};
exports.validateResponse = validateResponse;
//# sourceMappingURL=validation.js.map