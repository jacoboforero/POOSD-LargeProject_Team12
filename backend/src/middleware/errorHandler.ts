import { Request, Response, NextFunction } from "express";
import { ErrorSchema, ERROR_CODES } from "../../../packages/contracts/src";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let errorCode: keyof typeof ERROR_CODES = "INTERNAL_ERROR";
  let message = "Internal server error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_FAILED";
    message = "Validation failed";
  } else if (err.name === "UnauthorizedError" || err.status === 401) {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    message = "Unauthorized";
  } else if (err.status === 403) {
    statusCode = 403;
    errorCode = "FORBIDDEN";
    message = "Forbidden";
  } else if (err.status === 404) {
    statusCode = 404;
    errorCode = "NOT_FOUND";
    message = "Not found";
  } else if (err.status === 429) {
    statusCode = 429;
    errorCode = "RATE_LIMITED";
    message = "Rate limit exceeded";
  } else if (err.status === 402) {
    statusCode = 402;
    errorCode = "QUOTA_EXCEEDED";
    message = "Quota exceeded";
  }

  const errorResponse = ErrorSchema.parse({
    error: {
      code: errorCode,
      message,
      details: err.details || err.message,
    },
  });

  res.status(statusCode).json(errorResponse);
};
