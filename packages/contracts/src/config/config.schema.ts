import { z } from "zod";

export const ConfigSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  // Secrets/keys
  JWT_SECRET: z.string().min(10),
  MONGODB_URI: z.string().min(1),

  OPENAI_API_KEY: z.string().min(1),
  NEWS_API_KEY: z.string().min(1),

  EMAIL_PROVIDER: z.enum(["resend", "sendgrid"]).default("resend"),
  RESEND_API_KEY: z.string().min(1).optional(), // required if EMAIL_PROVIDER=resend
  SENDGRID_API_KEY: z.string().min(1).optional(), // required if EMAIL_PROVIDER=sendgrid

  // Quotas
  DAILY_GENERATE_CAP: z.coerce.number().int().min(1).default(3),
});

export type AppConfig = z.infer<typeof ConfigSchema>;
