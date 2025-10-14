import { z } from "zod";
import { isoDate } from "../utils/common";

export const AuditLogSchema = z.object({
  _id: z.string(), // ObjectId as string
  userId: z.string().optional(),
  briefingId: z.string().optional(),
  event: z.string(), // e.g., 'briefing.status_changed', 'auth.otp_requested'
  data: z.unknown().optional(),
  createdAt: isoDate,
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
