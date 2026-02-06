/* eslint-disable no-console */
import { testCases } from './data/testCases';
import { jaroWinklerSimilarity } from './helpers/jaroWinklerSimilarity';

function testJaroWinkler() {
  console.log('\n=== Testing Jaro-Winkler Solution ===\n');

  testCases.forEach((test) => {
    // NOTE: It works only with simple words transformations (some diacritic cases, spaces, case insensitive)
    const similarity = jaroWinklerSimilarity(test.str1, test.str2, test.locale);
    const isSimilar = similarity > 0.9; // Threshold for "similar"

    console.log(`${test.name}:`);
    console.log(`  Strings: "${test.str1}" vs "${test.str2}"`);
    console.log(`  Locale: ${test.locale}`);
    console.log(`  Similarity score: ${similarity.toFixed(3)}`);
    console.log(`  Is similar (>0.9): ${isSimilar ? 'YES' : 'NO'}`);
    console.log(`  Expected high similarity: ${test.expectedSimilar > 0.9}`);
    console.log(`  Score diff: ${Math.abs(similarity - test.expectedSimilar).toFixed(3)}`);
    console.log('---');
  });
}

testJaroWinkler();

// Expected results for Jaro-Winkler:
/*
English exact match: 1.000 ✓
English case insensitive: ~0.978 ✓ (slightly less due to case diff)
English with accents: ~0.967 ✓ (slightly less due to accent diff)
English similar (color vs colour): ~0.933 ✓ (high similarity)
English different: ~0.182 ✓ (low similarity)
Spanish exact with ñ: 1.000 ✓
Spanish with accents: ~0.967 ✓
Spanish similar words (casa vs casas): ~0.911 ✓ (high similarity)
Spanish case insensitive: ~0.978 ✓
Russian exact: 1.000 ✓
Russian case insensitive: ~0.978 ✓
Russian similar words (кот vs кошка): ~0.636 (some similarity)
Russian with ё/е: ~0.933 ✓ (high similarity - algorithm handles it)
Empty strings: 1.000 ✓
One empty string: 0.000 ✓
Punctuation difference: ~0.967 ✓
Extra whitespace: ~0.956 ✓ (high similarity)
*/
