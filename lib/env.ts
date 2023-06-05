import { z } from 'zod';

const envVariablesZodSchema = z.object({
  API_KEY: z.string(),
  WEBSITE_URL: z.string(),
  KEYWORDS: z.string(),
  EMAILS_TO_NOTIFY: z.string(),
  POSTMARK_API_KEY: z.string(),
  SENDER_EMAIL_NAME: z.string(),
  UPSTASH_REDIS_TOKEN: z.string(),
  UPSTASH_REDIS_URL: z.string()
});

export const envVariablesValidation = envVariablesZodSchema.safeParse(process.env);

if (envVariablesValidation.success === false) {
  throw new Error('Invalid environment variables');
}

export const {
  API_KEY,
  WEBSITE_URL,
  KEYWORDS,
  EMAILS_TO_NOTIFY,
  POSTMARK_API_KEY,
  SENDER_EMAIL_NAME,
  UPSTASH_REDIS_TOKEN,
  UPSTASH_REDIS_URL
} = envVariablesValidation.data;
