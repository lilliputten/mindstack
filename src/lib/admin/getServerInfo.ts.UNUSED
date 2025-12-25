'use server';

import {
  // BOT_TOKEN,
  BOT_USERNAME,
  isDev,
  // isLocal,
  isVercel,
  isVercelPreview,
  isVercelProduction,
  NEXT_PUBLIC_APP_URL,
  // NEXT_PUBLIC_LOCAL,
  NODE_ENV,
  PUBLIC_URL,
  VERCEL_ENV,
  VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL,
  WEBHOOK_HOST,
} from '@/config/envServer';
import { versionInfo } from '@/config';

import { getErrorText } from '../helpers';

export async function getServerInfo() {
  try {
    return {
      versionInfo,
      VERCEL_ENV,
      NODE_ENV,
      // NEXT_PUBLIC_LOCAL,
      NEXT_PUBLIC_APP_URL,
      // Vercel
      VERCEL_PROJECT_PRODUCTION_URL,
      VERCEL_URL,
      PUBLIC_URL,
      BOT_USERNAME,
      WEBHOOK_HOST,
      // BOT_TOKEN,
      // isLocal,
      isDev,
      isVercel,
      isVercelPreview,
      isVercelProduction,
    };
  } catch (error) {
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[StartBotPage:getServerInfo]', errMsg, { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
