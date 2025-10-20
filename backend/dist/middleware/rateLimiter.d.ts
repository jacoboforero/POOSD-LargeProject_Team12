import { Request, Response } from "express";
export declare const ipRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const userRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const dailyQuotaCheck: (req: Request, res: Response, next: Function) => void;
//# sourceMappingURL=rateLimiter.d.ts.map