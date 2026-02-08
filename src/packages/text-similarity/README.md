# Text Similarity Package

This package provides two text similarity comparison algorithms: n-gram histogram intersection and cosine similarity.

The main component to prepare data is `TextSimilarity` (`TextSimilarity.ts`).

And two main comparators (in the `helpers.ts` module) are:

- `compareNGrams`: Compares two n-grams lists (previously generated with
  `getNGram*`) using n-gram histogram intersection algorithm to calculate
  similarity score between 0 and 1.
- `compareTokens`: Compares two token arrays (generated with `getTextTokens`)
  using cosine similarity.

## Algorithms

### compareNGrams (Histogram Intersection)

- Uses n-grams from pre-built profiles (`Map<string, number>`)
- Calculates similarity via histogram intersection: `Σ min(freq1, freq2) / Σ max(freq1, freq2)`
- Complexity: `O(n)` where n is the total unique n-grams
- Memory: Stores unique n-grams in a temporary Set

### compareTokens (Cosine Similarity)

- Directly compares token arrays
- Normalizes token frequencies into vectors
- Computes dot product and magnitudes
- Complexity: `O(n + m)` construction + `O(n)` operations where n=unique tokens

## Performance Predictions

| Text Size  | Language | compareNGrams Time | compareTokens Time | compareNGrams Mem | compareTokens Mem |
| ---------- | -------- | ------------------ | ------------------ | ----------------- | ----------------- |
| 100 chars  | English  | ~0.1ms             | ~0.2ms             | ~2KB              | ~5KB              |
| 500 chars  | English  | ~0.3ms             | ~0.5ms             | ~10KB             | ~15KB             |
| 2000 chars | English  | ~1ms               | ~2ms               | ~30KB             | ~50KB             |
| 5000 chars | English  | ~3ms               | ~8ms               | ~100KB            | ~200KB            |

### N-gram and Token Estimates

For English text, typical counts relative to word count:

- **N-grams (2-grams)**: ~95% of possible combinations exist in natural text
  - 100-word text: ~95-99 unique 2-grams
  - 1000-word text: ~900-950 unique 2-grams
  - Storage: ~4 bytes per unique n-gram
- **Tokens**: After preprocessing (stopword removal, filtering)
  - 100-word text: ~80-90 tokens
  - 1000-word text: ~700-800 tokens
  - Storage: ~8 bytes per unique token

Russian and Spanish would show similar patterns but with slightly higher memory usage due to longer average word lengths.

## Key Limitations

**compareNGrams:**

- Performance degrades with large n-gram sizes (e.g., 4-grams)
- Higher memory overhead when storing many unique n-grams
- Less sensitive to word order than cosine similarity

**compareTokens:**

- Quadratic memory growth with unique token counts
- Token frequency calculations expensive for long texts
- Overhead from frequent array operations (filter, reduce)

## Recommendations

1. For short texts (<1000 chars): Either method works well
2. For medium texts (1000-5000 chars): Prefer `compareNGrams` for better performance
3. For language-agnostic comparison: `compareNGrams` tends to be more consistent
4. For order-sensitive comparison: `compareTokens` is better despite higher cost

## Tests and Benchmarks

### Running Tests

```bash
pnpm test src/packages/text-similarity/__tests__/text-similarity-comparators.test.ts
```

### Running Benchmarks

```bash
pnpm exec tsx src/packages/text-similarity/test-scripts/run-benchmarks.ts
```

### Test Structure

The test suite includes:

- Accuracy tests for verifying similarity scores
- Performance benchmarks for different text sizes and languages
- Edge case tests for empty texts and completely different texts
- Comprehensive coverage of both comparison algorithms

### Benchmark Results

Benchmark and test results are automatically saved to:

- `src/packages/text-similarity/test-scripts/run-benchmarks-results.json`
- `src/packages/text-similarity/__tests__/text-similarity-comparators.test-results.json`
