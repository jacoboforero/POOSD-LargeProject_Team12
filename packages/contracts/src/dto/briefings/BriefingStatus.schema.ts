import { z } from "zod";
import { briefingStatus, isoDate } from "../../utils/common";

export const BriefingStatusResponseSchema = z.object({
  status: briefingStatus,
  statusReason: z.string().optional(),
  updatedAt: isoDate,
});

export type BriefingStatusResponse = z.infer<
  typeof BriefingStatusResponseSchema
>;
