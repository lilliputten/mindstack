import { IntlError, IntlErrorCode } from 'next-intl';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import { pathnames } from '@/config/routesConfig';
import { debugLocale, suppressMissingTranslations } from '@/config';

import { defaultLocale, localesList } from './types';

export const matchLocaleFromErrorReg = /locale ['"`](\w+)/;

interface TGetMessageFallbackParams {
  error: IntlError;
  key: string;
  namespace?: string | undefined;
}

export const getIntlMessageFallback = ({
  namespace,
  key,
  error,
}: TGetMessageFallbackParams): string => {
  const match = String(error).match(matchLocaleFromErrorReg);
  const locale = match?.[1];
  const isDebugLocale = locale === debugLocale;
  const doDebug = process.env.NEXT_PUBLIC_DEBUG_TRANSLATIONS === 'true' || isDebugLocale;
  const suppressMessage = suppressMissingTranslations || isDebugLocale;
  // const doDebug = debugTranslations || isDev;
  if (!suppressMessage) {
    // eslint-disable-next-line no-console
    console.warn('[routing:getIntlMessageFallback]', error.code, {
      doDebug,
      error,
      key,
      namespace,
    });
  }
  return [doDebug && namespace, key].filter(Boolean).join('.');
};

export const onIntlError = (error: IntlError) => {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    const match = String(error).match(matchLocaleFromErrorReg);
    const locale = match?.[1];
    const isDebugLocale = locale === debugLocale;
    const suppressMessage = suppressMissingTranslations || isDebugLocale;
    /* console.log('[routing:onIntlError]', {
     *   suppressMissingTranslations,
     *   debugLocale,
     *   locale,
     *   error,
     * });
     */
    // Suppress missing message error for debug locale
    if (!suppressMessage) {
      // eslint-disable-next-line no-console
      console.warn('[routing:onIntlError] MISSING_MESSAGE', {
        locale,
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[routing:onIntlError]', error);
  // debugger;
};

// @see https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: localesList as unknown as string[],

  // Used when no locale matches
  defaultLocale,

  pathnames,
});

export const {
  // Lightweight wrappers around Next.js' navigation APIs that will consider the routing configuration
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
