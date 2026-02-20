/*! NOTE: Dynamically imports
 * - stopwords-ru
 * - stopwords/*
 */

import { getLanguageId } from './helpers';
import { TStopwords } from './types';

interface TStopwordsOptions {
  useDefault?: boolean;
  extraWords?: string[];
  removeWords?: string[];
}

const stopwordsLangs = {
  ru: 'russain', // From stopwords-ru
  nl: 'dutch',
  en: 'english',
  fr: 'french',
  de: 'german',
  it: 'italian',
  es: 'spanish',
} as const;
export type TStopwordsId = keyof typeof stopwordsLangs;
export type TStopwordsModule = (typeof stopwordsLangs)[TStopwordsId];

const stopwordsCache = new Map<string, TStopwords>();

/**
 * Get cached stopwords set for a language
 * @param locale Language code (e.g. 'en', 'ru', 'ru-RU')
 * @param options Configuration options
 */
export async function getCachedStopwords(
  locale: string,
  options: TStopwordsOptions = {},
): Promise<TStopwords> {
  const lang = getLanguageId(locale);
  const cacheKey = lang;

  // Return cached version if available
  if (stopwordsCache.has(cacheKey)) {
    return stopwordsCache.get(cacheKey)!;
  }

  let langId = lang as TStopwordsId;

  if (!stopwordsLangs[langId]) {
    const message = `Stopword language "${lang}" is not supported.`;
    if (options.useDefault) {
      // eslint-disable-next-line no-console
      console.warn('[stopwords:getCachedStopwords]', message, 'Failing back to English.');
      langId = 'en';
    } else {
      // eslint-disable-next-line no-console
      console.error('[stopwords:getCachedStopwords]', message, 'Throwing an exception.');
      debugger; // eslint-disable-line no-debugger
      throw new Error(message);
    }
  }

  let stopwordsList: string[];

  try {
    if (langId === 'ru') {
      const importedRu = await import(`stopwords-ru`);
      stopwordsList = importedRu.default;
    } else {
      const moduleName = stopwordsLangs[langId];
      const imported = await import(`stopwords/${moduleName}`);
      stopwordsList = imported[moduleName];
    }
    if (!stopwordsList) {
      if (!options.useDefault) {
        throw new Error(`Got no stopwords for language "${lang}".`);
      }
    }
  } catch (error) {
    const message = `Cannot import stopwords for language "${lang}".`;
    // eslint-disable-next-line no-console
    console.error('[stopwords:getCachedStopwords]', message, 'Throwing an exception.', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(message);
  }

  const stopwords: TStopwords = new Set(stopwordsList || []);

  // Add extra words if specified
  if (options.extraWords?.length) {
    options.extraWords.forEach((word) => stopwords.add(word.toLowerCase()));
  }

  // Remove words if specified
  if (options.removeWords?.length) {
    options.removeWords.forEach((word) => stopwords.delete(word.toLowerCase()));
  }

  // Cache for future use
  stopwordsCache.set(cacheKey, stopwords);

  return stopwords;
}

// Helper function to clear stopwords cache
export function clearStopwordsCache() {
  stopwordsCache.clear();
}
