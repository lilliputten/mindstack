/* eslint-disable no-console */
import { enhancedTestCases } from './data/enhancedTestCases';
import { OptimizedTextSimilarity } from './OptimizedTextSimilarity';
import { TFIDFSimilarity } from './TFIDFSimilarity';
import { WordOrderAwareSimilarity } from './WordOrderAwareSimilarity';

async function runEnhancedTests() {
  console.log('🧪 Enhanced Text Similarity Tests\n');

  const results = [];

  const optimizedTextSimilarityCache = new Map<string, OptimizedTextSimilarity>();

  function _getCachedOptimizedTextSimilarity(locale: string) {
    if (optimizedTextSimilarityCache.has(locale)) {
      return optimizedTextSimilarityCache.get(locale) as OptimizedTextSimilarity;
    }
    const optimizedTextSimilarity = new OptimizedTextSimilarity(locale);
    optimizedTextSimilarityCache.set(locale, optimizedTextSimilarity);
    return optimizedTextSimilarity;
  }

  for (const test of enhancedTestCases) {
    // Test only new cases
    console.log(`\n🔍 ${test.name}`);
    console.log(`Locale: ${test.locale}`);
    console.log(`Text 1: ${test.str1.substring(0, 60)}...`);
    console.log(`Text 2: ${test.str2.substring(0, 60)}...`);
    console.log('---');

    const testResults: {
      test: string;
      locale: string;
      naturalStemming?: number;
      wordOrder?: number;
      optimizedSimilarity?: number;
    } = {
      test: test.name,
      locale: test.locale,
    };

    // // 1. Intl.Collator
    // const collator = new Intl.Collator(test.locale, { sensitivity: 'base' });
    // testResults.intlCollator = collator.compare(test.str1, test.str2) === 0;
    //
    // // 2. Jaro-Winkler (custom)
    // testResults.jaroWinkler = jaroWinklerSimilarity(test.str1, test.str2, test.locale);

    // 3. Natural with Stemming
    const tfidf = new TFIDFSimilarity(test.locale);
    testResults.naturalStemming = tfidf.cosineSimilarity(test.str1, test.str2);

    // // 4. Cosine TF-IDF (our implementation)
    // const simpleCosine = new LocaleAwareSimilarity(test.locale);
    // testResults.cosineTFIDF = simpleCosine.cosineSimilarity(test.str1, test.str2);

    // 5. Word Order Aware
    const wordOrder = new WordOrderAwareSimilarity(test.locale);
    testResults.wordOrder = wordOrder.combinedSimilarity(test.str1, test.str2);

    // 6. OptimizedTextSimilarity
    // const optimizedTextSimilarity = getCachedOptimizedTextSimilarity(test.locale);
    const optimizedTextSimilarity = new OptimizedTextSimilarity(test.locale);
    testResults.optimizedSimilarity = optimizedTextSimilarity.nGramSimilarity(test.str1, test.str2);

    // Display results
    console.log('Results:');

    /* // UNUSED: Simpler methods
     * console.log(`  Intl.Collator (exact): ${testResults.intlCollator ? 'MATCH' : 'NO MATCH'}`);
     * console.log(`  Jaro-Winkler: ${testResults.jaroWinkler.toFixed(2)} (expected: ${test.expected?.jaroWinkler?.toFixed(2) || 'N/A'})`);
     * console.log(`  Cosine TF-IDF: ${testResults.cosineTFIDF.toFixed(2)} (expected: ${test.expected?.cosineTFIDF?.toFixed(2) || 'N/A'})`);
     */

    console.log(
      `  Natural Stemming: ${testResults.naturalStemming.toFixed(2)} (expected: ${test.expected?.naturalStemming?.toFixed(2) || 'N/A'})`,
    );
    console.log(
      `  Word Order Aware: ${testResults.wordOrder.toFixed(2)} (expected: ${test.expected?.wordOrder?.toFixed(2) || 'N/A'})`,
    );
    console.log(
      `  Optimized Similarity: ${testResults.optimizedSimilarity.toFixed(2)} (expected: ${'N/A'})`,
    );

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
