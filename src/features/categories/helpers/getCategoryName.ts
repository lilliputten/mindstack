import { defaultLocale, TLocale, TTranslator } from '@/i18n';

import { TAvailableCategory } from '../types';

export function getCategoryName(category: TAvailableCategory, locale?: TLocale, t?: TTranslator) {
  const { id, translations } = category;
  let name: string | undefined;
  if (translations) {
    // Try to find a name for the current translation
    if (locale) {
      const found = translations.find((tr) => tr.locale === locale);
      if (found?.name) {
        name = found?.name;
      }
    }
    // Otherwise get a name for the default translation
    if (!name && defaultLocale !== locale) {
      const found = translations.find((tr) => tr.locale === defaultLocale);
      if (found?.name) {
        name = found?.name;
      }
    }
    // Otherwise try to find any translation
    if (!name && defaultLocale !== locale) {
      const found = translations.find((tr) => tr.name);
      if (found?.name) {
        name = found?.name;
      }
    }
  }
  // Fallback
  if (!name) {
    const namePrefix = 'Category';
    name = (t ? t(namePrefix) : namePrefix) + ` ${id}`;
  }
  return name;
}
