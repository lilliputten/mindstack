import { IntlError, IntlErrorCode } from 'next-intl';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import { pathnames } from '@/config/routesConfig';
import { debugLocale, suppressMissingTranslations } from '@/config';

import { defaultLocale, localesList } from './types';

export const matchLocaleFromErrorReg = /locale ['"`](\w+)/;
export const matchKeyFromErrorReg = /resolve (['"`])(.+?)\1/;

interface TGetMessageFallbackParams {
  error: IntlError;
  key: string;
  namespace?: string | undefined;
}

const loggedKeys: string[] = [];

export const getIntlMessageFallback = ({
  namespace,
  key,
  error,
}: TGetMessageFallbackParams): string => {
  const errStr = error.originalMessage || error.message;
  const match = errStr.match(matchLocaleFromErrorReg);
  const locale = match?.[1];
  const isDebugLocale = locale === debugLocale;
  const doDebug = process.env.NEXT_PUBLIC_DEBUG_TRANSLATIONS === 'true' || isDebugLocale;
  const suppressMessage = suppressMissingTranslations || isDebugLocale;
  // const doDebug = debugTranslations || isDev;
  if (!suppressMessage) {
    const matchKey = errStr.match(matchKeyFromErrorReg);
    const key = matchKey?.[2];
    if (key && !loggedKeys.includes(key)) {
      loggedKeys.push(key);
      // prettier-ignore
      console.warn('[routing:getIntlMessageFallback]', error.code, key || errStr, 'in locale', locale, 'namespace', namespace); // eslint-disable-line no-console
      // debugger; // eslint-disable-line no-debugger
    }
  }
  return [doDebug && namespace, key].filter(Boolean).join('.');
};

export const onIntlError = (error: IntlError & { key?: string }) => {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    const errStr = error.originalMessage || error.message;
    const matchLocale = errStr.match(matchLocaleFromErrorReg);
    const locale = matchLocale?.[1];
    const isDebugLocale = locale === debugLocale;
    const suppressMessage = suppressMissingTranslations || isDebugLocale;
    const matchKey = errStr.match(matchKeyFromErrorReg);
    const key = matchKey?.[2];
    // Suppress missing message error for debug locale
    if (!suppressMessage) {
      if (key && !loggedKeys.includes(key)) {
        loggedKeys.push(key);
        // eslint-disable-next-line no-console
        console.warn('[routing:onIntlError]', error.code, key || errStr, 'in locale', locale);
        // debugger; // eslint-disable-line no-debugger
      }
    }
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[routing:onIntlError]', error);
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
