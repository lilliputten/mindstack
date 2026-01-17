import {
  formatDateTag,
  formatSecondsDuration,
  stringifyPeriod,
  timeAgo,
  translatedPeriod,
} from '../dates';

describe('formatDateTag', () => {
  beforeEach(() => {
    // Mock the Date object to have a consistent value for testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 5, 15, 14, 30, 45, 123)); // June 15, 2023, 14:30:45.123
  });

  afterEach(() => {
    // Restore the real Date object after each test
    jest.useRealTimers();
  });

  it('formats current date when no input is provided', () => {
    const result = formatDateTag();
    expect(result).toBe('2023-06-15,14:30:45:123');
  });

  it('formats a Date object input', () => {
    const date = new Date(2022, 2, 10, 9, 15, 30, 456); // March 10, 2022, 09:15:30.456
    const result = formatDateTag(date);
    expect(result).toBe('2022-03-10,09:15:30:456');
  });

  it('formats a string input', () => {
    const result = formatDateTag('2021-12-25T18:30:00.500Z');
    // Note: The exact result depends on timezone interpretation
    // But it should follow the YYYY-MM-DD,hh:mm:ss:ms format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2},\d{2}:\d{2}:\d{2}:\d{3}$/);
  });

  it('formats a timestamp input', () => {
    const timestamp = new Date(2020, 7, 5, 12, 45, 30, 789).getTime();
    const result = formatDateTag(timestamp);
    expect(result).toBe('2020-08-05,12:45:30:789');
  });

  it('omits time when omitTime is true', () => {
    const result = formatDateTag(undefined, true);
    expect(result).toBe('2023-06-15');
  });

  it('omits time when a date is provided and omitTime is true', () => {
    const date = new Date(2022, 2, 10, 9, 15, 30, 456); // March 10, 2022, 09:15:30.456
    const result = formatDateTag(date, true);
    expect(result).toBe('2022-03-10');
  });

  it('handles edge cases for month (January)', () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    const result = formatDateTag(date);
    expect(result).toMatch(/^2023-01-\d{2},\d{2}:\d{2}:\d{2}:\d{3}$/);
  });

  it('handles edge cases for month (December)', () => {
    const date = new Date(2023, 11, 15); // December 15, 2023
    const result = formatDateTag(date);
    expect(result).toMatch(/^2023-12-\d{2},\d{2}:\d{2}:\d{2}:\d{3}$/);
  });

  it('handles edge cases for day (single digit)', () => {
    const date = new Date(2023, 5, 5, 14, 30, 45, 123); // June 5, 2023 (day is single digit)
    const result = formatDateTag(date);
    expect(result).toMatch(/^2023-06-05,\d{2}:\d{2}:\d{2}:\d{3}$/);
  });

  it('handles edge cases for hour (midnight)', () => {
    const date = new Date(2023, 5, 15, 0, 30, 45, 123); // Midnight
    const result = formatDateTag(date);
    expect(result).toMatch(/^2023-06-15,00:\d{2}:\d{2}:\d{3}$/);
  });

  it('handles edge cases for minute (zero)', () => {
    const date = new Date(2023, 5, 15, 14, 0, 45, 123); // Zero minutes
    const result = formatDateTag(date);
    expect(result).toMatch(/^2023-06-15,\d{2}:00:\d{2}:\d{3}$/);
  });

  it('handles edge cases for seconds (zero)', () => {
    const date = new Date(2023, 5, 15, 14, 30, 0, 123); // Zero seconds
    const result = formatDateTag(date);
    expect(result).toMatch(/^2023-06-15,\d{2}:\d{2}:00:\d{3}$/);
  });

  it('handles edge cases for milliseconds (zero)', () => {
    const date = new Date(2023, 5, 15, 14, 30, 45, 0); // Zero milliseconds
    const result = formatDateTag(date);
    expect(result).toMatch(/^2023-06-15,\d{2}:\d{2}:\d{2}:000$/);
  });

  it('correctly pads numbers with leading zeros', () => {
    const date = new Date(2023, 0, 1, 1, 1, 1, 1); // Jan 1, 2023 at 01:01:01.001
    const result = formatDateTag(date);
    expect(result).toBe('2023-01-01,01:01:01:001');
  });

  it('correctly formats years', () => {
    const date = new Date(2001, 0, 1); // Jan 1, 2001
    const result = formatDateTag(date);
    expect(result).toMatch(/^2001-/);
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    // Mock the Date object to have a consistent value for testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15T14:30:45.123Z'));
  });

  afterEach(() => {
    // Restore the real Date object after each test
    jest.useRealTimers();
  });

  it('returns "now" for current time', () => {
    const result = timeAgo(new Date());
    expect(result).toBe('0ms ago');
  });

  it('formats seconds ago', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = timeAgo(pastDate);
    expect(result).toBe('30s ago');
  });

  it('formats minutes ago', () => {
    const pastDate = new Date(Date.now() - 2.5 * 60 * 1000); // 2.5 minutes ago
    const result = timeAgo(pastDate);
    // ms library formats 2.5 minutes as "3m" (it rounds up)
    expect(result).toBe('3m ago');
  });

  it('formats hours ago', () => {
    const pastDate = new Date(Date.now() - 3.5 * 60 * 60 * 1000); // 3.5 hours ago
    const result = timeAgo(pastDate);
    // ms library formats 3.5 hours as "4h" (it rounds up)
    expect(result).toBe('4h ago');
  });

  it('formats days ago', () => {
    const pastDate = new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000); // 2.5 days ago
    const result = timeAgo(pastDate);
    // ms library formats 2.5 days as "3d" (it rounds up)
    expect(result).toBe('3d ago');
  });

  it('returns time only when timeOnly is true', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('30s');
  });

  it('shows milliseconds only with timeOnly=true', () => {
    const pastDate = new Date(Date.now() - 500); // 500 milliseconds ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('500ms');
  });

  it('shows seconds only with timeOnly=true', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('30s');
  });

  it('shows minutes only with timeOnly=true', () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('2m');
  });

  it('shows hours only with timeOnly=true', () => {
    const pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('3h');
  });

  it('shows days only with timeOnly=true', () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('2d');
  });

  it('shows compound time with timeOnly=true (minutes and seconds)', () => {
    const pastDate = new Date(Date.now() - (2 * 60 + 30) * 1000); // 2 minutes 30 seconds ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('3m'); // ms library rounds up
  });

  it('shows compound time with timeOnly=true (hours and minutes)', () => {
    const pastDate = new Date(Date.now() - (3 * 3600 + 30 * 60) * 1000); // 3 hours 30 minutes ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('4h'); // ms library rounds up
  });

  it('shows compound time with timeOnly=true (days and hours)', () => {
    const pastDate = new Date(Date.now() - (2 * 86400 + 12 * 3600) * 1000); // 2 days 12 hours ago
    const result = timeAgo(pastDate, true);
    expect(result).toBe('3d'); // ms library rounds up
  });

  it('handles string input', () => {
    const pastDate = new Date(Date.now() - 30 * 1000);
    const result = timeAgo(pastDate.toISOString());
    expect(result).toBe('30s ago');
  });

  it('handles future dates', () => {
    const futureDate = new Date(Date.now() + 30 * 1000); // 30 seconds in future
    const result = timeAgo(futureDate);
    expect(result).toBe('-30s ago'); // Negative time indicates future
  });
});

