/**
 * A 2-dimensional cache that uses a pair of keys of type T
 * to store and retrieve cached values.
 */
export class TwoDimensionalCache<T, V> {
  private cache: Map<T, Map<T, V>> = new Map();

  /**
   * Set a value in the cache with two keys
   * @param key1 - First key
   * @param key2 - Second key
   * @param value - Value to cache
   */
  set(key1: T, key2: T, value: V): void {
    if (!this.cache.has(key1)) {
      this.cache.set(key1, new Map());
    }
    this.cache.get(key1)!.set(key2, value);
  }

  /**
   * Get a value from the cache using two keys
   * @param key1 - First key
   * @param key2 - Second key
   * @returns The cached value or undefined if not found
   */
  get(key1: T, key2: T): V | undefined {
    return this.cache.get(key1)?.get(key2);
  }

  /**
   * Check if a value exists in the cache
   * @param key1 - First key
   * @param key2 - Second key
   * @returns True if the value exists
   */
  has(key1: T, key2: T): boolean {
    return this.cache.get(key1)?.has(key2) ?? false;
  }

  /**
   * Delete a value from the cache
   * @param key1 - First key
   * @param key2 - Second key
   * @returns True if the value was deleted
   */
  delete(key1: T, key2: T): boolean {
    const innerMap = this.cache.get(key1);
    if (!innerMap) return false;
    return innerMap.delete(key2);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the size of the cache
   * @returns Total number of cached entries
   */
  size(): number {
    let count = 0;
    for (const innerMap of this.cache.values()) {
      count += innerMap.size;
    }
    return count;
  }

  /**
   * Get all values in the cache
   */
  getAll(): Array<{ key1: T; key2: T; value: V }> {
    const result: Array<{ key1: T; key2: T; value: V }> = [];
    for (const [key1, innerMap] of this.cache.entries()) {
      for (const [key2, value] of innerMap.entries()) {
        result.push({ key1, key2, value });
      }
    }
    return result;
  }
}
