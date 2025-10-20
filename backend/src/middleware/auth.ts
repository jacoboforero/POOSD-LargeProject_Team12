import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { ERROR_CODES } from "../../../packages/contracts/src";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Access token required",
        },
      });
    }

    const session = await authService.validateToken(token);
    if (!session) {
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Invalid or expired token",
        },
      });
    }

    req.user = session.user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Authentication failed",
      },
    });
  }
};
