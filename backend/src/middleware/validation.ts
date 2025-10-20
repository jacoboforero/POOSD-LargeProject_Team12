import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ErrorSchema, ERROR_CODES } from "../../../packages/contracts/src";

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  response?: ZodSchema;
}

export const validateRequest = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorResponse = ErrorSchema.parse({
          error: {
            code: "VALIDATION_FAILED",
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

export const validateResponse = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (data: any) {
      try {
        const validatedData = schema.parse(data);
        return originalJson.call(this, validatedData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Response validation failed:", error.errors);
          const errorResponse = ErrorSchema.parse({
            error: {
              code: "INTERNAL_ERROR",
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
