import { z } from "zod";

export const BriefingGenerateRequestSchema = z.object({
  // Optional overrides; otherwise use saved user prefs
  topics: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  jobIndustry: z.string().optional(),
  demographic: z.string().optional(),

  // Optional idempotency/dedupe
  requestHash: z.string().optional(),
});

export type BriefingGenerateRequest = z.infer<
  typeof BriefingGenerateRequestSchema
>;

export const BriefingGenerateResponseSchema = z.object({
  briefingId: z.string(),
});
export type BriefingGenerateResponse = z.infer<
  typeof BriefingGenerateResponseSchema
>;
