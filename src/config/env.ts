// This file should only be used in client components

// NOTE: Using relative imports only, as it's used in `next.config.ts`
import appInfo from '../app-info.json';
import { ensureBoolean } from '../lib/helpers/types';

// System
export const versionInfo = appInfo.versionInfo;

export const appId = String(process.env.NEXT_PUBLIC_APP_ID || 'mindstack');

// Environment
export const isDev = process.env.NODE_ENV === 'development';
// NOTE: Beware direct console invocation
export const isProd = !isDev;

/** Default translation language */
export const defaultLanguage = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

/** Debug translations (show translation ids instead of translated text in the UI) */
export const debugTranslations = ensureBoolean(process.env.NEXT_PUBLIC_DEBUG_TRANSLATIONS);

/** Debug locale (to show translation ids instead of translated text in the UI) */
export const debugLocale = String(process.env.NEXT_PUBLIC_DEBUG_LOCALE || 'xx');

/**Show debug locale (show translation ids instead of translated text in the UI) */
export const showDebugLocale = ensureBoolean(process.env.NEXT_PUBLIC_SHOW_DEBUG_LOCALE);

/** Don't display MISSING_MESSAGE errors */
export const suppressMissingTranslations = ensureBoolean(
  process.env.NEXT_PUBLIC_SUPPRESS_MISSING_TRANSLATIONS,
);

export const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindstack.vercel.app/';

export const dataContentType = 'application/json; charset=utf-8';

export const siteTitle = 'mindstack';
export const siteDescription = 'NextJS memory training application';
export const siteKeywords = [
  // ...
  'next.js',
  'ai',
  'chat',
];
export const mailSupport = 'lilliputten@gmail.com';
