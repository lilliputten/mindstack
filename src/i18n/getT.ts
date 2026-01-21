'use server';

import { getLocale, getTranslations as nextIntlGetTranslations } from 'next-intl/server';

import { debugLocale, debugTranslations } from '@/config';

import { getDebugT } from './getDebugT';

type TGetTOptions = { locale?: string; namespace?: string };

export async function getT(opts?: TGetTOptions) {
  // Use the provided locale if available, otherwise get it from the request context
  const locale = opts?.locale ? opts.locale : await getLocale();
  const isDebugLocale = debugTranslations || locale === debugLocale;
  if (isDebugLocale) {
    return getDebugT(opts?.namespace);
  }
  return await nextIntlGetTranslations({ ...opts, locale });
}

/** Alias for shorthand getT */
export const getTranslations = getT;
