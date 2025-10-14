import { z } from "zod";
import { briefingStatus, isoDate, urlString } from "../utils/common";

export const BriefingArticleSchema = z.object({
  title: z.string(),
  url: urlString,
  source: z.string().optional(),
  publishedAt: isoDate.optional(),
  language: z.string().optional(),
  content: z.string().nullable().optional(), // may be null or omitted
  fetchStatus: z.enum(["ok", "skipped", "failed"]).optional(),
  cacheRef: z.string().optional(), // e.g., ArticleCache _id
});

export const BriefingSectionSchema = z.object({
  category: z.string(), // "technology" | "jobIndustry" | "interests" (open text ok)
  text: z.string(),
});

export const BriefingCitationsSchema = z.array(
  z.object({
    title: z.string().optional(),
    url: urlString,
    source: z.string().optional(),
    publishedAt: isoDate.optional(),
  })
);

export const BriefingCostsSchema = z.object({
  inputTokens: z.number().int().min(0).default(0),
  outputTokens: z.number().int().min(0).default(0),
  providerCostUsd: z.number().nonnegative().optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

export const BriefingSummarySchema = z.object({
  sections: z.array(BriefingSectionSchema).max(3),
  generatedAt: isoDate,
  llm: z.object({
    provider: z.string().default("openai"),
    model: z.string().default("gpt-4o-mini"),
    inputTokens: z.number().int().min(0).default(0),
    outputTokens: z.number().int().min(0).default(0),
  }),
  citations: BriefingCitationsSchema.optional(),
});

export const BriefingRequestSchema = z.object({
  topics: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  jobIndustry: z.string().optional(),
  demographic: z.string().optional(),
  source: z.string().default("news_api"),
});

export const BriefingSchema = z.object({
  _id: z.string(), // ObjectId as string
  userId: z.string(),
  status: briefingStatus,
  statusReason: z.string().optional(),

  request: BriefingRequestSchema,
  articles: z.array(BriefingArticleSchema).default([]),

  summary: BriefingSummarySchema.optional(),
  error: z.object({ message: z.string() }).optional(),

  // Timeline/progress
  queuedAt: isoDate.optional(),
  fetchStartedAt: isoDate.optional(),
  summarizeStartedAt: isoDate.optional(),
  completedAt: isoDate.optional(),
  progress: z.number().min(0).max(100).optional(),

  // Query window used for the news search
  sourceWindow: z.object({ from: isoDate, to: isoDate }).optional(),

  requestHash: z.string().optional(),
  counters: z
    .object({
      articleFetchCount: z.number().int().min(0).default(0),
      articleFetchFailedCount: z.number().int().min(0).default(0),
    })
    .optional(),
  costs: BriefingCostsSchema.optional(),
  traceId: z.string().optional(),

  createdAt: isoDate,
  updatedAt: isoDate,
});

export type Briefing = z.infer<typeof BriefingSchema>;
