import { z } from "zod";
import { pushPlatform } from "../../utils/common";

export const PushTokenUpsertSchema = z.object({
  platform: pushPlatform,
  token: z.string(),
});

export type PushTokenUpsert = z.infer<typeof PushTokenUpsertSchema>;
