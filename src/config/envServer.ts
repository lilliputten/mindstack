// This file should only be used in server components
// NOTE: Using relative imports only, as it's used in `next.config.ts`

import { ensureBoolean } from '../lib/helpers/types';
import { envServerSchema } from './envServerSchema';

if (typeof window !== 'undefined') {
  const error = new Error('The "envServer" should be used only in server components');
  // eslint-disable-next-line no-console
  console.error('[envServer]', error);
  debugger; // eslint-disable-line no-debugger
  throw error;
}

const parsedEnv = envServerSchema.safeParse(process.env);

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
  NEXT_PUBLIC_URL,
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
  EMAIL_TEST_USER,
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
  : NEXT_PUBLIC_APP_URL || NEXT_PUBLIC_URL;

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
