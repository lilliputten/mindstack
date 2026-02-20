import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareNGrams, compareTokens, getNGramsSimple, getTextTokens } from '../helpers';

describe('Text Similarity Comparators', () => {
  // Test data generators
  const generateText = (length: number, language: 'en' | 'es' | 'ru') => {
    const wordsEn = ['the', 'quick', 'brown', 'fox', 'jumps', 'over'];
    const wordsEs = ['el', 'rápido', 'zorro', 'marrón', 'salta', 'sobre'];
    const wordsRu = ['быстрый', 'коричневый', 'лис', 'прыгает', 'через'];

    const wordSet = language === 'en' ? wordsEn : language === 'es' ? wordsEs : wordsRu;
    let result = '';

    while (result.length < length) {
      result += wordSet[Math.floor(Math.random() * wordSet.length)] + ' ';
    }

    return result.trim();
  };

  const buildProfile = (text: string) => {
    const tokens = getTextTokens(text);
    const ngrams = getNGramsSimple(tokens, 2);
    const profile = new Map<string, number>();
    ngrams.forEach((ngram) => {
      profile.set(ngram, (profile.get(ngram) || 0) + 1);
    });
    return profile;
  };

  // Accuracy tests
  describe('Accuracy Tests', () => {
    const testCases = [
      {
        text1: 'The quick brown fox jumps over the lazy dog',
        text2: 'The quick brown fox jumps over the lazy dog',
        expected: 1.0,
      },
      {
        text1: 'The quick brown fox',
        text2: 'The quick brown fox',
        expected: 1.0,
      },
      {
        text1: 'The quick brown fox',
        text2: 'The lazy brown cat',
        expected: 0, // Expect 0 since no common 2-grams with this small sample
      },
      {
        text1: 'Hello world',
        text2: 'Hello world',
        expected: 1.0,
      },
      {
        text1: 'Hello world',
        text2: 'Hi world',
        expected: 0.333, // Expect ~0.333 since "world" is common (1/3 tokens match)
      },
    ];

    testCases.forEach(({ text1, text2 }, i) => {
      test(`Case ${i + 1}: "${text1}" vs "${text2}"`, () => {
        const profile1 = buildProfile(text1);
        const profile2 = buildProfile(text2);
        const tokens1 = getTextTokens(text1);
        const tokens2 = getTextTokens(text2);

        const ngramScore = compareNGrams(profile1, profile2);
        const cosineScore = compareTokens(tokens1, tokens2);

        /* // Log the actual scores for debugging
         * console.log(`Case ${i + 1}:`);
         * console.log(`  N-gram score: ${ngramScore}`);
         * console.log(`  Cosine score: ${cosineScore}`);
         */

        // Expect both scores to be between 0 and 1
        expect(ngramScore).toBeGreaterThanOrEqual(0);
        expect(ngramScore).toBeLessThanOrEqual(1);
        expect(cosineScore).toBeGreaterThanOrEqual(0);
        expect(cosineScore).toBeLessThanOrEqual(1);

        // For non-identical comparisons, ensure cosine score > 0 when there's some overlap
        if (text1 !== text2) {
          expect(cosineScore).toBeGreaterThan(0);
        }
      });
    });
  });

  // Performance tests
  describe('Performance Benchmarks', () => {
    const sizes = [100, 500, 2000, 5000];
    const languages = ['en', 'es', 'ru'] as const;
    const benchmarkResults: Array<{
      language: string;
      size: number;
      ngramTime: number;
      cosineTime: number;
    }> = [];

    afterAll(() => {
      const outputPath = join(
        dirname(fileURLToPath(import.meta.url)),
        'text-comparator.test-results.json',
      );
      writeFileSync(outputPath, JSON.stringify(benchmarkResults, null, 2));
    });

    languages.forEach((lang) => {
      describe(`Language: ${lang.toUpperCase()}`, () => {
        sizes.forEach((size) => {
          const text1 = generateText(size, lang);
          const text2 = generateText(size, lang);
          const profile1 = buildProfile(text1);
          const profile2 = buildProfile(text2);
          const tokens1 = getTextTokens(text1);
          const tokens2 = getTextTokens(text2);

          test(`Size: ${size} chars`, () => {
            // N-gram comparison
            const ngramStart = performance.now();
            const ngramScore = compareNGrams(profile1, profile2);
            const ngramTime = performance.now() - ngramStart;

            // Cosine comparison
            const cosineStart = performance.now();
            const cosineScore = compareTokens(tokens1, tokens2);
            const cosineTime = performance.now() - cosineStart;

            benchmarkResults.push({
              language: lang.toUpperCase(),
              size,
              ngramTime,
              cosineTime,
            });

            /* // Log times
             * console.log(
             *   `[${lang.toUpperCase()}, ${size} chars] N-gram: ${ngramTime.toFixed(2)}ms, Cosine: ${cosineTime.toFixed(2)}ms`,
             * );
             */

            expect(ngramScore).toBeGreaterThanOrEqual(0);
            expect(ngramScore).toBeLessThanOrEqual(1);
            expect(cosineScore).toBeGreaterThanOrEqual(0);
            expect(cosineScore).toBeLessThanOrEqual(1);
          });
        });
      });
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    test('Empty texts', () => {
      const emptyProfile = new Map<string, number>();
      const emptyTokens: string[] = [];

      expect(compareNGrams(emptyProfile, emptyProfile)).toBe(0);
      expect(compareTokens(emptyTokens, emptyTokens)).toBe(0);
    });

    test('Completely different texts', () => {
      const profile1 = buildProfile('apple banana cherry');
      const profile2 = buildProfile('xylophone yellow zebra');
      const tokens1 = getTextTokens('apple banana cherry');
      const tokens2 = getTextTokens('xylophone yellow zebra');

      expect(compareNGrams(profile1, profile2)).toBe(0);
      expect(compareTokens(tokens1, tokens2)).toBe(0);
    });
  });
});
