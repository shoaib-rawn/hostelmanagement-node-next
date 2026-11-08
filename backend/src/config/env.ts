import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().startsWith("postgres"),
  JWT_ACCESS_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(7200),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:");
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.map(String).join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = result.data;
