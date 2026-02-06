import natural from 'natural';

// @see https://naturalnode.github.io/natural/
// @see https://www.npmjs.com/package/natural

export class TFIDFSimilarity {
  locale: string;
  stemmer: natural.Stemmer;
  stopwords: Set<string>;
  constructor(locale = 'en') {
    // Initialize locale for language-specific text processing
    this.locale = locale;
    // Create stemmer for word normalization based on locale
    this.stemmer = this.getStemmer(locale);
    // Load stopwords for filtering common words
    this.stopwords = this.getStopwords(locale);
  }

  getStemmer(locale: string) {
    const lang = locale.split('-')[0];
    const stemmers: Record<string, natural.Stemmer> = {
      en: natural.PorterStemmer,
      ru: natural.PorterStemmerRu,
      es: natural.PorterStemmerEs,
      fr: natural.PorterStemmerFr,
      de: natural.PorterStemmerDe,
      it: natural.PorterStemmerIt,
      pt: natural.PorterStemmerPt,
      nl: natural.PorterStemmerNl,
      sv: natural.PorterStemmerSv,
      no: natural.PorterStemmerNo,
    };
    return stemmers[lang] || { stem: (word: string) => word };
  }

  getStopwords(locale: string) {
    // Basic stopwords for demo - use proper libraries in production
    const stopwordLists: Record<string, Set<string>> = {
      en: new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']),
      es: new Set(['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'en', 'de']),
      ru: new Set(['и', 'в', 'на', 'с', 'по', 'к', 'у', 'о', 'об', 'не']),
    };
    const id = locale.split('-')[0];
    return stopwordLists[id] || new Set();
  }

  tokenizeAndStem(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.stopwords.has(word))
      .map((word) => this.stemmer.stem(word));
  }

  cosineSimilarity(text1: string, text2: string) {
    const tokens1 = this.tokenizeAndStem(text1);
    const tokens2 = this.tokenizeAndStem(text2);

    const allTokens = Array.from(new Set([...tokens1, ...tokens2]));
    const vec1 = allTokens.map(
      (token) => tokens1.filter((t) => t === token).length / tokens1.length,
    );
    const vec2 = allTokens.map(
      (token) => tokens2.filter((t) => t === token).length / tokens2.length,
    );

    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));

    return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
  }
}
