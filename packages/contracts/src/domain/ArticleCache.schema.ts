import { z } from "zod";
import { isoDate, urlString } from "../utils/common";

export const ArticleCacheSchema = z.object({
  _id: z.string(), // ObjectId as string
  url: urlString, // unique
  source: z.string().optional(),
  publishedAt: isoDate.optional(),
  language: z.string().optional(),

  contentExcerpt: z.string().optional(), // truncated text
  contentHash: z.string().optional(),
  allowedToStore: z.boolean().default(false),

  lastFetchedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
});

export type ArticleCache = z.infer<typeof ArticleCacheSchema>;
