/*! NOTE: Dynamically imports
 * - multilingual-stemmer
 */

import { Stemmer } from 'multilingual-stemmer';

import { TStemmer } from './types';

/** Cached stemmer objects, per language */
const cachedStemmers = new Map<string, TStemmer>();

/** Only supported & required languages.
 * See `languageMap` below and really supported languages in the
 * `node_modules/multilingual-stemmer/dist/index.d.ts` module.
 *
 * Compare values with `src/constants/languages/ISO-639-1-language.json`
 */
const stemmerLangs = [
  'ar',
  'da',
  'nl',
  'en',
  'fi',
  'fr',
  'de',
  'el',
  'hu',
  'it',
  'pt',
  'ro',
  'ru',
  'es',
  'sw',
  'ta',
  'tr',
] as const;
type TStemmerLang = (typeof stemmerLangs)[number];

/** Fully defined options type */
interface TStemmerDefinedOptions {
  /** Use English for non-supported languages */
  failbackToEnglish: boolean;
}
/** Otional options type */
export type TStemmerOptions = Partial<TStemmerDefinedOptions>;

/** Default options */
export const defaultStemmerOptions: TStemmerDefinedOptions = {
  failbackToEnglish: true,
};

async function dynamicallyGetStemmer(lang: string, opts: TStemmerOptions = {}): Promise<TStemmer> {
  const {
    // Extend default options
    failbackToEnglish = defaultStemmerOptions.failbackToEnglish,
  } = opts;

  let stemmerLang = lang as TStemmerLang;
  if (!stemmerLangs.includes(stemmerLang)) {
    const message = `Stemmer language "${lang}" is not supported.`;
    if (failbackToEnglish) {
      // eslint-disable-next-line no-console
      console.warn('[stemmers:dynamicallyGetStemmer]', message, 'Failing back to English.');
      stemmerLang = 'en';
    } else {
      // eslint-disable-next-line no-console
      console.error('[stemmers:dynamicallyGetStemmer]', message, 'Throwing an exception.');
      debugger; // eslint-disable-line no-debugger
      throw new Error(message);
    }
  }

  /* // UNUSED: Attempt to use `stemmer-ru`
   * // (`https://www.npmjs.com/package/stemmer-ru`) or other stemmers in order to
   * // solve the `{size: 1, поня проблему => 1} Map(1) {size: 1, понима проблем
   * // => 1}` probmlem (see test-data for the specific example)
   * if (lang === 'ru') {
   *   const { stemmer } = await import('stemmer-ru');
   *   const x = new stemmer();
   *   // @ts-expect-error: Manually set the missing function
   *   x.stem = x.stemWord;
   *   return x as unknown as TStemmer;
   * }
   */

  const { Languages } = await import('multilingual-stemmer');

  const languageMap = {
    ar: Languages.Arabic,
    da: Languages.Danish,
    nl: Languages.Dutch,
    en: Languages.English,
    fi: Languages.Finnish,
    fr: Languages.French,
    de: Languages.German,
    el: Languages.Greek,
    hu: Languages.Hungarian,
    it: Languages.Italian,
    pt: Languages.Portuguese,
    ro: Languages.Romanian,
    ru: Languages.Russian,
    es: Languages.Spanish,
    sw: Languages.Swedish,
    ta: Languages.Tamil,
    tr: Languages.Turkish,
  };
  const stemmer = new Stemmer(languageMap[stemmerLang]);
  return stemmer;
}

export async function getCachedStemmer(lang: string, opts?: TStemmerOptions): Promise<TStemmer> {
  if (cachedStemmers.has(lang)) {
    return cachedStemmers.get(lang)!;
  }
  const stemmer = await dynamicallyGetStemmer(lang, opts);
  cachedStemmers.set(lang, stemmer);
  return stemmer;
}
