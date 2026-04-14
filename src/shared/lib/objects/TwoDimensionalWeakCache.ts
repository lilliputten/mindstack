/**
 * A 2D cache using WeakMap for automatic garbage collection
 * - Use WeakMap for object keys only
 * - Use strong references when needed
 */
export class TwoDimensionalWeakCache<T extends object, V> {
  private cache: WeakMap<T, WeakMap<T, V>> = new WeakMap();

  set(key1: T, key2: T, value: V): void {
    if (!this.cache.has(key1)) {
      this.cache.set(key1, new WeakMap());
    }
    this.cache.get(key1)!.set(key2, value);
  }

  get(key1: T, key2: T): V | undefined {
    return this.cache.get(key1)?.get(key2);
  }

  has(key1: T, key2: T): boolean {
    return this.cache.get(key1)?.has(key2) ?? false;
  }
}
