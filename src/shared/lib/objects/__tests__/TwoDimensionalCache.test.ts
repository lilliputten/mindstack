import { describe, expect, it } from '@jest/globals';

import { TwoDimensionalCache } from '../TwoDimensionalCache';

// Define test types
interface User {
  id: number;
  name: string;
}

describe('TwoDimensionalCache', () => {
  it('should initialize an empty cache', () => {
    const cache = new TwoDimensionalCache<User, string>();
    expect(cache.size()).toBe(0);
  });

  it('should set and get values correctly', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };

    cache.set(user1, user2, 'friendship');
    expect(cache.get(user1, user2)).toBe('friendship');
    expect(cache.has(user1, user2)).toBe(true);
  });

  it('should return undefined for non-existent keys', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };
    const user3: User = { id: 3, name: 'Charlie' };

    expect(cache.get(user1, user2)).toBeUndefined();
    expect(cache.has(user1, user2)).toBe(false);

    // Test with one existing key and one non-existing key
    cache.set(user1, user2, 'friendship');
    expect(cache.get(user1, user3)).toBeUndefined();
    expect(cache.has(user1, user3)).toBe(false);
  });

  it('should delete values correctly', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };

    cache.set(user1, user2, 'friendship');
    expect(cache.has(user1, user2)).toBe(true);

    const deleted = cache.delete(user1, user2);
    expect(deleted).toBe(true);
    expect(cache.has(user1, user2)).toBe(false);
    expect(cache.get(user1, user2)).toBeUndefined();
  });

  it('should handle deletion of non-existent entries', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };

    const deleted = cache.delete(user1, user2);
    expect(deleted).toBe(false);
  });

  it('should clear the entire cache', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };
    const user3: User = { id: 3, name: 'Charlie' };

    cache.set(user1, user2, 'friendship');
    cache.set(user1, user3, 'colleague');
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.has(user1, user2)).toBe(false);
    expect(cache.has(user1, user3)).toBe(false);
  });

  it('should track cache size correctly', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };
    const user3: User = { id: 3, name: 'Charlie' };

    expect(cache.size()).toBe(0);

    cache.set(user1, user2, 'friendship');
    expect(cache.size()).toBe(1);

    cache.set(user1, user3, 'colleague');
    expect(cache.size()).toBe(2);

    cache.delete(user1, user2);
    expect(cache.size()).toBe(1);

    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('should handle multiple entries with same first key', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };
    const user3: User = { id: 3, name: 'Charlie' };

    cache.set(user1, user2, 'friendship');
    cache.set(user1, user3, 'colleague');

    expect(cache.get(user1, user2)).toBe('friendship');
    expect(cache.get(user1, user3)).toBe('colleague');
    expect(cache.size()).toBe(2);
  });

  it('should handle multiple entries with same second key', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };
    const user3: User = { id: 3, name: 'Charlie' };

    cache.set(user1, user2, 'friendship');
    cache.set(user3, user2, 'work colleague');

    expect(cache.get(user1, user2)).toBe('friendship');
    expect(cache.get(user3, user2)).toBe('work colleague');
    expect(cache.size()).toBe(2);
  });

  it('should return all entries correctly', () => {
    const cache = new TwoDimensionalCache<User, string>();

    const user1: User = { id: 1, name: 'Alice' };
    const user2: User = { id: 2, name: 'Bob' };
    const user3: User = { id: 3, name: 'Charlie' };

    cache.set(user1, user2, 'friendship');
    cache.set(user1, user3, 'colleague');

    const allEntries = cache.getAll();
    expect(allEntries).toHaveLength(2);

    const entry1 = allEntries.find((e) => e.key1.id === 1 && e.key2.id === 2);
    const entry2 = allEntries.find((e) => e.key1.id === 1 && e.key2.id === 3);

    expect(entry1).toBeDefined();
    expect(entry1?.value).toBe('friendship');

    expect(entry2).toBeDefined();
    expect(entry2?.value).toBe('colleague');
  });

  it('should handle primitive types as keys', () => {
    const cache = new TwoDimensionalCache<number, string>();

    cache.set(1, 2, 'first pair');
    cache.set(1, 3, 'second pair');
    cache.set(2, 3, 'third pair');

    expect(cache.get(1, 2)).toBe('first pair');
    expect(cache.get(1, 3)).toBe('second pair');
    expect(cache.get(2, 3)).toBe('third pair');
    expect(cache.size()).toBe(3);
  });
});
