// This file should only be used in server components
// NOTE: Using relative imports only, as it's used in `next.config.ts`

import { z } from 'zod';

export const envServerSchema = z.object({
  // App
  VERCEL_ENV: z.string().optional(),
  NODE_ENV: z.string().optional(),
  NEXT_PUBLIC_URL: z.string(),
  // Vercel
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  VERCEL_URL: z.string().optional(),

  // Yookassa
  YOOKASSA_SHOP_ID: z.string().min(1),
  YOOKASSA_SECRET_KEY: z.string().min(1),
  YOOKASSA_SHOP_ID_TEST: z.string().min(1),
  YOOKASSA_SECRET_KEY_TEST: z.string().min(1),

  // Stripe
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY_TEST: z.string().min(1),
  STRIPE_SECRET_KEY_TEST: z.string().min(1),

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
  DATABASE_URL: z.string().min(1),
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
  EMAIL_TEST_USER: z.string().min(1),
  EMAIL_HOST_PASSWORD: z.string().min(1),
});

export type TEnvServer = z.infer<typeof envServerSchema>;
