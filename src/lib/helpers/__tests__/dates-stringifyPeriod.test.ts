import { stringifyPeriod } from '../dates';

describe('stringifyPeriod', () => {
  // Store original Date.now to restore after tests
  const originalDateNow = Date.now;

  beforeEach(() => {
    // Mock Date.now to return a consistent value for predictable tests
    const baseTime = new Date('2023-01-15T10:00:00Z').getTime();
    Date.now = jest.fn(() => baseTime);
  });

  afterEach(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  it('should return empty string when no timestamp is provided', () => {
    expect(stringifyPeriod()).toBe('');
  });

  it('should return empty string when timestamp is null or undefined', () => {
    expect(stringifyPeriod(undefined)).toBe('');
  });

  it('should return empty string when timestamp results in zero difference', () => {
    // When passing a number directly as duration, it should return that duration
    // But if the duration is 0, it should return empty string
    expect(stringifyPeriod(0)).toBe('');

    // When passing a date that equals the mocked "now", the difference should be 0
    const now = new Date('2023-01-15T10:00:00Z');
    // Since Date.now is mocked to the same time, the difference will be 0
    expect(stringifyPeriod(now)).toBe('');
  });

  it('should return duration string for timestamps in the past', () => {
    // When passing a number directly, it's treated as a duration in milliseconds
    expect(stringifyPeriod(1000)).toBe('1s'); // 1000ms = 1s
    expect(stringifyPeriod(30000)).toBe('30s'); // 30000ms = 30s
    expect(stringifyPeriod(60000)).toBe('1m'); // 60000ms = 1m
    expect(stringifyPeriod(120000)).toBe('2m'); // 120000ms = 2m
    expect(stringifyPeriod(3600000)).toBe('1h'); // 3600000ms = 1h
    expect(stringifyPeriod(7200000)).toBe('2h'); // 7200000ms = 2h
    expect(stringifyPeriod(86400000)).toBe('1d'); // 86400000ms = 1d
  });

  it('should handle Date objects as input', () => {
    // Create dates relative to the mocked "now" time
    const baseTime = new Date('2023-01-15T10:00:00Z').getTime();

    // Date 30 seconds before the mocked "now"
    const pastDate = new Date(baseTime - 30000);
    expect(stringifyPeriod(pastDate)).toBe('30s');

    // Date 2 minutes before the mocked "now"
    const pastDate2 = new Date(baseTime - 120000);
    expect(stringifyPeriod(pastDate2)).toBe('2m');
  });

  it('should handle date objects as input', () => {
    const baseTime = new Date('2023-01-15T10:00:00Z').getTime();

    // ISO string representing 30 seconds before the mocked "now"
    const pastISOString = new Date(baseTime - 30000).toISOString();
    expect(stringifyPeriod(pastISOString)).toBe('30s');

    // ISO string representing 2 minutes before the mocked "now"
    const pastISOString2 = new Date(baseTime - 120000).toISOString();
    expect(stringifyPeriod(pastISOString2)).toBe('2m');
  });

  it('should handle millisecond durations directly as numbers', () => {
    // When passing a number directly, it's treated as a duration in milliseconds
    expect(stringifyPeriod(500)).toBe('500ms');
    expect(stringifyPeriod(1000)).toBe('1s');
    expect(stringifyPeriod(2000)).toBe('2s');
    expect(stringifyPeriod(60000)).toBe('1m');
    expect(stringifyPeriod(120000)).toBe('2m');
    expect(stringifyPeriod(3600000)).toBe('1h');
    expect(stringifyPeriod(7200000)).toBe('2h');
    expect(stringifyPeriod(86400000)).toBe('1d');
  });

  it('should handle fractional seconds', () => {
    // ms library handles fractional values but rounds them
    expect(stringifyPeriod(999)).toBe('999ms');
    expect(stringifyPeriod(1500)).toBe('2s'); // ms rounds 1500ms to 2s
  });

  it('should handle complex durations', () => {
    // Test with a duration that spans multiple units
    // ms library will round this to the nearest hour
    expect(stringifyPeriod(2 * 3600000 + 30 * 60000 + 45000)).toBe('3h');
  });
});
