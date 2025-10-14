import { z } from "zod";
import { isoDate } from "../../utils/common";

export const UsageResponseSchema = z.object({
  dailyGenerateCap: z.number().int().min(1),
  generatedToday: z.number().int().min(0),
  resetAt: isoDate,
});

export type UsageResponse = z.infer<typeof UsageResponseSchema>;
