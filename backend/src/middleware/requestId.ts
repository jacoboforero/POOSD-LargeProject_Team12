import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing request ID
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();

  // Add to request object for use in routes
  req.headers["x-request-id"] = requestId;

  // Add to response headers
  res.setHeader("X-Request-ID", requestId);

  next();
};
