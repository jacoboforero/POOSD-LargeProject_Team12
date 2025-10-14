import { z } from "zod";
import { errorCode } from "../utils/common";

export const ErrorSchema = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ErrorPayload = z.infer<typeof ErrorSchema>;
