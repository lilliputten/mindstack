import natural from 'natural';

// export type TStemmer = natural.Stemmer;
export type TStemmer = { stem: (word: string) => string };

export function getStemmer(locale: string) {
  const lang = locale.split('-')[0].toLowerCase();

  const stemmers: Record<string, natural.Stemmer> = {
    en: natural.PorterStemmer,
    es: natural.PorterStemmerEs,
    ru: natural.PorterStemmerRu,
    fr: natural.PorterStemmerFr,
    de: natural.PorterStemmerDe,
    it: natural.PorterStemmerIt,
    pt: natural.PorterStemmerPt,
    nl: natural.PorterStemmerNl,
    sv: natural.PorterStemmerSv,
    no: natural.PorterStemmerNo,
  };
  return stemmers[lang] || stemmers.en;

  /* // Example of a simple approach
   * switch (lang) {
   *   case 'en':
   *     return {
   *       stem: (word: string) => {
   *         // Simple Porter stemmer rules (simplified)
   *         if (word.endsWith('sses') || word.endsWith('ies'))
   *           return word.substring(0, word.length - 2);
   *         if (word.endsWith('s') && !word.endsWith('ss')) return word.substring(0, word.length - 1);
   *         return word;
   *       },
   *     };
   *   case 'es':
   *     return {
   *       stem: (word: string) => {
   *         // Simple Spanish stemmer
   *         if (word.endsWith('es')) return word.substring(0, word.length - 2);
   *         if (word.endsWith('s') && !word.endsWith('as') && !word.endsWith('os'))
   *           return word.substring(0, word.length - 1);
   *         return word;
   *       },
   *     };
   *   case 'ru':
   *     return {
   *       stem: (word: string) => {
   *         // Basic Russian stemmer (very simplified)
   *         const suffixes = ['ов', 'ев', 'ин', 'ын', 'ых', 'их', 'ами', 'ями'];
   *         for (const suffix of suffixes) {
   *           if (word.endsWith(suffix)) {
   *             return word.substring(0, word.length - suffix.length);
   *           }
   *         }
   *         return word;
   *       },
   *     };
   *   default:
   *     return { stem: (word: string) => word };
   * }
   */
}
