import { z } from "zod";

export const OtpVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8),
});

export type OtpVerify = z.infer<typeof OtpVerifySchema>;
