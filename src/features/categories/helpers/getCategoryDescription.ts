import { defaultLocale, TLocale, TTranslator } from '@/i18n';

import { TAvailableCategory } from '../types';

export function getCategoryDescription(
  category: TAvailableCategory,
  locale?: TLocale,
  _t?: TTranslator,
) {
  const { translations } = category;
  let description: string | undefined;
  if (translations) {
    // Try to find a description for the current translation
    if (locale) {
      const found = translations.find((tr) => tr.locale === locale);
      if (found?.description) {
        description = found?.description;
      }
    }
    // Otherwise get a description for the default translation
    if (!description && defaultLocale !== locale) {
      const found = translations.find((tr) => tr.locale === defaultLocale);
      if (found?.description) {
        description = found?.description;
      }
    }
    // Otherwise try to find any translation
    if (!description) {
      const found = translations.find((tr) => tr.description);
      if (found?.description) {
        description = found?.description;
      }
    }
  }

  return description;
}
