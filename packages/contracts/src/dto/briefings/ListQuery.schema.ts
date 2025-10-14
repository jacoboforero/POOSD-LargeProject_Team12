import { z } from "zod";

export const BriefingsListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type BriefingsListQuery = z.infer<typeof BriefingsListQuerySchema>;
