import { TAvailableCategory } from '../types';

/**
 * Extracts all keywords from category translations across all locales
 * Returns an array of unique keywords from all available translations
 */
export function getAllCategoryKeywords(category: TAvailableCategory): string[] {
  const { translations } = category;
  const allKeywords: string[] = [];

  if (translations) {
    // Add keywords from all other translations
    translations.forEach((translation) => {
      if (translation.keywords) {
        allKeywords.push(...extractKeywordsFromString(translation.keywords));
      }
    });
  }

  allKeywords.sort();

  // Return unique keywords
  return Array.from(new Set(allKeywords));
}

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
