/* eslint-disable no-console */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import * as similarity from '../index';
import { TextSimilarity } from '../TextSimilarity';

async function main() {
  const __dirname = fileURLToPath(new URL('.', import.meta.url));

  // Create test texts
  const generateText = (length: number, lang: 'en' | 'es' | 'ru') => {
    const words = {
      en: ['the', 'quick', 'brown', 'fox'],
      es: ['el', 'rápido', 'zorro', 'marrón'],
      ru: ['быстрый', 'коричневый', 'лис'],
    }[lang];

    let result = '';
    while (result.length < length) {
      result += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    return result.trim();
  };

  // XXX: Use cached optimized text instances
  const textSimilarityCache = new Map<string, TextSimilarity>();
  function getCachedTextSimilarity(locale: string) {
    const langId = similarity.getLanguageId(locale);

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

  // Run benchmarks
  const start = performance.now();
  const results = [];

  for (const lang of ['en', 'es', 'ru'] as const) {
    const textSimilarity = getCachedTextSimilarity(lang);
    for (const size of [100, 500, 2000, 5000]) {
      const text1 = generateText(size, lang);
      const text2 = generateText(size, lang);

      // N-gram benchmark
      const ngrams1 = textSimilarity.getTextNGramsSync(text1);
      const ngrams2 = textSimilarity.getTextNGramsSync(text2);

      const ngramStart = performance.now();
      const ngramScore = similarity.compareNGrams(ngrams1, ngrams2);
      const ngramTime = performance.now() - ngramStart;

      // Cosine benchmark
      const tokens1 = textSimilarity.getTextTokensSync(text1);
      const tokens2 = textSimilarity.getTextTokensSync(text2);

      const cosineStart = performance.now();
      const cosineScore = similarity.compareTokens(tokens1, tokens2);
      const cosineTime = performance.now() - cosineStart;

      results.push({
        language: lang,
        size,
        ngramTime,
        cosineTime,
        ngramScore,
        cosineScore,
      });
    }
  }

  // Save results
  const outputPath = join(__dirname, 'run-benchmarks-results.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Benchmarks completed in ${Math.round(performance.now() - start)}ms`);
  console.log(`Results saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error('[TEXT_SIMILARITY:BENCHMARK] Error:', err);
  process.exit(1);
});
