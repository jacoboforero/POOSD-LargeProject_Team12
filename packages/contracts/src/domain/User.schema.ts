import { z } from "zod";
import { isoDate } from "../utils/common";

export const UserPreferencesSchema = z.object({
  topics: z.array(z.string()).default([]), // open-ended
  demographic: z.string().optional(), // open-ended
  jobIndustry: z.string().optional(), // open-ended
  interests: z.array(z.string()).default([]), // open-ended
  location: z.string().optional(), // city, state, or country
  lifeStage: z.string().optional(), // student, parent, retiree, etc.
  newsStyle: z.string().optional(), // summaries vs analysis
  newsScope: z.string().optional(), // global/local/both
  preferredHeadlines: z.array(z.string()).default([]), // what grabs attention
  scrollPastTopics: z.array(z.string()).default([]), // what users skip
});

export const UserLimitsSchema = z.object({
  dailyGenerateCap: z.number().int().min(1).default(3),
  generatedCountToday: z.number().int().min(0).default(0),
  resetAt: isoDate, // when counter resets (UTC midnight or computed)
});

export const OtpStateSchema = z.object({
  hash: z.string(),
  expiresAt: isoDate,
  attempts: z.number().int().min(0).default(0),
  lastRequestedAt: isoDate.optional(),
  throttledUntil: isoDate.optional(),
});

export const PushTokenSchema = z.object({
  platform: z.enum(["ios", "android"]),
  token: z.string(),
  addedAt: isoDate,
});

export const UserSchema = z.object({
  _id: z.string(), // ObjectId as string; keep flexible for clients
  name: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  otp: OtpStateSchema.optional(),

  preferences: UserPreferencesSchema.default({
    topics: [],
    interests: [],
    preferredHeadlines: [],
    scrollPastTopics: [],
  }),

  limits: UserLimitsSchema,

  timezone: z.string().optional(), // IANA, e.g., "America/New_York"
  notificationPrefs: z
    .object({
      onBriefingReady: z.boolean().default(true),
    })
    .default({ onBriefingReady: true }),
  pushTokens: z.array(PushTokenSchema).default([]),

  acceptedTermsAt: isoDate.optional(),
  acceptedPrivacyAt: isoDate.optional(),

  lastLoginAt: isoDate.optional(),
  lastIp: z.string().optional(),
  userAgent: z.string().optional(),

  createdAt: isoDate,
  updatedAt: isoDate,
});

export type User = z.infer<typeof UserSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
