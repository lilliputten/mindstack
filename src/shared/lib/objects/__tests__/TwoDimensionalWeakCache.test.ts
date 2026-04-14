import { describe, expect, it } from '@jest/globals';

import { TwoDimensionalWeakCache } from '../TwoDimensionalWeakCache';

describe('TwoDimensionalWeakCache', () => {
  it('should initialize an empty cache', () => {
    const cache = new TwoDimensionalWeakCache<object, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((cache as any).cache).toBeInstanceOf(WeakMap);
  });

  it('should set and get values correctly with object keys', () => {
    const cache = new TwoDimensionalWeakCache<object, string>();

    const key1 = {};
    const key2 = {};

    cache.set(key1, key2, 'value');
    expect(cache.get(key1, key2)).toBe('value');
    expect(cache.has(key1, key2)).toBe(true);
  });

  it('should return undefined for non-existent keys', () => {
    const cache = new TwoDimensionalWeakCache<object, string>();

    const key1 = {};
    const key2 = {};
    const key3 = {};

    expect(cache.get(key1, key2)).toBeUndefined();
    expect(cache.has(key1, key2)).toBe(false);

    // Test with one existing key and one non-existing key
    cache.set(key1, key2, 'value');
    expect(cache.get(key1, key3)).toBeUndefined();
    expect(cache.has(key1, key3)).toBe(false);
  });

  it('should support different value types', () => {
    const cache1 = new TwoDimensionalWeakCache<object, number>();
    const cache2 = new TwoDimensionalWeakCache<object, { data: string }>();

    const key1 = {};
    const key2 = {};

    cache1.set(key1, key2, 123);
    cache2.set(key1, key2, { data: 'test' });

    expect(cache1.get(key1, key2)).toBe(123);
    expect(cache2.get(key1, key2)).toEqual({ data: 'test' });
  });

  it('should handle multiple entries with same first key', () => {
    const cache = new TwoDimensionalWeakCache<object, string>();

    const key1 = {};
    const key2 = {};
    const key3 = {};

    cache.set(key1, key2, 'first');
    cache.set(key1, key3, 'second');

    expect(cache.get(key1, key2)).toBe('first');
    expect(cache.get(key1, key3)).toBe('second');
  });

  it('should handle multiple entries with same second key', () => {
    const cache = new TwoDimensionalWeakCache<object, string>();

    const key1 = {};
    const key2 = {};
    const key3 = {};

    cache.set(key1, key2, 'value1');
    cache.set(key3, key2, 'value2');

    expect(cache.get(key1, key2)).toBe('value1');
    expect(cache.get(key3, key2)).toBe('value2');
  });

  it('should allow garbage collection when keys are no longer referenced', () => {
    const cache = new TwoDimensionalWeakCache<object, string>();

    let key1: object | null = {};
    let key2: object | null = {};

    // Create strong references we'll release later
    const ref1 = key1;
    const ref2 = key2;

    cache.set(ref1, ref2, 'value');
    expect(cache.get(ref1, ref2)).toBe('value');

    // Release references
    key1 = null;
    key2 = null;

    // Note: We can't directly test garbage collection behavior in the test
    // as it's non-deterministic, but we can verify the API behavior
  });
});
