import { sortJson, stringCompare } from '../sort-json';

describe('stringCompare', () => {
  it('should compare strings case-sensitively when caseSensitive is true', () => {
    // Testing uppercase vs lowercase
    expect(stringCompare('A', 'a', true)).toBeLessThan(0); // 'A' should come before 'a'
    expect(stringCompare('a', 'A', true)).toBeGreaterThan(0); // 'a' should come after 'A'
    expect(stringCompare('A', 'A', true)).toBe(0); // 'A' equals 'A'

    // Testing ordering: A, B, a, b
    expect(stringCompare('A', 'B', true)).toBeLessThan(0);
    expect(stringCompare('B', 'a', true)).toBeLessThan(0);
    expect(stringCompare('a', 'b', true)).toBeLessThan(0);
  });

  it('should compare strings case-insensitively when caseSensitive is false', () => {
    expect(stringCompare('A', 'a', false)).toBe(0); // 'A' equals 'a' when case-insensitive
    expect(stringCompare('B', 'b', false)).toBe(0);
    expect(stringCompare('a', 'A', false)).toBe(0);

    // Testing alphabetical ordering regardless of case
    expect(stringCompare('a', 'B', false)).toBeLessThan(0); // 'a' vs 'B' -> 'a' vs 'b' -> a comes before b
    expect(stringCompare('Z', 'a', false)).toBeGreaterThan(0); // 'Z' vs 'a' -> 'z' vs 'a' -> a comes after z alphabetically
  });
});

describe('sortJson', () => {
  describe('case-sensitive sorting', () => {
    it('should sort keys case-sensitively when caseSensitive is true', () => {
      const input = {
        b: 'value',
        A: 'value',
        a: 'value',
        B: 'value',
      };
      const expected = {
        A: 'value',
        B: 'value',
        a: 'value',
        b: 'value',
      };
      const result = sortJson(input, { caseSensitive: true });
      expect(Object.keys(result).join(',')).toEqual(Object.keys(expected).join(','));
    });

    it('should sort keys case-insensitively when caseSensitive is false', () => {
      const input = {
        b: 'value',
        A: 'value',
        a: 'value',
        B: 'value',
      };
      const expected = {
        A: 'value',
        a: 'value',
        b: 'value',
        B: 'value',
      };
      const result = sortJson(input, { caseSensitive: false });
      expect(Object.keys(result).join(',')).toEqual(Object.keys(expected).join(','));
    });
  });

  describe('basic sorting', () => {
    it('should sort keys in ascending order by default', () => {
      const input = {
        z: 'value',
        a: 'value',
        m: 'value',
      };
      const expected = {
        a: 'value',
        m: 'value',
        z: 'value',
      };
      const result = sortJson(input);
      expect(Object.keys(result).join(',')).toEqual(Object.keys(expected).join(','));
    });

    it('should sort keys in descending order when order is desc', () => {
      const input = {
        a: 'value',
        z: 'value',
        m: 'value',
      };
      const expected = {
        z: 'value',
        m: 'value',
        a: 'value',
      };
      const result = sortJson(input, { order: 'desc' });
      expect(Object.keys(result).join(',')).toEqual(Object.keys(expected).join(','));
    });
  });

  describe('primitive position', () => {
    it('should place primitives first by default', () => {
      const input = {
        obj: { nested: 'value' },
        str: 'string',
        num: 42,
      };
      const expected = {
        num: 42,
        str: 'string',
        obj: { nested: 'value' },
      };
      const result = sortJson(input);
      expect(Object.keys(result).join(',')).toEqual(Object.keys(expected).join(','));
    });

    it('should place primitives last when primitivePosition is last', () => {
      const input = {
        obj: { nested: 'value' },
        str: 'string',
        num: 42,
      };
      const expected = {
        obj: { nested: 'value' },
        num: 42,
        str: 'string',
      };
      const result = sortJson(input, { primitivePosition: 'last' });
      expect(Object.keys(result).join(',')).toEqual(Object.keys(expected).join(','));
    });
  });

  describe('nested objects', () => {
    it('should recursively sort nested objects', () => {
      const input = {
        b: {
          z: 'value',
          a: 'value',
        },
        a: {
          y: 'value',
          x: 'value',
        },
      };
      const expected = {
        a: {
          x: 'value',
          y: 'value',
        },
        b: {
          a: 'value',
          z: 'value',
        },
      };
      const result = sortJson(input);
      expect(result).toEqual(expected);
    });
  });

  describe('arrays', () => {
    it('should sort elements in arrays', () => {
      const input = [
        { z: 'value', a: 'value' },
        { m: 'value', b: 'value' },
      ];
      const expected = [
        { a: 'value', z: 'value' },
        { b: 'value', m: 'value' },
      ];
      const result = sortJson(input);
      expect(result).toEqual(expected);
    });
  });
});
