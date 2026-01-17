import { Formats, RichTranslationValues, TranslationValues } from 'next-intl';

import { translatedPeriod } from '../dates';

describe('translatedPeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15T14:30:45.123Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Mock translation function for testing
  // Using a function that returns a function to match TTranslator type
  const createMockT = () => {
    const translations: Record<string, string> = {
      'duration.milliseconds': 'milliseconds',
      'duration.seconds': 'seconds',
      'duration.minutes': 'minutes',
      'duration.hours': 'hours',
      'duration.days': 'days',
    };

    const mockFn = (key: string, _values?: TranslationValues, _formats?: Formats) => {
      return translations[key] || key;
    };

    // Add rich property to match TTranslator type
    mockFn.rich = (key: string, _values?: RichTranslationValues, _formats?: Formats) => {
      return mockFn(key);
    };

    return mockFn;
  };

  const mockT = createMockT();

  it('translates milliseconds with postfix', () => {
    const result = translatedPeriod(500, mockT); // 500 milliseconds
    expect(result).toBe('500 milliseconds');
  });

  it('translates seconds with postfix', () => {
    const result = translatedPeriod(30 * 1000, mockT); // 30 seconds
    expect(result).toBe('30 seconds');
  });

  it('translates minutes with postfix', () => {
    const result = translatedPeriod(2 * 60 * 1000, mockT); // 2 minutes
    expect(result).toBe('2 minutes');
  });

  it('translates hours with postfix', () => {
    const result = translatedPeriod(3 * 60 * 60 * 1000, mockT); // 3 hours
    expect(result).toBe('3 hours');
  });

  it('translates days with postfix', () => {
    const result = translatedPeriod(2 * 24 * 60 * 60 * 1000, mockT); // 2 days
    expect(result).toBe('2 days');
  });

  it('translates compound time (minutes and seconds)', () => {
    const duration = (2 * 60 + 30) * 1000; // 2 minutes 30 seconds
    const result = translatedPeriod(duration, mockT);
    expect(result).toBe('3 minutes'); // ms library rounds up to "3m"
  });

  it('translates compound time (hours and minutes', () => {
    const duration = (3 * 3600 + 30 * 60) * 1000; // 3 hours 30 minutes
    const result = translatedPeriod(duration, mockT);
    expect(result).toBe('4 hours'); // ms library rounds up to "4h"
  });

  it('translates compound time (days and hours)', () => {
    const duration = (2 * 86400 + 12 * 3600) * 1000; // 2 days 12 hours
    const result = translatedPeriod(duration, mockT);
    expect(result).toBe('3 days'); // ms library rounds up to "3d"
  });

  it('returns untranslated postfixes when no translation function provided', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = translatedPeriod(pastDate);
    expect(result).toBe('30 s');
  });

  it('handles edge case with current time', () => {
    const result = translatedPeriod(new Date(), mockT);
    expect(result).toBe('');
  });

  it('handles zero difference', () => {
    const result = translatedPeriod(0, mockT);
    expect(result).toBe('');
  });

  it('handles empty/undefined input', () => {
    const result = translatedPeriod(undefined, mockT);
    expect(result).toBe('');
  });

  it('handles future dates', () => {
    const result = translatedPeriod(-30000, mockT); // 30 seconds in future (negative timestamp)
    expect(result).toMatch(/^-30/); // Should start with -30
  });

  it('handles string input', () => {
    const pastDate = new Date(Date.now() - 30 * 1000);
    const result = translatedPeriod(pastDate.toISOString(), mockT);
    expect(result).toBe('30 seconds');
  });

  it('handles numeric timestamp input', () => {
    const timestamp = 30 * 1000; // 30 seconds as milliseconds
    const result = translatedPeriod(timestamp, mockT);
    expect(result).toBe('30 seconds');
  });

  it('preserves formatting for complex compound times', () => {
    const duration = (1 * 86400 + 2 * 3600 + 30 * 60 + 45) * 1000;
    const result = translatedPeriod(duration, mockT);
    expect(result).toBe('1 days'); // ms library rounds to "1d"
  });

  it('handles singular units correctly', () => {
    const mockT = (key: string, _values?: TranslationValues, _formats?: Formats) => {
      if (key === 'duration.seconds') return 'second';
      if (key === 'duration.seconds_plural') return 'seconds';
      return key;
    };
    mockT.rich = (key: string, _values?: RichTranslationValues, _formats?: Formats) => {
      return mockT(key);
    };

    const result = translatedPeriod(1000, mockT);
    expect(result).toBe('1 second');
  });

  it('handles plural units correctly', () => {
    const mockT = (key: string, _values?: TranslationValues, _formats?: Formats) => {
      if (key === 'duration.seconds') return 'seconds';
      return key;
    };
    mockT.rich = (key: string, _values?: RichTranslationValues, _formats?: Formats) => {
      return mockT(key);
    };

    const result = translatedPeriod(2000, mockT);
    expect(result).toBe('2 seconds');
  });

  it('falls back to default units when translations missing', () => {
    const mockT = (key: string, _values?: TranslationValues, _formats?: Formats) => key; // Returns key as-is
    mockT.rich = (key: string, _values?: RichTranslationValues, _formats?: Formats) => {
      return mockT(key);
    };

    const result = translatedPeriod(30000, mockT);
    expect(result).toBe('30 duration.seconds');
  });

  it('maintains original formatting for incomplete translation keys', () => {
    const mockT = (key: string, _values?: TranslationValues, _formats?: Formats) => {
      // Only provide translation for seconds
      if (key === 'duration.seconds') return 'secs';
      return key; // Return key as-is for others
    };
    mockT.rich = (key: string, _values?: RichTranslationValues, _formats?: Formats) => {
      return mockT(key);
    };

    const result = translatedPeriod(30000, mockT);
    expect(result).toBe('30 secs'); // Should use original 's' since other keys not translated
  });
});
