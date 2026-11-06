import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),

  NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

  FRONTEND_ORIGIN: z.string().url(),
  AUTH_GOOGLE_CALLBACK_URL: z.string().url().default("http://localhost:3001/api/auth/google/callback"),
  AUTH_EMAIL_REDIRECT_URL: z.string().url(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),

  DATABASE_URL: z.string().min(1),

  COOKIE_SAME_SITE: z
      .enum(["lax", "strict", "none"])
      .default("lax"),
});

export const env = envSchema.parse(process.env);

if (
    env.COOKIE_SAME_SITE === "none" &&
    env.NODE_ENV !== "production"
) {
  throw new Error(
      "Ví dụ này yêu cầu HTTPS/production khi COOKIE_SAME_SITE=none."
  );
}
