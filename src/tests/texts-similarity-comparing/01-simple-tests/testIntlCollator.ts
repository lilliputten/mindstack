/* eslint-disable no-console */
import { testCases } from './data/testCases';

function testIntlCollator() {
  console.log('\n=== Testing Intl.Collator Solution ===\n');

  testCases.forEach((test) => {
    /** NOTE: Can prosuce only -1, 0, 1 values for ordering strings, not for comparing them */
    const collator = new Intl.Collator(test.locale, {
      sensitivity: 'base', // Ignores case and accents
      ignorePunctuation: true,
    } satisfies Intl.CollatorOptions);

    const isExact = collator.compare(test.str1, test.str2) === 0;
    // const similarity = isExact ? 1.0 : 0.0; // Its's only binary result

    console.log(`${test.name}:`);
    console.log(`  Strings: "${test.str1}" vs "${test.str2}"`);
    console.log(`  Locale: ${test.locale}`);
    console.log(`  Result: ${isExact ? 'EXACT MATCH' : 'NO MATCH'}`);
    console.log(`  Expected exact: ${test.expectedExact}`);
    console.log(`  Pass: ${isExact === test.expectedExact ? '✓' : '✗'}`);
    console.log('---');
  });
}

testIntlCollator();

// Expected results for Intl.Collator:
/*
English exact match: ✓ (exact match)
English case insensitive: ✓ (should match)
English with accents: ✓ (should match)
English similar: ✗ (color vs colour won't match)
English different: ✓ (no match)
Spanish exact with ñ: ✓ (exact)
Spanish with accents: ✓ (should match)
Spanish similar words: ✗ (casa vs casas won't match)
Spanish case insensitive: ✓ (should match)
Russian exact: ✓ (exact)
Russian case insensitive: ✓ (should match)
Russian similar words: ✗ (no match)
Russian with ё/е: ✗ (won't match - ё and е are different)
Empty strings: ✓ (match)
One empty string: ✓ (no match)
Punctuation difference: ✓ (should match)
Extra whitespace: ✗ (won't match - whitespace isn't ignored)
*/
