import { z } from "zod";

export const ScheduleUpdateSchema = z.object({
  enabled: z.boolean(),
  hourLocal: z.number().int().min(0).max(23),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0=Sun
});

export type ScheduleUpdate = z.infer<typeof ScheduleUpdateSchema>;
