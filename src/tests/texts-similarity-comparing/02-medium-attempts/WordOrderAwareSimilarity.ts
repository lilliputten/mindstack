import { TFIDFSimilarity } from './TFIDFSimilarity';

export class WordOrderAwareSimilarity {
  locale: string;
  constructor(locale = 'en') {
    this.locale = locale;
  }

  // Jaccard similarity with word order consideration
  jaccardWithOrder(text1: string, text2: string, n = 2): number {
    // Create n-grams (preserves some word order)
    const getNGrams = (text: string, n: number): string[] => {
      const words = text.toLowerCase().split(/\s+/);
      const ngrams: string[] = [];
      for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(' '));
      }
      return ngrams;
    };

    const ngrams1 = new Set(getNGrams(text1, n));
    const ngrams2 = new Set(getNGrams(text2, n));

    const intersection = new Set([...ngrams1].filter((x) => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Combined similarity (lexical + positional)
  combinedSimilarity(text1: string, text2: string): number {
    const tfidf = new TFIDFSimilarity(this.locale);
    const lexical = tfidf.cosineSimilarity(text1, text2);
    const bigram = this.jaccardWithOrder(text1, text2, 2);
    const trigram = this.jaccardWithOrder(text1, text2, 3);

    // Weighted average
    return lexical * 0.6 + bigram * 0.2 + trigram * 0.2;
  }
}
