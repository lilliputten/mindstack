/* eslint-disable no-console */

import { compareNGrams, compareTokens, getLanguageId } from '../helpers';
import { TextSimilarity } from '../TextSimilarity';
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
  const textSimilarityCache = new Map<string, TextSimilarity>();
  function getCachedTextSimilarity(locale: string) {
    const langId = getLanguageId(locale);

    if (textSimilarityCache.has(langId)) {
      return textSimilarityCache.get(langId) as TextSimilarity;
    }
    const textSimilarity = new TextSimilarity({ lang: langId });
    textSimilarityCache.set(langId, textSimilarity);
    return textSimilarity;
  }

  console.time('Initialization');
  const promises = ['en', 'es', 'ru'].map((lang) => getCachedTextSimilarity(lang).awaitedInit());
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
      textSimilarityNgrams?: number;
      textSimilarityNgramsTime?: number;
      // 8.
      textSimilarityTokens?: number;
      textSimilarityTokensTime?: number;
    } = {
      test: test.name,
      locale: test.locale,
    };

    const textSimilarity = getCachedTextSimilarity(test.locale); // new TextSimilarity({ lang: test.locale });
    // const stemmer = textSimilarity.getStemmerSync();

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
     * // 6. OptimizedTextSimilarity
     * // const optimizedTextSimilarity = getCachedOptimizedTextSimilarity(test.locale);
     * const startTimeOptimized = performance.now();
     * const optimizedTextSimilarity = new OptimizedTextSimilarity(test.locale);
     * testResults.optimizedSimilarity = optimizedTextSimilarity.nGramSimilarity(test.str1, test.str2);
     * const endTimeOptimized = performance.now();
     * testResults.optimizedSimilarityTime = endTimeOptimized - startTimeOptimized;
     */

    // 7. Text similarity (Ngrams)
    const startTimeTextSimilarityNgrams = performance.now();
    const ngrams1 = textSimilarity.getTextNGramsSync(test.str1);
    const ngrams2 = textSimilarity.getTextNGramsSync(test.str2);
    testResults.textSimilarityNgrams = compareNGrams(ngrams1, ngrams2);
    // const ngrams1 = textSimilarity.getTextNgramsSync(test.str1);
    // const ngrams2 = textSimilarity.getTextNgramsSync(test.str2);
    // testResults.textSimilarityNgrams = compareNgramsWithCosine(ngrams1, ngrams2);
    const endTimeTextSimilarityNgrams = performance.now();
    testResults.textSimilarityNgramsTime =
      endTimeTextSimilarityNgrams - startTimeTextSimilarityNgrams;

    // 8. Text similarity (Tokens)
    const startTimeTextSimilarityTokens = performance.now();
    // const ngrams1 = textSimilarity.getTextNGramsSync(test.str1);
    // const ngrams2 = textSimilarity.getTextNGramsSync(test.str2);
    // testResults.textSimilarity = compareNGrams(ngrams1, ngrams2);
    const tokens1 = textSimilarity.getTextTokensSync(test.str1);
    const tokens2 = textSimilarity.getTextTokensSync(test.str2);
    testResults.textSimilarityTokens = compareTokens(tokens1, tokens2);
    const endTimeTextSimilarityTokens = performance.now();
    testResults.textSimilarityTokensTime =
      endTimeTextSimilarityTokens - startTimeTextSimilarityTokens;

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
      `  7. ${pad('Text Similarity (Ngrams):', column1width)} ${pad(testResults.textSimilarityNgrams.toFixed(2), 6)} expected: ${pad(test.expected?.textSimilarity?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.textSimilarityNgramsTime.toFixed(2) + 'ms', 8)}`,
    );
    console.log(
      `  8. ${pad('Text Similarity (Tokens):', column1width)} ${pad(testResults.textSimilarityTokens.toFixed(2), 6)} expected: ${pad(test.expected?.textSimilarity?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.textSimilarityTokensTime.toFixed(2) + 'ms', 8)}`,
    );

    console.log('\n---');

    results.push(testResults);
  }

  return results;
}

enhancedTests();
