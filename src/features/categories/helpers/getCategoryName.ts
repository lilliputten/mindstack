import { defaultLocale, TLocale, TTranslator } from '@/i18n';

import { TAvailableCategory } from '../types';

export function getCategoryName(category: TAvailableCategory, locale?: TLocale, t?: TTranslator) {
  const { id, translations } = category;
  let name: string | undefined;
  if (translations) {
    if (locale) {
      const found = translations.find((tr) => tr.locale === locale);
      if (found?.name) {
        name = found?.name;
      }
    }
    if (!name && defaultLocale !== locale) {
      const found = translations.find((tr) => tr.locale === defaultLocale);
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
