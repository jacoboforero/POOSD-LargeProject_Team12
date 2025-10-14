import { z } from "zod";
import { BriefingSchema } from "../../domain/Briefing.schema";

export const BriefingResponseSchema = BriefingSchema;
export type BriefingResponse = z.infer<typeof BriefingResponseSchema>;
