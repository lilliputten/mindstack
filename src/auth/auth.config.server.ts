import type { NextAuthConfig } from 'next-auth';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import EmailProvider, { NodemailerUserConfig } from 'next-auth/providers/nodemailer';
import Yandex from 'next-auth/providers/yandex';

import {
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  EMAIL_HOST,
  EMAIL_HOST_PASSWORD,
  EMAIL_HOST_USER,
  EMAIL_PORT,
  EMAIL_USE_SSL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  YANDEX_CLIENT_ID,
  YANDEX_CLIENT_SECRET,
} from '@/config/envServer';
import { isDev } from '@/config';

import TelegramProvider from './telegram/telegram-provider';

export default {
  providers: [
    Github({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),
    Yandex({
      // NOTE: Possible next-auth error: InvalidCheck: pkceCodeVerifier value could not be parsed.
      clientId: YANDEX_CLIENT_ID,
      clientSecret: YANDEX_CLIENT_SECRET,
    }),
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        auth: { user: EMAIL_HOST_USER, pass: EMAIL_HOST_PASSWORD },
        secure: EMAIL_USE_SSL,
        tls: {
          rejectUnauthorized: isDev ? false : undefined, // Dev only - remove in prod
        },
      } satisfies NodemailerUserConfig['server'],
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM || EMAIL_HOST_USER}>`,
    } satisfies NodemailerUserConfig),
    TelegramProvider(),
  ],
} satisfies NextAuthConfig;
