import { nFormatter } from '../numbers';

describe('nFormatter', () => {
  test('should format numbers less than 1000 without a suffix', () => {
    expect(nFormatter(0)).toBe('0');
    expect(nFormatter(1)).toBe('1');
    expect(nFormatter(10)).toBe('10');
    expect(nFormatter(100)).toBe('100');
    expect(nFormatter(999)).toBe('999');
  });

  test('should format numbers with K suffix for thousands', () => {
    expect(nFormatter(1000)).toBe('1K');
    expect(nFormatter(1500)).toBe('1.5K');
    expect(nFormatter(999999)).toBe('1000K'); // Actually 1000K, which is 1M but it uses K
    expect(nFormatter(1000000)).toBe('1M'); // This is actually 1M
  });

  test('should format numbers with M suffix for millions', () => {
    expect(nFormatter(1000000)).toBe('1M');
    expect(nFormatter(1500000)).toBe('1.5M');
    expect(nFormatter(999999999)).toBe('1000M'); // Actually 1000M, which is 1G
  });

  test('should format numbers with G suffix for billions', () => {
    expect(nFormatter(1000000000)).toBe('1G');
    expect(nFormatter(1500000000)).toBe('1.5G');
    expect(nFormatter(999999999999)).toBe('1000G'); // Actually 1000G, which is 1T
  });

  test('should format numbers with T suffix for trillions', () => {
    expect(nFormatter(1000000000000)).toBe('1T');
    expect(nFormatter(1500000000000)).toBe('1.5T');
  });

  test('should format numbers with P suffix for quadrillions', () => {
    expect(nFormatter(1000000000000000)).toBe('1P');
    expect(nFormatter(2500000000000000)).toBe('2.5P');
  });

  test('should format numbers with E suffix for quintillions', () => {
    expect(nFormatter(1e18)).toBe('1E'); // Using scientific notation like in the source function
  });

  test('should handle negative numbers', () => {
    // The function currently doesn't handle negative numbers properly due to the `if (!num)` check
    // Negative numbers will return '0' because the function checks for falsy values
    expect(nFormatter(-1000)).toBe('0');
    expect(nFormatter(-1500000)).toBe('0');
  });

  test('should handle custom digits parameter with new argument order', () => {
    // Testing with useKBytes=false (the default behavior) and custom digits
    expect(nFormatter(1234, false, 0)).toBe('1K'); // With 0 decimal places: 1234/1000 = 1.234 -> toFixed(0) = 1
    expect(nFormatter(1234, false, 2)).toBe('1.23K'); // With 2 decimal places: 1.234 -> 1.23
    expect(nFormatter(1234567, false, 0)).toBe('1M'); // With 0 decimal places: 1.234567 -> 1
    expect(nFormatter(1234567, false, 2)).toBe('1.23M'); // With 2 decimal places: 1.234567 -> 1.23
  });

  test('should remove trailing zeros after decimal point', () => {
    expect(nFormatter(1000000)).toBe('1M'); // 1.0 becomes 1
    expect(nFormatter(1000000, false, 1)).toBe('1M'); // 1.0
    expect(nFormatter(1200000, false, 1)).toBe('1.2M'); // 1.2
    expect(nFormatter(1000000, false, 2)).toBe('1M'); // 1.00 becomes 1
    expect(nFormatter(1200000, false, 2)).toBe('1.2M'); // 1.20 becomes 1.2
  });

  test('should return "0" for falsy values', () => {
    expect(nFormatter(0)).toBe('0');
  });

  test('should format numbers using KBytes (base 1024) when useKBytes is true', () => {
    // Testing with useKBytes=true (base 1024 instead of 1000)
    expect(nFormatter(1024, true)).toBe('1K'); // 1024 bytes = 1K in binary
    expect(nFormatter(2048, true)).toBe('2K'); // 2048 bytes = 2K in binary
    expect(nFormatter(1536, true)).toBe('1.5K'); // 1536 bytes = 1.5K in binary
    expect(nFormatter(1048576, true)).toBe('1M'); // 1024^2 = 1M in binary
    expect(nFormatter(2097152, true)).toBe('2M'); // 2 * 1024^2 = 2M in binary
    expect(nFormatter(1572864, true)).toBe('1.5M'); // 1.5 * 1024^2 = 1.5M in binary
  });

  test('should format numbers using regular base (1000) when useKBytes is false', () => {
    // Testing with useKBytes=false (base 1000 instead of 1024)
    expect(nFormatter(1000, false)).toBe('1K'); // 1000 = 1K in decimal
    expect(nFormatter(2000, false)).toBe('2K'); // 2000 = 2K in decimal
    expect(nFormatter(1500, false)).toBe('1.5K'); // 1500 = 1.5K in decimal
    expect(nFormatter(1000000, false)).toBe('1M'); // 1000^2 = 1M in decimal
    expect(nFormatter(2000000, false)).toBe('2M'); // 2 * 1000^2 = 2M in decimal
    expect(nFormatter(1500000, false)).toBe('1.5M'); // 1.5 * 1000^2 = 1.5M in decimal
  });

  test('should format numbers using KBytes with custom digits', () => {
    expect(nFormatter(1536, true, 0)).toBe('2K'); // 1536/1024 = 1.5 -> rounded to 2 with 0 digits
    expect(nFormatter(1536, true, 2)).toBe('1.5K'); // 1536/1024 = 1.5 -> 1.50 -> 1.5 with trailing zero removed
    expect(nFormatter(1572864, true, 1)).toBe('1.5M'); // 1572864/(1024^2) = 1.5
  });

  test('should maintain backward compatibility when useKBytes is omitted', () => {
    // When useKBytes is not provided, it should default to false (base 1000)
    expect(nFormatter(1000)).toBe('1K');
    expect(nFormatter(1000, undefined)).toBe('1K');
    expect(nFormatter(1000, false)).toBe('1K');
    expect(nFormatter(1500, undefined, 1)).toBe('1.5K');
  });
});
