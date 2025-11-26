import { useLocale, useTranslations as useNextIntlTranslations } from 'next-intl';

import { debugLocale, debugTranslations } from '@/config';

import { getDebugT } from './getDebugT';

export function useT(namespace?: string) {
  const locale = useLocale();
  const isDebugLocale = debugTranslations || locale === debugLocale;

  try {
    const originalT = useNextIntlTranslations(namespace);

    if (isDebugLocale) {
      return getDebugT(namespace);
    }

    return originalT;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[useT]', {
      error,
      namespace,
      locale,
    });
    debugger; // eslint-disable-line no-debugger
    return getDebugT(namespace);
  }
}

export type TTranslator = ReturnType<typeof useT>;
