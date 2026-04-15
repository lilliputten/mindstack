// This file should only be used in client components

// NOTE: Using relative imports only, as it's used in `next.config.ts`
import appInfo from '../app-info.json';
import { ensureBoolean, ensureNumber } from '../lib/helpers/types';

// System
export const versionInfo = appInfo.versionInfo;

export const appId = String(process.env.NEXT_PUBLIC_APP_ID || 'mindstack');

export const defaultAIGenerationTemperature =
  ensureNumber(process.env.NEXT_PUBLIC_GENERATION_TEMPERATURE) || 0.5;

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

// Stripe
export const doTestPayments = ensureBoolean(process.env.NEXT_DO_TEST_PAYMENTS);
export const stripePublishableKey = doTestPayments
  ? String(process.env.NEXT_STRIPE_PUBLISHABLE_KEY_TEST)
  : String(process.env.NEXT_STRIPE_PUBLISHABLE_KEY);

export const publicAppUrl = String(process.env.NEXT_PUBLIC_URL);

export const dataContentType = 'application/json; charset=utf-8';

// Default values for meta properties (see also translations under the `Page.Root*` keys)
export const siteTitle = 'MindStack Personal Knowledge Trainer';
export const siteDescription =
  'Create and run repetition trainings from your own topics and datasets';
export const siteKeywords = '';
