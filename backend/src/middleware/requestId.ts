import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { RequestWithId } from "../types/request";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing request ID
  const id = (req.headers["x-request-id"] as string) || uuidv4();

  // Add to request object for use in routes
  req.headers["x-request-id"] = id;
  (req as RequestWithId).requestId = id;

  // Add to response headers
  res.setHeader("X-Request-ID", id);

  next();
};
