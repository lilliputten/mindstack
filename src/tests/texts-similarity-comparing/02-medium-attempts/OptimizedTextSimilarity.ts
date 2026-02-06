import { jaroWinklerSimilarity } from '../01-simple-tests/helpers/jaroWinklerSimilarity';

type TStemmer = (word: string) => string;
type TOptions = {
  useStemming: boolean;
  removeStopwords: boolean;
  nGramSize: number;
  cacheSize: number;
};
const defaultOptions: TOptions = {
  useStemming: true,
  removeStopwords: true,
  nGramSize: 2,
  cacheSize: 100,
} as const;

export class OptimizedTextSimilarity {
  locale: string;
  cache: Map<string, string[]>;
  options: TOptions;
  stemmer: TStemmer;

  constructor(locale = 'en', options: Partial<TOptions> = {}) {
    this.locale = locale;
    this.cache = new Map();
    this.options = {
      ...defaultOptions,
      ...options,
    };
    // Initialize stemmer based on locale
    this.stemmer = this.initStemmer();
  }

  initStemmer(): TStemmer {
    // Lightweight stemmer for common languages
    const stemmers: Record<string, TStemmer> = {
      en: (word: string) => {
        // Simple Porter stemmer rules (simplified)
        if (word.endsWith('sses') || word.endsWith('ies'))
          return word.substring(0, word.length - 2);
        if (word.endsWith('s') && !word.endsWith('ss')) return word.substring(0, word.length - 1);
        return word;
      },
      es: (word: string) => {
        // Simple Spanish stemmer
        if (word.endsWith('es')) return word.substring(0, word.length - 2);
        if (word.endsWith('s') && !word.endsWith('as') && !word.endsWith('os'))
          return word.substring(0, word.length - 1);
        return word;
      },
      ru: (word: string) => {
        // Basic Russian stemmer (very simplified)
        const suffixes = ['ов', 'ев', 'ин', 'ын', 'ых', 'их', 'ами', 'ями'];
        for (const suffix of suffixes) {
          if (word.endsWith(suffix)) {
            return word.substring(0, word.length - suffix.length);
          }
        }
        return word;
      },
    };
    const lang = this.locale.split('-')[0];
    return stemmers[lang] || ((word) => word);
  }

  preprocess(text: string) {
    const cacheKey = `preprocess:${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }
    // Fast normalization
    const processed: string = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Tokenize
    let tokens = processed.split(/\s+/);
    // Remove stopwords if enabled
    if (this.options.removeStopwords) {
      tokens = tokens.filter((word) => word.length > 2);
    }
    // Apply stemming if enabled
    if (this.options.useStemming) {
      tokens = tokens.map((word) => this.stemmer(word));
    }
    // Cache result
    if (this.cache.size < this.options.cacheSize) {
      this.cache.set(cacheKey, tokens);
    }
    return tokens;
  }

  fastSimilarity(text1: string, text2: string): number {
    // For texts up to 1KB, use optimized approach

    // 1. Quick check for exact or near-exact match
    if (text1 === text2) return 1.0;

    // 2. Character-based similarity for very different texts
    const charSimilarity = jaroWinklerSimilarity(text1, text2, this.locale);
    if (charSimilarity < 0.3) {
      return charSimilarity; // Very different, quick exit
    }

    // 3. Token-based similarity for medium to high similarity
    const tokens1 = this.preprocess(text1);
    const tokens2 = this.preprocess(text2);

    // Use intersection/union for speed
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const jaccard = union.size > 0 ? intersection.size / union.size : 0;

    // 4. Combine character and token similarity
    return charSimilarity * 0.4 + jaccard * 0.6;
  }

  // For 1KB texts with word order consideration
  nGramSimilarity(text1: string, text2: string, n = 2): number {
    const tokens1 = this.preprocess(text1);
    const tokens2 = this.preprocess(text2);

    if (tokens1.length < n || tokens2.length < n) {
      return this.fastSimilarity(text1, text2);
    }

    // Generate n-grams
    const getNGrams = (tokens: string[], n: number) => {
      const ngrams = [];
      for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(' '));
      }
      return ngrams;
    };

    const ngrams1 = getNGrams(tokens1, n);
    const ngrams2 = getNGrams(tokens2, n);

    const set1 = new Set(ngrams1);
    const set2 = new Set(ngrams2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }
}
