import { z } from "zod";

/** Mongo ObjectId as 24-hex string */
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "ObjectId");

/** ISO-8601 datetime string with timezone offset (Z or ±hh:mm) */
export const isoDate = z.string().datetime({ offset: true });

/** Basic URL (http/https) */
export const urlString = z.string().url();

/** Pagination cursor (opaque) */
export const cursor = z.string().min(1);

/** Briefing status lifecycle */
export const briefingStatus = z.enum([
  "queued",
  "fetching",
  "summarizing",
  "done",
  "error",
]);

/** Platform enum for push tokens */
export const pushPlatform = z.enum(["ios", "android"]);

/** Error code enum kept small for MVP */
export const errorCode = z.enum([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "QUOTA_EXCEEDED",
  "VALIDATION_FAILED",
  "PROVIDER_ERROR",
  "INTERNAL_ERROR",
]);
