import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d")
});

export const config = configSchema.parse(process.env);