describe('formatSecondsDuration', () => {
  // Mock translation function for testing
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'duration.days': ' days',
      'duration.hours': ' hours',
      'duration.minutes': ' minutes',
      'duration.seconds': ' seconds',
    };
    return translations[key] || key;
  };

  it('formats seconds only', () => {
    const result = formatSecondsDuration(45);
    expect(result).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    const result = formatSecondsDuration(125);
    expect(result).toBe('2m 5s');
  });

  it('formats hours, minutes, and seconds', () => {
    const result = formatSecondsDuration(3725); // 1 hour, 2 minutes, 5 seconds
    expect(result).toBe('1h 2m 5s');
  });

  it('formats days, hours, minutes, and seconds', () => {
    const result = formatSecondsDuration(90061); // 1 day, 1 hour, 1 minute, 1 second
    expect(result).toBe('1d 1h 1m 1s');
  });

  it('handles zero seconds', () => {
    const result = formatSecondsDuration(0);
    expect(result).toBe('0s');
  });

  it('handles large durations', () => {
    const result = formatSecondsDuration(1234567); // 14 days, 6 hours, 56 minutes, 7 seconds
    expect(result).toBe('14d 6h 56m 7s');
  });

  it('uses translations when provided', () => {
    const result = formatSecondsDuration(3725, mockT); // 1 hour, 2 minutes, 5 seconds
    expect(result).toBe('1 hours 2 minutes 5 seconds');
  });

  it('formats with translations for all units', () => {
    const result = formatSecondsDuration(90061, mockT); // 1 day, 1 hour, 1 minute, 1 second
    expect(result).toBe('1 days 1 hours 1 minutes 1 seconds');
  });

  it('handles fractional seconds', () => {
    const result = formatSecondsDuration(119.9); // Should be 1 minute, 59.9 seconds
    // The function keeps fractional seconds as-is
    expect(result).toBe('1m 59.900000000000006s');
  });

  it('shows only seconds when time is less than a minute', () => {
    const result = formatSecondsDuration(59);
    expect(result).toBe('59s');
  });

  it('shows only minutes when time is exactly one minute (no zero seconds)', () => {
    const result = formatSecondsDuration(60);
    expect(result).toBe('1m');
  });

  it('handles edge case with exactly 24 hours (shows only days)', () => {
    const result = formatSecondsDuration(86400); // Exactly 24 hours (1 day)
    expect(result).toBe('1d');
  });

  it('handles edge case with exactly 7 days (shows only days)', () => {
    const result = formatSecondsDuration(604800); // Exactly 7 days
    expect(result).toBe('7d');
  });

  it('omits zero values units completely', () => {
    const result = formatSecondsDuration(3661); // 1 hour, 1 minute, 1 second
    expect(result).toBe('1h 1m 1s');
  });
});

