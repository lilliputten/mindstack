import { defaultLocale, TLocale } from '@/i18n';

import { TAvailableCategory } from '../types';

/**
 * Helper function to extract keywords from a comma-separated string
 */
function extractKeywordsFromString(keywordsString: string): string[] {
  if (!keywordsString) {
    return [];
  }

  return keywordsString
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

/**
 * Extracts all keywords from category translations across all locales
 * Returns an array of unique keywords from all available translations
 */
export function getAllCategoryKeywords(category: TAvailableCategory): string[] {
  const { translations } = category;
  const keywords: string[] = [];

  if (translations) {
    // Add keywords from all other translations
    translations.forEach((translation) => {
      if (translation.keywords) {
        keywords.push(...extractKeywordsFromString(translation.keywords));
      }
    });
  }

  keywords.sort();

  // Return unique keywords
  return Array.from(new Set(keywords));
}

/**
 * Extract keywords from category translations for the current or default locale
 */
export function getCategoryKeywords(category: TAvailableCategory, locale?: TLocale): string[] {
  const { translations } = category;
  const keywords: string[] = [];

  if (translations) {
    // Try to find a keywords for the current translation
    if (locale) {
      const found = translations.find((tr) => tr.locale === locale);
      if (found?.keywords?.trim()) {
        keywords.push(...extractKeywordsFromString(found?.keywords));
      }
    }
    // Otherwise get a keywords for the default translation
    if (!keywords.length && defaultLocale !== locale) {
      const found = translations.find((tr) => tr.locale === defaultLocale);
      if (found?.keywords) {
        keywords.push(...extractKeywordsFromString(found?.keywords));
      }
    }
    // Otherwise try to find any translation
    if (!keywords.length) {
      const found = translations.find((tr) => tr.keywords);
      if (found?.keywords) {
        keywords.push(...extractKeywordsFromString(found?.keywords));
      }
    }
  }

  keywords.sort();

  // Return unique keywords
  return Array.from(new Set(keywords));
}
