// This file should only be used in server components
// NOTE: Using relative imports only, as it's used in `next.config.ts`

import { z } from 'zod';

import { ensureBoolean } from '../lib/helpers/types';

if (typeof window !== 'undefined') {
  const error = new Error('The "envServer" should be used only in server components');
  // eslint-disable-next-line no-console
  console.error('[envServer]', error);
  debugger; // eslint-disable-line no-debugger
  throw error;
}

const envSchema = z.object({
  // App
  VERCEL_ENV: z.string().optional(),
  NODE_ENV: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  // Vercel
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  VERCEL_URL: z.string().optional(),

  // Telegram
  LOGGING_CHANNEL_ID: z.string().min(1),
  CONTROLLER_CHANNEL_ID: z.string().min(1),

  BOT_ADMIN_USERNAME: z.string().min(1),
  BOT_ADMIN_USERID: z.coerce.number(),

  BOT_USERNAME: z.string().min(1),
  BOT_USERNAME_TEST: z.string().optional(),
  BOT_TOKEN: z.string().min(1),
  BOT_TOKEN_TEST: z.string().optional(),
  WEBHOOK_HOST: z.string().optional(),

  // AI API
  // GigaChat AI API
  GIGACHAT_CREDENTIALS: z.string().min(1),
  GIGACHAT_MODEL: z.string().min(1),
  // CloudFlare AI API
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),

  // Generation limits
  BASIC_USER_GENERATIONS: z.coerce.number(),
  PRO_USER_MONTHLY_GENERATIONS: z.coerce.number(),

  // // Prisma
  // DATABASE_URL: z.string().min(1),
  // CONFIG_ID: z.coerce.number().optional(), // Default config slot

  // Authentication (NextAuth.js)
  // @see https://nextjs.org/learn/dashboard-app/adding-authentication
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  YANDEX_CLIENT_ID: z.string().min(1),
  YANDEX_CLIENT_SECRET: z.string().min(1),
  EMAIL_FROM_NAME: z.string().min(1),
  EMAIL_FROM: z.string().optional(),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.coerce.number(),
  // EMAIL_USE_SSL: z.coerce.boolean().optional(), // Will be converted below via ensureBoolean
  EMAIL_HOST_USER: z.string().min(1),
  EMAIL_HOST_PASSWORD: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);
export type TEnvServer = z.infer<typeof envSchema>;

if (!parsedEnv.success) {
  const error = new Error('Invalid server environment variables');
  // eslint-disable-next-line no-console
  console.error(error.message, parsedEnv.error.flatten().fieldErrors, parsedEnv);
  debugger; // eslint-disable-line no-debugger
  throw error;
}

const envServer = parsedEnv.data;

export const {
  // App
  VERCEL_ENV,
  NODE_ENV,
  NEXT_PUBLIC_APP_URL,
  // Vercel
  VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL,
  // AI API
  GIGACHAT_CREDENTIALS,
  GIGACHAT_MODEL,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  // Generation limits
  BASIC_USER_GENERATIONS,
  PRO_USER_MONTHLY_GENERATIONS,
  // Telegram
  LOGGING_CHANNEL_ID,
  CONTROLLER_CHANNEL_ID,
  BOT_ADMIN_USERNAME,
  BOT_ADMIN_USERID,
  // Other `BOT_*` variables are exporting conditionally below
  // Auth
  AUTH_SECRET,
  NEXTAUTH_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  YANDEX_CLIENT_ID,
  YANDEX_CLIENT_SECRET,
  // Email
  EMAIL_FROM_NAME,
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PORT,
  // EMAIL_USE_SSL,
  EMAIL_HOST_USER,
  EMAIL_HOST_PASSWORD,
} = envServer;

export const EMAIL_USE_SSL = ensureBoolean(process.env.EMAIL_USE_SSL);
export const SET_FIRST_USER_ADMIN = ensureBoolean(process.env.SET_FIRST_USER_ADMIN);
export const USE_ALLOWED_USERS = ensureBoolean(process.env.USE_ALLOWED_USERS);

export const isVercel = !!envServer.VERCEL_URL;
export const isVercelPreview = isVercel && VERCEL_ENV === 'preview';
export const isVercelProduction =
  isVercel && VERCEL_ENV === 'production' && !!envServer.VERCEL_PROJECT_PRODUCTION_URL;

export const isDev = envServer.NODE_ENV === 'development';

// Derived variables
export const PUBLIC_URL = isVercel
  ? 'https://' +
    (isVercelProduction ? envServer.VERCEL_PROJECT_PRODUCTION_URL : envServer.VERCEL_URL)
  : NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const WEBHOOK_HOST = envServer.WEBHOOK_HOST || PUBLIC_URL;

export const BOT_USERNAME =
  (isDev || isVercelPreview) && envServer.BOT_USERNAME_TEST
    ? envServer.BOT_USERNAME_TEST
    : envServer.BOT_USERNAME;
export const BOT_TOKEN =
  (isDev || isVercelPreview) && envServer.BOT_TOKEN_TEST
    ? envServer.BOT_TOKEN_TEST
    : envServer.BOT_TOKEN;

/* // DEBUG: Show environment (will appear in build logs)
 * console.log('[envServer]', {
 *   WEBHOOK_HOST,
 *   GIGACHAT_CREDENTIALS,
 *   GIGACHAT_MODEL,
 *   CLOUDFLARE_ACCOUNT_ID,
 *   CLOUDFLARE_API_TOKEN,
 *   PUBLIC_URL,
 *   isVercel,
 *   isVercelPreview,
 *   isVercelProduction,
 *   BOT_USERNAME,
 *   BOT_TOKEN,
 *   envServer,
 * });
 */