describe('translatedPeriod', () => {
  beforeEach(() => {
    // Mock the Date object to have a consistent value for testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15T14:30:45.123Z'));
  });

  afterEach(() => {
    // Restore the real Date object after each test
    jest.useRealTimers();
  });

  // Mock translation function for testing
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'duration.milliseconds': ' milliseconds',
      'duration.seconds': ' seconds',
      'duration.minutes': ' minutes',
      'duration.hours': ' hours',
      'duration.days': ' days',
    };
    return translations[key] || key;
  };

  it('translates milliseconds with postfix', () => {
    const pastDate = new Date(Date.now() - 500); // 500 milliseconds ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('500 milliseconds');
  });

  it('translates seconds with postfix', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('30 seconds');
  });

  it('translates minutes with postfix', () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('2 minutes');
  });

  it('translates hours with postfix', () => {
    const pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('3 hours');
  });

  it('translates days with postfix', () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('2 days');
  });

  it('translates compound time (minutes and seconds)', () => {
    const pastDate = new Date(Date.now() - (2 * 60 + 30) * 1000); // 2 minutes 30 seconds ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('3 minutes'); // ms library rounds up to "3m"
  });

  it('translates compound time (hours and minutes)', () => {
    const pastDate = new Date(Date.now() - (3 * 3600 + 30 * 60) * 1000); // 3 hours 30 minutes ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('4 hours'); // ms library rounds up to "4h"
  });

  it('translates compound time (days and hours)', () => {
    const pastDate = new Date(Date.now() - (2 * 86400 + 12 * 3600) * 1000); // 2 days 12 hours ago
    const result = translatedPeriod(pastDate, mockT);
    expect(result).toBe('3 days'); // ms library rounds up to "3d"
  });

  it('returns untranslated postfixes when no translation function provided', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = translatedPeriod(pastDate);
    expect(result).toBe('30s'); // Falls back to default postfix
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
    const futureDate = new Date(Date.now() + 30 * 1000); // 30 seconds in future
    const result = translatedPeriod(futureDate, mockT);
    // For negative times, the translation function receives "s" which should be translated
    // But the negative sign is preserved in the output
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
    // Test with a more complex compound time (1 day + 2 hours + 30 minutes + 45 seconds)
    // The ms library rounds this up significantly
    const pastDate = new Date(Date.now() - (1 * 86400 + 2 * 3600 + 30 * 60 + 45) * 1000);
    const result = translatedPeriod(pastDate, mockT);
    // ms library rounds "1d 2h 30m 45s" to "1d"
    expect(result).toBe('1 days');
  });
});

