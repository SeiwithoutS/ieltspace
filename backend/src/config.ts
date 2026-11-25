import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// Resolve backend/.env independently of the terminal's working directory.
loadEnv({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const optionalStorageSetting = z.preprocess(value => value === '' ? undefined : value, z.string().min(1).optional());
const bucketName = z.string().regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/);

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NOTIFICATION_WORKER_ENABLED: z.enum(['true', 'false']).default('true').transform(value => value === 'true'),
  ATTEMPT_CLEANUP_WORKER_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  SAMPLE_MEDIA_CLEANUP_WORKER_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  VOCABULARY_IMAGE_CLEANUP_WORKER_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  GRADING_WORKER_ENABLED: z.enum(['true', 'false']).default('true').transform(value => value === 'true'),

  NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

  FRONTEND_ORIGIN: z.string().url(),
  AUTH_GOOGLE_CALLBACK_URL: z.string().url().default("http://localhost:3001/api/auth/google/callback"),
  AUTH_EMAIL_REDIRECT_URL: z.string().url(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STORAGE_BUCKET_COVERS: z.string().default("exam-covers"),
  STORAGE_BUCKET_EXAM_ASSETS: z.string().default("exam-assets"),
  STORAGE_BUCKET_SAMPLE_ASSETS: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,99}$/).default("sample-assets"),
  STORAGE_BUCKET_AVATARS: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,99}$/).default("avatars"),
  // Bucket RIÊNG TƯ chứa bản ghi âm Speaking của Người học (Supabase Storage). Tạo thủ công, xem docs/API.md.
  STORAGE_BUCKET_RECORDINGS: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,99}$/).default("speaking-recordings"),
  AVATAR_STORAGE_PROVIDER: z.enum(['auto', 'supabase', 'r2']).default('auto'),
  R2_ENDPOINT: optionalStorageSetting,
  R2_ACCESS_KEY_ID: optionalStorageSetting,
  R2_SECRET_ACCESS_KEY: optionalStorageSetting,
  R2_AVATAR_BUCKET: bucketName.default('ieltspace-avatars-dev'),
  R2_RECORDINGS_BUCKET: bucketName.default('ieltspace-recordings-dev'),
  R2_VOCABULARY_BUCKET: z.preprocess(value => value === '' ? undefined : value, bucketName.optional()),

  DATABASE_URL: z.string().min(1),
  GROQ_API_KEY: z.string().optional(),
  MW_LEARNERS_KEY: z.string().optional(),
  MW_DICTIONARY_KEY: z.string().optional(),
  MW_DICTIONARY_PRODUCT: z.enum(["collegiate"]).optional(),
  PIXABAY_API_KEY: z.string().optional(),
  UNSPLASH_ACCESS_KEY: z.string().optional(),

  COOKIE_SAME_SITE: z
      .enum(["lax", "strict", "none"])
      .default("lax"),
}).superRefine((config, ctx) => {
  const credentials = [config.R2_ENDPOINT, config.R2_ACCESS_KEY_ID, config.R2_SECRET_ACCESS_KEY];
  if ((credentials.some(Boolean) || config.AVATAR_STORAGE_PROVIDER === 'r2') && !credentials.every(Boolean)) {
    ctx.addIssue({ code: 'custom', path: ['R2_ENDPOINT'], message: 'Configure the R2 endpoint and both S3 credentials together.' });
  }
  if (config.R2_ENDPOINT && !/^https:\/\/[a-f0-9]{32}(?:\.(?:eu|fedramp))?\.r2\.cloudflarestorage\.com\/?$/i.test(config.R2_ENDPOINT)) {
    ctx.addIssue({ code: 'custom', path: ['R2_ENDPOINT'], message: 'Use the HTTPS Cloudflare R2 account S3 endpoint.' });
  }
  if (config.R2_AVATAR_BUCKET === config.R2_RECORDINGS_BUCKET) {
    ctx.addIssue({ code: 'custom', path: ['R2_RECORDINGS_BUCKET'], message: 'Use separate buckets for avatars and recordings.' });
  }
  if (config.R2_VOCABULARY_BUCKET &&
    [config.R2_AVATAR_BUCKET, config.R2_RECORDINGS_BUCKET].includes(config.R2_VOCABULARY_BUCKET)) {
    ctx.addIssue({ code: 'custom', path: ['R2_VOCABULARY_BUCKET'], message: 'Use a separate vocabulary images bucket.' });
  }
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
