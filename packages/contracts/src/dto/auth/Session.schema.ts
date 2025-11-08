import { z } from "zod";
import { UserSchema } from "../../domain/User.schema";

export const SessionSchema = z.object({
  token: z.string(),
  user: UserSchema.pick({
    _id: true,
    name: true,
    email: true,
    emailVerified: true,
    preferences: true,
    timezone: true,
    notificationPrefs: true,
    createdAt: true,
    updatedAt: true,
  }),
});

export type Session = z.infer<typeof SessionSchema>;