describe('stringifyPeriod', () => {
  beforeEach(() => {
    // Mock the Date object to have a consistent value for testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15T14:30:45.123Z'));
  });

  afterEach(() => {
    // Restore the real Date object after each test
    jest.useRealTimers();
  });

  it('returns empty string for empty/undefined input', () => {
    const result = stringifyPeriod(undefined);
    expect(result).toBe('');
  });

  it('returns empty string for empty string', () => {
    const result = stringifyPeriod('');
    expect(result).toBe('');
  });

  it('returns empty string for zero number', () => {
    const result = stringifyPeriod(0);
    expect(result).toBe('');
  });

  it('handles numeric milliseconds directly', () => {
    const result = stringifyPeriod(500);
    expect(result).toBe('500ms');
  });

  it('handles seconds in milliseconds', () => {
    const result = stringifyPeriod(30 * 1000);
    expect(result).toBe('30s');
  });

  it('handles minutes in milliseconds', () => {
    const result = stringifyPeriod(2 * 60 * 1000);
    expect(result).toBe('2m');
  });

  it('handles hours in milliseconds', () => {
    const result = stringifyPeriod(3 * 60 * 60 * 1000);
    expect(result).toBe('3h');
  });

  it('handles days in milliseconds', () => {
    const result = stringifyPeriod(2 * 24 * 60 * 60 * 1000);
    expect(result).toBe('2d');
  });

  it('handles Date objects (calculates difference from now)', () => {
    const pastDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = stringifyPeriod(pastDate);
    expect(result).toBe('30s');
  });

  it('handles ISO string dates', () => {
    const pastDate = new Date(Date.now() - 30 * 1000).toISOString();
    const result = stringifyPeriod(pastDate);
    expect(result).toBe('30s');
  });

  it('handles compound times', () => {
    const pastDate = new Date(Date.now() - (2 * 60 + 30) * 1000); // 2 minutes 30 seconds ago
    const result = stringifyPeriod(pastDate);
    expect(result).toBe('3m'); // ms library rounds up
  });

  it('handles future dates', () => {
    const futureDate = new Date(Date.now() + 30 * 1000); // 30 seconds in future
    const result = stringifyPeriod(futureDate);
    expect(result).toBe('-30s'); // Negative sign for future
  });

  it('handles large durations', () => {
    const result = stringifyPeriod(1234567 * 1000); // About 14 days
    expect(result).toBe('14d'); // ms library formats large durations
  });

  it('handles very small durations (milliseconds)', () => {
    const result = stringifyPeriod(100);
    expect(result).toBe('100ms');
  });

  it('handles numeric zero with explicit value', () => {
    const result = stringifyPeriod(0);
    expect(result).toBe('');
  });

  it('handles Date object exactly at current time', () => {
    const result = stringifyPeriod(new Date());
    expect(result).toBe('');
  });
});
