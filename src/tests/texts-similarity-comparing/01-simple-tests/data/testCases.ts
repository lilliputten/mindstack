// Test data for different languages
export const testCases = [
  // English tests
  {
    name: 'English exact match',
    str1: 'Hello world',
    str2: 'Hello world',
    locale: 'en',
    expectedExact: true,
    expectedSimilar: 1.0,
  },
  {
    name: 'English case insensitive',
    str1: 'Hello World',
    str2: 'hello world',
    locale: 'en',
    expectedExact: false,
    expectedSimilar: 1.0, // Should match after normalization
  },
  {
    name: 'English with accents',
    str1: 'café',
    str2: 'cafe',
    locale: 'en',
    expectedExact: false,
    expectedSimilar: 1.0, // Should match after accent removal
  },
  {
    name: 'English similar',
    str1: 'color',
    str2: 'colour',
    locale: 'en-US',
    expectedExact: false,
    expectedSimilar: 0.8, // High similarity but not identical
  },
  {
    name: 'English different',
    str1: 'apple',
    str2: 'orange',
    locale: 'en',
    expectedExact: false,
    expectedSimilar: 0.0, // Very low similarity
  },

  // Spanish tests
  {
    name: 'Spanish exact with ñ',
    str1: 'año',
    str2: 'año',
    locale: 'es-ES',
    expectedExact: true,
    expectedSimilar: 1.0,
  },
  {
    name: 'Spanish with accents',
    str1: 'árbol',
    str2: 'arbol',
    locale: 'es-ES',
    expectedExact: false,
    expectedSimilar: 1.0, // Should match after accent removal
  },
  {
    name: 'Spanish similar words',
    str1: 'casa',
    str2: 'casas',
    locale: 'es-ES',
    expectedExact: false,
    expectedSimilar: 0.9, // Very similar (plural vs singular)
  },
  {
    name: 'Spanish case insensitive',
    str1: 'HOLA MUNDO',
    str2: 'hola mundo',
    locale: 'es-ES',
    expectedExact: false,
    expectedSimilar: 1.0,
  },

  // Russian tests
  {
    name: 'Russian exact',
    str1: 'привет мир',
    str2: 'привет мир',
    locale: 'ru-RU',
    expectedExact: true,
    expectedSimilar: 1.0,
  },
  {
    name: 'Russian case insensitive',
    str1: 'ПРИВЕТ МИР',
    str2: 'привет мир',
    locale: 'ru-RU',
    expectedExact: false,
    expectedSimilar: 1.0,
  },
  {
    name: 'Russian similar words',
    str1: 'кот',
    str2: 'кошка',
    locale: 'ru-RU',
    expectedExact: false,
    expectedSimilar: 0.4, // Some similarity (cat vs kitten)
  },
  {
    name: 'Russian with ё/е',
    str1: 'ёлка',
    str2: 'елка',
    locale: 'ru-RU',
    expectedExact: false,
    expectedSimilar: 1.0, // Should treat ё and е as same
  },

  // Edge cases
  {
    name: 'Empty strings',
    str1: '',
    str2: '',
    locale: 'en',
    expectedExact: true,
    expectedSimilar: 1.0,
  },
  {
    name: 'One empty string',
    str1: 'hello',
    str2: '',
    locale: 'en',
    expectedExact: false,
    expectedSimilar: 0.0,
  },
  {
    name: 'Punctuation difference',
    str1: 'Hello, world!',
    str2: 'Hello world',
    locale: 'en',
    expectedExact: false,
    expectedSimilar: 1.0, // Should match after punctuation removal
  },
  {
    name: 'Extra whitespace',
    str1: 'Hello  world',
    str2: 'Hello world',
    locale: 'en',
    expectedExact: false,
    expectedSimilar: 1.0, // Should normalize whitespace
  },
];
