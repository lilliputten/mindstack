import { getRequestConfig } from 'next-intl/server';

import { debugLocale } from '@/config';

import { getIntlMessageFallback, onIntlError } from './routing';
import { defaultLocale, localesList, TLocale } from './types';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = (await requestLocale) as TLocale;

  // Ensure that a valid locale is used
  if (!locale || !localesList.includes(locale)) {
    locale = defaultLocale;
  }

  const isDebugLocale = locale !== debugLocale;
  const messages = isDebugLocale
    ? (await import(`@/i18n/locales/${locale}.json`)).default
    : undefined;

  return {
    locale,
    messages,
    /* defaultOnError: (error) => {
     *   console.log('[request:defaultOnError]', error);
     *   debugger;
     * },
     */
    // @see https://next-intl.dev/docs/usage/configuration#error-handling
    onError: onIntlError,
    getMessageFallback: getIntlMessageFallback,
  };
});
