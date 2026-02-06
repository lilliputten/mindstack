/* eslint-disable no-console */
import { enhancedTestCases } from './data/enhancedTestCases';
import { OptimizedTextSimilarity } from './OptimizedTextSimilarity';
import { TFIDFSimilarity } from './TFIDFSimilarity';
import { WordOrderAwareSimilarity } from './WordOrderAwareSimilarity';

async function runEnhancedTests() {
  console.log('🧪 Enhanced Text Similarity Tests\n\n---');

  const results = [];

  /* // XXX: Use cached optimized text instances
   * const optimizedTextSimilarityCache = new Map<string, OptimizedTextSimilarity>();
   * function _getCachedOptimizedTextSimilarity(locale: string) {
   *   if (optimizedTextSimilarityCache.has(locale)) {
   *     return optimizedTextSimilarityCache.get(locale) as OptimizedTextSimilarity;
   *   }
   *   const optimizedTextSimilarity = new OptimizedTextSimilarity(locale);
   *   optimizedTextSimilarityCache.set(locale, optimizedTextSimilarity);
   *   return optimizedTextSimilarity;
   * }
   */

  for (let no = 0; no < enhancedTestCases.length; no++) {
    const test = enhancedTestCases[no];
    // Test only new cases
    console.log(`\n🔍 ${no + 1}. ${test.name}`);
    console.log(`Locale: ${test.locale}`);
    console.log(`Text 1: ${test.str1.substring(0, 60)}...`);
    console.log(`Text 2: ${test.str2.substring(0, 60)}...`);

    const testResults: {
      test: string;
      locale: string;
      naturalStemming?: number;
      naturalStemmingTime?: number;
      wordOrder?: number;
      wordOrderTime?: number;
      optimizedSimilarity?: number;
      optimizedSimilarityTime?: number;
    } = {
      test: test.name,
      locale: test.locale,
    };

    /* // UNUSED: Simpler methods
     * // 1. Intl.Collator
     * const collator = new Intl.Collator(test.locale, { sensitivity: 'base' });
     * testResults.intlCollator = collator.compare(test.str1, test.str2) === 0;
     * // 2. Jaro-Winkler (custom)
     * testResults.jaroWinkler = jaroWinklerSimilarity(test.str1, test.str2, test.locale);
     * // 4. Cosine TF-IDF (our implementation)
     * const simpleCosine = new LocaleAwareSimilarity(test.locale);
     * testResults.cosineTFIDF = simpleCosine.cosineSimilarity(test.str1, test.str2);
     * console.log(`  Intl.Collator (exact): ${testResults.intlCollator ? 'MATCH' : 'NO MATCH'}`);
     * console.log(`  Jaro-Winkler: ${testResults.jaroWinkler.toFixed(2)} (expected: ${test.expected?.jaroWinkler?.toFixed(2) || 'N/A'})`);
     * console.log(`  Cosine TF-IDF: ${testResults.cosineTFIDF.toFixed(2)} (expected: ${test.expected?.cosineTFIDF?.toFixed(2) || 'N/A'})`);
     */

    // 3. Natural with Stemming
    const startTimeNatural = performance.now();
    const tfidf = new TFIDFSimilarity(test.locale);
    testResults.naturalStemming = tfidf.cosineSimilarity(test.str1, test.str2);
    const endTimeNatural = performance.now();
    testResults.naturalStemmingTime = endTimeNatural - startTimeNatural;

    // 5. Word Order Aware
    const startTimeWordOrder = performance.now();
    const wordOrder = new WordOrderAwareSimilarity(test.locale);
    testResults.wordOrder = wordOrder.combinedSimilarity(test.str1, test.str2);
    const endTimeWordOrder = performance.now();
    testResults.wordOrderTime = endTimeWordOrder - startTimeWordOrder;

    // 6. OptimizedTextSimilarity
    // const optimizedTextSimilarity = getCachedOptimizedTextSimilarity(test.locale);
    const startTimeOptimized = performance.now();
    const optimizedTextSimilarity = new OptimizedTextSimilarity(test.locale);
    testResults.optimizedSimilarity = optimizedTextSimilarity.nGramSimilarity(test.str1, test.str2);
    const endTimeOptimized = performance.now();
    testResults.optimizedSimilarityTime = endTimeOptimized - startTimeOptimized;

    // Display results
    console.log('Results:');

    const pad = (str: string, length: number) => str.padEnd(length, ' ');

    console.log(
      `  3. ${pad('Natural Stemming:', 22)} ${pad(testResults.naturalStemming.toFixed(2), 6)} expected: ${pad(test.expected?.naturalStemming?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.naturalStemmingTime.toFixed(2) + 'ms', 8)}`,
    );
    console.log(
      `  5. ${pad('Word Order Aware:', 22)} ${pad(testResults.wordOrder.toFixed(2), 6)} expected: ${pad(test.expected?.wordOrder?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.wordOrderTime.toFixed(2) + 'ms', 8)}`,
    );
    console.log(
      `  6. ${pad('Optimized Similarity:', 22)} ${pad(testResults.optimizedSimilarity.toFixed(2), 6)} expected: ${pad(test.expected?.optimizedSimilarity?.toFixed(2) || 'N/A', 6)} elapsed: ${pad(testResults.optimizedSimilarityTime.toFixed(2) + 'ms', 8)}`,
    );
    console.log('\n---');

    results.push(testResults);
  }

  return results;
}

runEnhancedTests();

// Expected Performance Summary:
/*
Method                | Word Forms | Word Order | Text Length | Speed      | Accuracy
----------------------|------------|------------|-------------|------------|----------
Intl.Collator         | ✗          | ✗          | Any         | ⚡ Fast    | Low
Jaro-Winkler          | ✗          | ✗          | Medium      | Fast       | Medium
Cosine TF-IDF         | ✓          | ✗          | Any         | Medium     | High
----------------------|------------|------------|-------------|------------|----------
Natural Stemming      | ✓✓         | △          | Any         | Medium     | High
Word Order Aware      | ✓          | ✓✓         | Medium      | Slow       | Highest
Optimized Similarity  | ?          | ?          | ?           | ?          | ?
----------------------|------------|------------|-------------|------------|----------
*/
