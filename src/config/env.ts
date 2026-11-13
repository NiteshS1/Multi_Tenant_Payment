import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),

    DATABASE_URL: z.string().url(),

    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("debug"),

    SHUTDOWN_TIMEOUT_MS: z.coerce
        .number()
        .int()
        .positive()
        .default(10000)
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment configuration:",
    z.treeifyError(result.error)
  );
  
  process.exit(1);
}

export const env = Object.freeze(result.data);