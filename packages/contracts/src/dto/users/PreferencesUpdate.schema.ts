import { z } from "zod";

export const PreferencesUpdateSchema = z.object({
  topics: z.array(z.string()).optional(),
  demographic: z.string().optional(),
  jobIndustry: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export type PreferencesUpdate = z.infer<typeof PreferencesUpdateSchema>;
