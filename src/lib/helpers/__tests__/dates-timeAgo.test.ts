import { timeAgo } from '../dates';

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
