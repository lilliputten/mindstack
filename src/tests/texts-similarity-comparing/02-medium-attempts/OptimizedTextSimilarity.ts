import { NGrams } from 'natural';

import { jaroWinklerSimilarity } from '../01-simple-tests/helpers/jaroWinklerSimilarity';
import { getStemmer, TStemmer } from './helpers/getStemmer';

type TOptions = {
  allowFast: boolean;
  useStemming: boolean;
  removeStopwords: boolean;
  nGramSize: number;
  cacheSize: number;
};
const defaultOptions: TOptions = {
  allowFast: true,
  useStemming: true,
  removeStopwords: true,
  nGramSize: 2,
  cacheSize: 100,
} as const;

/**
 * Generates n-grams from an array of tokens.
 *
 * @param tokens - Array of string tokens to generate n-grams from
 * @param n - Size of each n-gram (number of tokens per n-gram)
 * @returns Array of n-gram strings
 *
 * @example
 * // Generate bigrams (2-grams) from a sentence
 * const tokens = ['the', 'quick', 'brown', 'fox'];
 * const bigrams = getNGrams(tokens, 2);
 * // Result: ['the quick', 'quick brown', 'brown fox']
 *
 * @example
 * // Generate trigrams (3-grams) from a sentence
 * const tokens = ['the', 'quick', 'brown', 'fox', 'jumps'];
 * const trigrams = getNGrams(tokens, 3);
 * // Result: ['the quick brown', 'quick brown fox', 'brown fox jumps']
 *
 * @example
 * // Generate unigrams (1-gram) from a sentence
 * const tokens = ['the', 'quick', 'brown', 'fox'];
 * const unigrams = getNGrams(tokens, 1);
 * // Result: ['the', 'quick', 'brown', 'fox']
 */
function getNGrams(tokens: string[], n: number) {
  const res1 = NGrams.ngrams(tokens, n).map((list) => list.join(' '));
  /* // Local simple solution
   * const ngrams = [];
   * for (let i = 0; i <= tokens.length - n; i++) {
   *   ngrams.push(tokens.slice(i, i + n).join(' '));
   * }
   * const res2 = ngrams;
   */
  return res1;
}

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
    this.stemmer = getStemmer(this.locale);
  }

  /**
   * Preprocesses input text by normalizing, tokenizing, removing stopwords,
   * and applying stemming
   *
   * @param text - The raw text string to preprocess
   * @returns Array of preprocessed tokens
   */
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
      tokens = tokens.map((word) => this.stemmer.stem(word));
    }
    // Cache result
    if (this.cache.size < this.options.cacheSize) {
      this.cache.set(cacheKey, tokens);
    }
    return tokens;
  }

  /**
   * Calculates fast similarity between two texts using optimized approach
   * Combines character-based Jaro-Winkler similarity with token-based Jaccard similarity
   *
   * @param text1 - First text string to compare
   * @param text2 - Second text string to compare
   * @returns Similarity score between 0 and 1, where 1 means identical texts
   */
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

  /**
   * Calculates n-gram similarity between two texts using Jaccard similarity algorithm
   * Considers word order information, suitable for comparing texts up to 1KB
   *
   * @param text1 - First text string to compare
   * @param text2 - Second text string to compare
   * @param n - Size of n-grams, default is 2 (bigrams)
   * @returns Similarity score between 0 and 1, where 1 means identical texts
   */
  nGramSimilarity(text1: string, text2: string, n = 2): number {
    const tokens1 = this.preprocess(text1);
    const tokens2 = this.preprocess(text2);

    if (this.options.allowFast && (tokens1.length < n || tokens2.length < n)) {
      return this.fastSimilarity(text1, text2);
    }

    const ngrams1 = getNGrams(tokens1, n);
    const ngrams2 = getNGrams(tokens2, n);

    /* console.log('[OptimizedTextSimilarity:nGramSimilarity]', {
     *   ngrams1,
     *   ngrams2,
     *   tokens1,
     *   tokens2,
     *   text1,
     *   text2,
     * });
     */

    const set1 = new Set(ngrams1);
    const set2 = new Set(ngrams2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }
}
