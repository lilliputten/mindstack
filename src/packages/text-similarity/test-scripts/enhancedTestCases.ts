// import { testCases } from '../01-simple-tests/data/testCases';

export const enhancedTestCases = [
  // Previous test cases (keep for reference)
  // ...testCases,

  // NEW: Complex test cases for word forms and sentence structure

  {
    name: 'ABSOLUTELY NON-SIMILAR: Different scripts, domains, lengths',
    str1: 'Quantum entanglement in multidimensional string theory exhibits non-local correlation phenomena',
    str2: '饺子蘸醋配大蒜味道特别好，酸辣土豆丝要炒得脆才好吃',
    locale: 'en',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.01, // Near zero - only punctuation/common chars might match
      naturalStemming: 0.0, // Zero - completely different languages
      cosineTFIDF: 0.0, // Zero - no shared tokens
      wordOrder: 0.0, // Zero - different character sets
      textSimilarity: 0.0, // Zero - completely different languages and scripts
    },
  },

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
      optimizedSimilarity: 0.25,
      textSimilarity: 0.92, // High similarity despite word form differences
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
      optimizedSimilarity: 0.45,
      textSimilarity: 0.68, // Moderate similarity despite verb form differences
    },
  },

  // 3. English - Synonyms and paraphrasing
  {
    name: 'English synonyms paraphrase (not possible to detect with stemmer-based logic)',
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
      optimizedSimilarity: 0.35,
      textSimilarity: 0.42, // Lower due to synonym/paraphrase challenge
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
      optimizedSimilarity: 0.65,
      textSimilarity: 0.9, // High similarity - same words different order
    },
  },

  // 5. Russian - Cases and verb aspects
  {
    name: 'Russian cases and aspects',
    str1: 'Я читаю интересную книгу',
    // str2: 'Он прочитал семьдесят пять интересной книги два раза по четрые',
    str2: 'Он прочитал интересной книги',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.55,
      naturalStemming: 0.8, // "читаю" and "прочитал" share root
      cosineTFIDF: 0.75,
      wordOrder: 0.7,
      optimizedSimilarity: 0.5,
      textSimilarity: 0.72, // Moderate for stem matching
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
      optimizedSimilarity: 0.6,
      textSimilarity: 0.85, // High for stem matching
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
      optimizedSimilarity: 0.5,
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
      optimizedSimilarity: 0.55,
      textSimilarity: 0.82, // High for rephrased content
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
      optimizedSimilarity: 0.45,
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
      optimizedSimilarity: 0.3,
      textSimilarity: 0.48, // Low for different but related word choice
    },
  },

  // 11. Russian - Different verb forms (prefix + endings)
  {
    name: 'Russian verb forms',
    str1: 'Я начинаю понимать эту проблему',
    str2: 'Мы начали понимать эти проблемы',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.65,
      naturalStemming: 0.8,
      cosineTFIDF: 0.75,
      wordOrder: 0.7,
      optimizedSimilarity: 0.6,
      textSimilarity: 0.75,
    },
  },

  // 12. Russian - Adjective variations
  {
    name: 'Russian adjective forms',
    str1: 'Интересная книга лежит на столе',
    str2: 'Интересные книги лежали на столе',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.7,
      naturalStemming: 0.85,
      cosineTFIDF: 0.8,
      wordOrder: 0.8,
      optimizedSimilarity: 0.65,
      textSimilarity: 0.82,
    },
  },

  // 13. Russian - Perfective/imperfective
  {
    name: 'Russian verb aspects',
    str1: 'Я прочитал книгу',
    str2: 'Я читал книгу',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.7,
      naturalStemming: 0.75,
      cosineTFIDF: 0.9,
      wordOrder: 0.9,
      optimizedSimilarity: 0.75,
      textSimilarity: 0.8,
    },
  },

  // 14. Russian - Case variations
  {
    name: 'Russian case forms',
    str1: 'Дверь открыта ключом',
    str2: 'Ключ открыл дверь',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.45,
      naturalStemming: 0.65,
      cosineTFIDF: 0.7,
      wordOrder: 0.5,
      optimizedSimilarity: 0.55,
      textSimilarity: 0.68,
    },
  },

  // 15. Russian - Complex sentence with multiple verb forms
  {
    name: 'Russian complex sentence with multiple verb forms',
    str1: 'Я начал читать книгу, которая мне очень понравилась',
    str2: 'Мы начали читать книги, которые нам очень понравились',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.6,
      naturalStemming: 0.75,
      cosineTFIDF: 0.7,
      wordOrder: 0.65,
      optimizedSimilarity: 0.55,
      textSimilarity: 0.7,
    },
  },

  // 16. Russian - Sentence with different case and number
  {
    name: 'Russian sentence with different case and number',
    str1: 'Эта интересная книга была написана в 1990 году',
    str2: 'Эти интересные книги были написаны в 1990 году',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.7,
      naturalStemming: 0.8,
      cosineTFIDF: 0.85,
      wordOrder: 0.7,
      optimizedSimilarity: 0.6,
      textSimilarity: 0.8,
    },
  },

  // 17. Russian - Perfective vs imperfective aspect
  {
    name: 'Russian perfective vs imperfective aspect',
    str1: 'Я прочитал все письма',
    str2: 'Я читал все письма',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.65,
      naturalStemming: 0.7,
      cosineTFIDF: 0.75,
      wordOrder: 0.8,
      optimizedSimilarity: 0.6,
      textSimilarity: 0.75,
    },
  },

  // 18. Russian - Different word order with same meaning
  {
    name: 'Russian different word order with same meaning',
    str1: 'Книга, которую я читал, была интересной',
    str2: 'Интересной была та книга, которую я читал',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.6,
      naturalStemming: 0.85,
      cosineTFIDF: 0.8,
      wordOrder: 0.7,
      optimizedSimilarity: 0.65,
      textSimilarity: 0.8,
    },
  },

  // 19. Russian - Medium sentence with multiple clauses
  {
    name: 'Russian medium sentence with multiple clauses',
    str1: 'Когда я учился в университете, я часто посещал библиотеку, чтобы читать научные статьи',
    str2: 'Во время обучения в университете я регулярно ходил в библиотеку для чтения научных статей',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.55,
      naturalStemming: 0.8,
      cosineTFIDF: 0.75,
      wordOrder: 0.6,
      optimizedSimilarity: 0.65,
      textSimilarity: 0.78,
    },
  },

  // 20. Russian - Narrative with different verb aspects
  {
    name: 'Russian narrative with different verb aspects',
    str1: 'Вчера я позвонил другу и рассказал ему о новой книге, которую я прочитал на прошлой неделе',
    str2: 'Вчера я звонил другу и рассказывал ему о новой книге, которую я читал на прошлой неделе',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.7,
      naturalStemming: 0.85,
      cosineTFIDF: 0.85,
      wordOrder: 0.8,
      optimizedSimilarity: 0.7,
      textSimilarity: 0.85,
    },
  },

  // 21. Russian - Description with adjective variations
  {
    name: 'Russian description with adjective variations',
    str1: 'Большой старый дом, расположенный на окраине города, был построен в прошлом веке талантливыми архитекторами',
    str2: 'Большие старые дома, которые находятся на окраинах городов, были построены в прошлых веках талантливыми архитекторами',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.6,
      naturalStemming: 0.75,
      cosineTFIDF: 0.7,
      wordOrder: 0.7,
      optimizedSimilarity: 0.6,
      textSimilarity: 0.75,
    },
  },

  // 22. Russian - Complex sentence with participles
  {
    name: 'Russian complex sentence with participles',
    str1: 'Человек, написавший эту книгу, получил много наград за свой труд, изменивший жизнь многих людей',
    str2: 'Автор, создавший эту книгу, был награждён много раз за работу, повлиявшую на жизни множества читателей',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.45,
      naturalStemming: 0.65,
      cosineTFIDF: 0.6,
      wordOrder: 0.55,
      optimizedSimilarity: 0.55,
      textSimilarity: 0.65,
    },
  },

  // 23. Russian different ngrams with repetitions
  {
    name: 'Russian text with different repeated ngrams',
    str1: 'Старая мудрая сова сидела на старой ветке и наблюдала на старой ветке',
    str2: 'Молодая глупая сова сидела на старой ветке и думала, что сова сидела',
    locale: 'ru-RU',
    expected: {
      exact: false,
      intlCollator: false,
      jaroWinkler: 0.82,
      naturalStemming: 0.9,
      cosineTFIDF: 0.85,
      wordOrder: 0.85,
      optimizedSimilarity: 0.75,
      textSimilarity: 0.88,
    },
  },
];
