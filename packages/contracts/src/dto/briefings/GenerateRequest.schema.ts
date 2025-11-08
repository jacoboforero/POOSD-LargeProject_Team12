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

const languageEnum = z.enum([
  "ar",
  "de",
  "en",
  "es",
  "fr",
  "he",
  "it",
  "nl",
  "no",
  "pt",
  "ru",
  "sv",
  "ud",
  "zh",
]);

export const CustomNewsQueryRequestSchema = z.object({
  topics: z.array(z.string()).min(1).optional(),
  includeKeywords: z.array(z.string()).optional(),
  excludeKeywords: z.array(z.string()).optional(),
  preferredSources: z.array(z.string()).max(20).optional(),
  language: languageEnum.optional(),
  format: z.enum(["narrative", "bullet_points"]).optional(),
  requestHash: z.string().optional(),
});

export type CustomNewsQueryRequest = z.infer<
  typeof CustomNewsQueryRequestSchema
>;

export const BriefingGenerateResponseSchema = z.object({
  briefingId: z.string(),
});
export type BriefingGenerateResponse = z.infer<
  typeof BriefingGenerateResponseSchema
>;
