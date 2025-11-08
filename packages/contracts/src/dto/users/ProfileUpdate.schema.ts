import { z } from "zod";
import { UserPreferencesSchema } from "../../domain/User.schema";

const NotificationPrefsUpdateSchema = z
  .object({
    onBriefingReady: z.boolean().optional(),
  })
  .partial()
  .optional();

export const ProfileUpdateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    timezone: z.string().max(120).optional(),
    preferences: UserPreferencesSchema.partial().optional(),
    notificationPrefs: NotificationPrefsUpdateSchema,
  })
  .strict();

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
