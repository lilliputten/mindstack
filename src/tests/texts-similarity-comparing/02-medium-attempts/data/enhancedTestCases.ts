// import { testCases } from '../01-simple-tests/data/testCases';

export const enhancedTestCases = [
  // Previous test cases (keep for reference)
  // ...testCases,

  // NEW: Complex test cases for word forms and sentence structure

  // 1. English - Pluralization and different forms
  {
    name: 'English pluralization',
    str1: 'The quick brown fox jumps over the lazy dog',
    str2: 'Quick brown foxes jump over lazy dogs',
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.85, // High but not perfect
      naturalStemming: 0.95, // Should be very high after stemming
      cosineTFIDF: 0.9, // High similarity
      wordOrder: 0.7, // Different word order affects
    },
  },

  // 2. English - Different verb forms
  {
    name: 'English verb forms',
    str1: 'I am running to the store quickly',
    str2: 'He runs to stores quickly',
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.6,
      naturalStemming: 0.85, // "running" and "runs" both stem to "run"
      cosineTFIDF: 0.8,
      wordOrder: 0.65,
    },
  },

  // 3. English - Synonyms and paraphrasing
  {
    name: 'English synonyms paraphrase',
    str1: 'The automobile manufacturer reported record profits',
    str2: 'Car maker announces highest ever earnings',
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.35, // Low character similarity
      naturalStemming: 0.5, // Better but needs synonym detection
      cosineTFIDF: 0.45, // Different words
      wordOrder: 0.3,
    },
  },

  // 4. English - Different word order
  {
    name: 'English word order changed',
    str1: 'The cat chased the mouse in the garden',
    str2: 'In the garden, the mouse was chased by the cat',
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.65,
      naturalStemming: 0.9, // Same words, different order
      cosineTFIDF: 0.85, // Same word set
      wordOrder: 0.6, // Lower due to order change
    },
  },

  // 5. Russian - Cases and verb aspects
  {
    name: 'Russian cases and aspects',
    str1: 'Я читаю интересную книгу',
    str2: 'Он прочитал интересной книги',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.55,
      naturalStemming: 0.8, // "читаю" and "прочитал" share root
      cosineTFIDF: 0.75,
      wordOrder: 0.7,
    },
  },

  // 6. Russian - Different word forms
  {
    name: 'Russian different forms',
    str1: 'понять проблему',
    str2: 'понимать проблемы',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.7,
      naturalStemming: 0.9, // "понять" and "понимать" share root
      cosineTFIDF: 0.85, // "проблему" and "проблемы" are forms
      wordOrder: 0.8,
    },
  },

  // 7. Spanish - Gender and number agreement
  {
    name: 'Spanish gender and number',
    str1: 'El gato negro duerme en la silla',
    str2: 'Las gatas negras duermen en los sillones',
    locale: 'es-ES',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.65,
      naturalStemming: 0.85, // Should stem to similar roots
      cosineTFIDF: 0.8,
      wordOrder: 0.75,
    },
  },

  // 8. Mixed language short text (~200 chars)
  {
    name: 'Mixed short text',
    str1: 'The AI conference in Berlin attracted over 500 participants from 30 countries. Machine learning workshops were particularly popular.',
    str2: 'Berlin AI conference: 500+ attendees from 30 nations. Popular sessions included ML workshops.',
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.55,
      naturalStemming: 0.75,
      cosineTFIDF: 0.8,
      wordOrder: 0.65,
    },
  },

  // 9. Longer text with same meaning (~500 chars)
  {
    name: 'Rephrased paragraph',
    str1: 'Climate change represents one of the most significant challenges facing humanity today. Rising global temperatures, caused primarily by greenhouse gas emissions from human activities, are leading to more frequent and severe weather events, sea level rise, and disruptions to ecosystems worldwide.',
    str2: "Humanity currently faces major challenges from climate change. The increase in Earth's temperature, mainly due to human-produced greenhouse gases, results in worse weather patterns, higher sea levels, and ecological disturbances across the globe.",
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.4,
      naturalStemming: 0.65,
      cosineTFIDF: 0.7,
      wordOrder: 0.55,
    },
  },

  // 10. Completely different but same topic
  {
    name: 'Same topic different words',
    str1: 'Apple unveiled its latest iPhone with improved camera and battery life',
    str2: 'The new smartphone from Apple features better photography capabilities and longer usage time',
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.25,
      naturalStemming: 0.4,
      cosineTFIDF: 0.55, // Should recognize some shared concepts
      wordOrder: 0.3,
    },
  },
];
