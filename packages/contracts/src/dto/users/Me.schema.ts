import { z } from "zod";
import { UserSchema } from "../../domain/User.schema";

export const MeResponseSchema = UserSchema;
export type MeResponse = z.infer<typeof MeResponseSchema>;
