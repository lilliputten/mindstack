/* eslint-disable no-console */

import { compareNGrams, compareTokens, getLanguageId } from '../helpers';
import { TextComprarator } from '../TextComprarator';
import { enhancedTestCases } from './enhancedTestCases';

const defaultEllipsis = '…';
export function truncateString(str?: string, len?: number, ellipsis: string = defaultEllipsis) {
  if (!str || !len) {
    return '';
  }
  str = str.trim();
  if (str.length > len) {
    return str.substring(0, len - ellipsis.length) + ellipsis;
  }
  return str;
}

const maxStrLen = 120;

async function enhancedTests() {
  console.log('🧪 Enhanced Text Similarity Tests\n');

  const results = [];

  // XXX: Use cached optimized text instances
  const textCmpCache = new Map<string, TextComprarator>();
  function getCachedTextComprarator(locale: string) {
    const langId = getLanguageId(locale);

    if (textCmpCache.has(langId)) {
      return textCmpCache.get(langId) as TextComprarator;
    }
    const textCmp = new TextComprarator({ lang: langId });
    textCmpCache.set(langId, textCmp);
    return textCmp;
  }

  console.time('Initialization');
  const promises = ['en', 'es', 'ru'].map((lang) => getCachedTextComprarator(lang).awaitedInit());
  await Promise.all(promises);
  console.timeEnd('Initialization');

  console.log('\n---');

  for (let i = 0; i < enhancedTestCases.length; i++) {
    const test = enhancedTestCases[i];
    const no = i + 1;

    /* // Run only Russian tests
     * if (!test.locale.startsWith('ru')) continue;
     */

    // Test only new cases
    console.log(`\n🔍 ${no}. ${test.name}`);
    console.log(`Locale: ${test.locale}`);
    console.log(`Text 1: ${truncateString(test.str1, maxStrLen)}`);
    console.log(`Text 2: ${truncateString(test.str2, maxStrLen)}`);

    const testResults: {
      test: string;
      locale: string;
      /* // UNUSED: R&D test cases
       * // 3.
       * naturalStemming?: number;
       * naturalStemmingTime?: number;
       * // 5.
       * wordOrder?: number;
       * wordOrderTime?: number;
       * // 6.
       * optimizedSimilarity?: number;
       * optimizedSimilarityTime?: number;
       */
      // 7.
      textCmpNgrams?: number;
      textCmpNgramsTime?: number;
      // 8.
      textCmpTokens?: number;
      textCmpTokensTime?: number;
    } = {
      test: test.name,
      locale: test.locale,
    };

    const textCmp = getCachedTextComprarator(test.locale); // new TextComprarator({ lang: test.locale });
    // const stemmer = textCmp.getStemmerSync();

    /* // UNUSED: R&D test cases
     * // 3. Natural with Stemming
     * const startTimeNatural = performance.now();
     * const tfidf = new TFIDFSimilarity(test.locale, stemmer);
     * testResults.naturalStemming = tfidf.cosineSimilarity(test.str1, test.str2);
     * const endTimeNatural = performance.now();
     * testResults.naturalStemmingTime = endTimeNatural - startTimeNatural;
     * // 5. Word Order Aware
     * const startTimeWordOrder = performance.now();
     * const wordOrder = new WordOrderAwareSimilarity(test.locale);
     * testResults.wordOrder = wordOrder.combinedSimilarity(test.str1, test.str2);
     * const endTimeWordOrder = performance.now();
     * testResults.wordOrderTime = endTimeWordOrder - startTimeWordOrder;
     * // 6. OptimizedTextComprarator
     * // const optimizedTextComprarator = getCachedOptimizedTextComprarator(test.locale);
     * const startTimeOptimized = performance.now();
     * const optimizedTextComprarator = new OptimizedTextComprarator(test.locale);
     * testResults.optimizedSimilarity = optimizedTextComprarator.nGramSimilarity(test.str1, test.str2);
     * const endTimeOptimized = performance.now();
     * testResults.optimizedSimilarityTime = endTimeOptimized - startTimeOptimized;
     */

    // 7. Text similarity (Ngrams)
    const startTimeTextCompraratorNgrams = performance.now();
    const ngrams1 = textCmp.getTextNGramsSync(test.str1);
    const ngrams2 = textCmp.getTextNGramsSync(test.str2);
    testResults.textCmpNgrams = compareNGrams(ngrams1, ngrams2);
    // const ngrams1 = textCmp.getTextNgramsSync(test.str1);
    // const ngrams2 = textCmp.getTextNgramsSync(test.str2);
    // testResults.textCmpNgrams = compareNgramsWithCosine(ngrams1, ngrams2);
    const endTimeTextCompraratorNgrams = performance.now();
    testResults.textCmpNgramsTime = endTimeTextCompraratorNgrams - startTimeTextCompraratorNgrams;

    // 8. Text similarity (Tokens)
    const startTimeTextCompraratorTokens = performance.now();
    // const ngrams1 = textCmp.getTextNGramsSync(test.str1);
    // const ngrams2 = textCmp.getTextNGramsSync(test.str2);
    // testResults.textCmp = compareNGrams(ngrams1, ngrams2);
    const tokens1 = textCmp.getTextTokensSync(test.str1);
    const tokens2 = textCmp.getTextTokensSync(test.str2);
    testResults.textCmpTokens = compareTokens(tokens1, tokens2);
    const endTimeTextCompraratorTokens = performance.now();
    testResults.textCmpTokensTime = endTimeTextCompraratorTokens - startTimeTextCompraratorTokens;

    // Display results
    console.log('Results:');

    const pad = (str: string, length: number) => str.padEnd(length, ' ');

    const column1width = 30;

    /* // UNUSED: R&D test cases
     * console.log(
     *   `  3. ${pad('Natural Stemming:', column1width)} ${pad(testResults.naturalStemming.toFixed(2), 6)} expected: ${pad(test.expected?.naturalStemming?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.naturalStemmingTime.toFixed(2) + 'ms', 8)}`,
     * );
     * console.log(
     *   `  5. ${pad('Word Order Aware:', column1width)} ${pad(testResults.wordOrder.toFixed(2), 6)} expected: ${pad(test.expected?.wordOrder?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.wordOrderTime.toFixed(2) + 'ms', 8)}`,
     * );
     * console.log(
     *   `  6. ${pad('Optimized Similarity:', column1width)} ${pad(testResults.optimizedSimilarity.toFixed(2), 6)} expected: ${pad(test.expected?.optimizedSimilarity?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.optimizedSimilarityTime.toFixed(2) + 'ms', 8)}`,
     * );
     */
    console.log(
      `  7. ${pad('Text Similarity (Ngrams):', column1width)} ${pad(testResults.textCmpNgrams.toFixed(2), 6)} expected: ${pad(test.expected?.textCmp?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.textCmpNgramsTime.toFixed(2) + 'ms', 8)}`,
    );
    console.log(
      `  8. ${pad('Text Similarity (Tokens):', column1width)} ${pad(testResults.textCmpTokens.toFixed(2), 6)} expected: ${pad(test.expected?.textCmp?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.textCmpTokensTime.toFixed(2) + 'ms', 8)}`,
    );

    console.log('\n---');

    results.push(testResults);
  }

  return results;
}

enhancedTests();
