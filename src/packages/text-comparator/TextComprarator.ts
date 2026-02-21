'use client';

import { getLanguageId, getNGramsSimple, getTextTokens } from './helpers';
import { defaultStemmerOptions, getCachedStemmer, TStemmerOptions } from './stemmers';
import { getCachedStopwords } from './stopwords';
import { TStemmer, TStopwords } from './types';

const defaultLanguage = 'en';
const defaultN = 2;

/** The minimal compare result which can mean that the similar texts have been compared */
export const similarTreshold = 0.25;

export interface TTextCompraratorOptions extends TStemmerOptions {
  lang?: string;
  n?: number;
}

export class TextComprarator {
  #lang: string = defaultLanguage;
  #n: number = defaultN;
  #stemmerOpts: TStemmerOptions = defaultStemmerOptions;
  #stemmerPromise?: Promise<TStemmer>;
  #stemmer?: TStemmer;
  #stopwordsPromise?: Promise<TStopwords>;
  #stopwords?: TStopwords;

  constructor(opts?: TTextCompraratorOptions) {
    this.updateOptions(opts);
  }

  updateOptions(opts?: TTextCompraratorOptions) {
    const { lang, n, ...stemmerOpts } = opts || {};
    this.#stemmerOpts = { ...this.#stemmerOpts, ...stemmerOpts };
    if (n != undefined) {
      this.#n = n;
    }
    if (lang) {
      this.#lang = getLanguageId(lang);
    }
  }

  public get isInited(): boolean {
    return !!(this.#stemmer && this.#stopwords);
  }

  /** Asynchronously get specific cached stemmer */
  awaitedInit(): Promise<unknown> {
    const promises: Promise<unknown>[] = [];
    if (!this.#stemmerPromise) {
      const stemmerPromise = getCachedStemmer(this.#lang, this.#stemmerOpts);
      promises.push(stemmerPromise);
      this.#stemmerPromise = stemmerPromise;
      this.#stemmerPromise.then((stemmer) => (this.#stemmer = stemmer));
    }
    if (!this.#stopwordsPromise) {
      const stopwordsPromise = getCachedStopwords(this.#lang);
      promises.push(stopwordsPromise);
      this.#stopwordsPromise = stopwordsPromise;
      this.#stopwordsPromise.then((stopwords) => (this.#stopwords = stopwords));
    }
    return Promise.all(promises);
  }

  getStemmerSync() {
    const stemmer = this.#stemmer;
    if (!stemmer) {
      throw new Error('Stemmer must be initialized in sync methods');
    }
    return stemmer;
  }

  getStopwordsSync() {
    const stopwords = this.#stopwords;
    if (!stopwords) {
      throw new Error('Stopwords must be initialized in sync methods');
    }
    return stopwords;
  }

  getSyncDeps(): [TStemmer, TStopwords] {
    const stemmer = this.getStemmerSync();
    const stopwords = this.getStopwordsSync();
    return [stemmer, stopwords];
  }

  getTextTokensSync(text: string) {
    const [stemmer] = this.getSyncDeps();

    const tokens = getTextTokens(text, this.#stopwords);

    return tokens.map((token) => stemmer.stem(token)).filter(Boolean);
  }

  getTextNGramsSync(text: string) {
    this.getSyncDeps();

    const tokens = this.getTextTokensSync(text);

    const ngrams = getNGramsSimple(tokens, this.#n);

    const profile = new Map<string, number>();
    ngrams.forEach((ngram) => {
      profile.set(ngram, (profile.get(ngram) || 0) + 1);
    });

    // Normalize frequencies
    const total = ngrams.length;
    profile.forEach((value, key) => {
      profile.set(key, value / total);
    });

    return profile;
  }

  async getTextProfile(text: string) {
    if (!this.isInited) await this.awaitedInit();
    return this.getTextNGramsSync(text);
  }
}
