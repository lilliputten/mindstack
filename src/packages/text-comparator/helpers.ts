import { TStopwords, TTextProfileMap } from './types';

/**
 * Extracts the language ID from a locale string
 *
 * @param locale - The locale string (e.g., 'en-US', 'fr-FR', 'zh-CN')
 * @returns The language ID in lowercase (e.g., 'en', 'fr', 'zh')
 */
export function getLanguageId(locale: string) {
  return locale.split('-')[0].toLowerCase();
}

/**
 * Prepares and processes text tokens by normalizing, cleaning, and filtering
 *
 * @param text - The input text string to be processed
 * @param stopwords - Optional set of stopwords to be filtered out from the tokens
 * @returns Array of processed tokens with accents removed, special characters filtered, and stopwords excluded
 */
export function getTextTokens(text: string, stopwords?: TStopwords) {
  // Basic preprocessing
  const tokens = text
    .toLowerCase()
    .normalize('NFD') // Expand accented symbols
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Keep letters and numbers
    .split(/\s+/)
    .filter((token) => token.length > 2 && (!stopwords || !stopwords.has(token))); // Remove single characters and stopwords
  return tokens;
}

/**
 * Generates n-grams from an array of tokens.
 *
 * An n-gram is a contiguous sequence of n items from a given sequence.
 * For example, if tokens = ["hello", "world", "how", "are", "you"] and n = 2,
 * the result would be ["hello world", "world how", "how are", "are you"].
 *
 * @param tokens - Array of strings to generate n-grams from
 * @param n - The size of each n-gram (must be a positive integer)
 * @returns Array of n-gram strings, or empty array if tokens length < n
 */
export function getNGramsSimple(tokens: string[], n: number): string[] {
  if (tokens.length < n) return [];
  const result: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    const list = tokens.slice(i, i + n);
    // list.sort(); // Return sorted tokens?
    result.push(list.join(' '));
  }
  return result;
}

/**
 * Compares two n-grams lists (previously generated with `getNGram*`) using
 * n-gram histogram intersection algorithm to calculate similarity score
 * between 0 and 1.
 *
 * It's more suitable for larger texts, but less precise.
 *
 * @param ngrams1 - First n-gram frequency mappings
 * @param ngrams2 - Second n-gram frequency mappings
 * @returns Similarity score between 0 (no similarity) and 1 (identical profiles)
 */
export function compareNGrams(ngrams1: TTextProfileMap, ngrams2: TTextProfileMap): number {
  // Calculate similarity using histogram intersection
  const allNGrams = new Set([...ngrams1.keys(), ...ngrams2.keys()]);
  let intersection = 0;
  let total = 0;

  allNGrams.forEach((ngram) => {
    const freq1 = ngrams1.get(ngram) || 0;
    const freq2 = ngrams2.get(ngram) || 0;
    intersection += Math.min(freq1, freq2);
    total += Math.max(freq1, freq2);
  });

  return total > 0 ? intersection / total : 0;
}

/**
 * Compares two token arrays (generated with `getTextTokens`) using cosine
 * similarity.
 *
 * @param tokens1 - First array of tokens
 * @param tokens2 - Second array of tokens
 * @returns Cosine similarity score between 0 and 1, where 1 indicates identical token distributions
 */
export function compareTokens(tokens1: string[], tokens2: string[]) {
  const allTokensSet = new Set([...tokens1, ...tokens2]);
  const allTokens = Array.from(allTokensSet);
  const vec1 = allTokens.map((token) => tokens1.filter((t) => t === token).length / tokens1.length);
  const vec2 = allTokens.map((token) => tokens2.filter((t) => t === token).length / tokens2.length);

  const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));

  return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
}
