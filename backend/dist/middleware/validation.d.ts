import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
export interface ValidationOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    response?: ZodSchema;
}
export declare const validateRequest: (options: ValidationOptions) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateResponse: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map