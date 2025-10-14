import { z } from "zod";
import { isoDate } from "../../utils/common";

export const BriefingListItemSchema = z.object({
  _id: z.string(),
  status: z.enum(["queued", "fetching", "summarizing", "done", "error"]),
  statusReason: z.string().optional(),
  createdAt: isoDate,
  updatedAt: isoDate,
  // minimal preview fields for list rendering
  summaryPreview: z
    .object({
      sections: z
        .array(z.object({ category: z.string(), text: z.string() }))
        .max(3)
        .optional(),
    })
    .optional(),
});

export const BriefingsListResponseSchema = z.object({
  items: z.array(BriefingListItemSchema),
  nextCursor: z.string().nullable(),
});

export type BriefingsListResponse = z.infer<typeof BriefingsListResponseSchema>;
