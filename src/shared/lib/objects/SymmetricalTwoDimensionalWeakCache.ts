/**
 * A 2D cache using WeakMap for automatic garbage collection
 * - Use WeakMap for object keys only
 * - Use strong references when needed
 */
export class SymmetricalTwoDimensionalWeakCache<T extends object, V> {
  private cache: WeakMap<T, WeakMap<T, V>> = new WeakMap();

  set(key1: T, key2: T, value: V): void {
    if (!this.cache.has(key1)) {
      this.cache.set(key1, new WeakMap());
    }
    this.cache.get(key1)!.set(key2, value);
    // Approach 1 may be here: To set mirrored data (set twice, get once)
  }

  get(key1: T, key2: T): V | undefined {
    // Approach 2: Attempt symmetrical data on the original keys orders fail
    return this.cache.get(key1)?.get(key2) || this.cache.get(key2)?.get(key1);
  }

  has(key1: T, key2: T): boolean {
    // Approach 2: Attempt symmetrical data on the original keys orders fail
    return this.cache.get(key1)?.has(key2) ?? this.cache.get(key2)?.has(key1) ?? false;
  }
}
