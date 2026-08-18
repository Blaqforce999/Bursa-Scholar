import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  // Vercel Blob credentials — required once logo upload ships in Phase 9.
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
  STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
  STORAGE_BUCKET: process.env.STORAGE_BUCKET,
});
