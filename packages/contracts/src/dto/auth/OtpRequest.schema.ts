import { z } from "zod";

export const OtpRequestSchema = z.object({
  email: z.string().email(),
});

export type OtpRequest = z.infer<typeof OtpRequestSchema>;
