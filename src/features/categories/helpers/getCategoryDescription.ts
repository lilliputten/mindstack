import { defaultLocale, TLocale, TTranslator } from '@/i18n';

import { TAvailableCategory } from '../types';

export function getCategoryDescription(
  category: TAvailableCategory,
  locale?: TLocale,
  t?: TTranslator,
) {
  const { id, translations } = category;
  let description: string | undefined;
  if (translations) {
    if (locale) {
      const found = translations.find((tr) => tr.locale === locale);
      if (found?.description) {
        description = found?.description;
      }
    }
    if (!description && defaultLocale !== locale) {
      const found = translations.find((tr) => tr.locale === defaultLocale);
      if (found?.description) {
        description = found?.description;
      }
    }
  }

  return description;
}
