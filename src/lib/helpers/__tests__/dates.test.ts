import { formatDateTag } from '../dates';

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
