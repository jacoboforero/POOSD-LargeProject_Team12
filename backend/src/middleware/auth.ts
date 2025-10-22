import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserModel } from "../models/User.model";
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

    // Verify JWT token
    const payload = verifyToken(token);

    // Get user from database
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Invalid or expired token",
        },
      });
    }

    // Attach user to request
    req.user = {
      _id: String(user._id),
      email: user.email,
      emailVerified: user.emailVerified,
    };

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