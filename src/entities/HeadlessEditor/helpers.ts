import { TCmpItemBase } from './types';

/**
 * Comparator function for sorting by 'order', with these rules:
 * - Items with defined numeric 'order' come first (ascending).
 * - Items without 'order' come after, maintaining their original relative order.
 */
export function compareByOrder<T extends TCmpItemBase>(a: T, b: T): number {
  const aHasOrder = typeof a.order === 'number';
  const bHasOrder = typeof b.order === 'number';

  if (aHasOrder && bHasOrder) {
    return a.order! - b.order!;
  }
  if (aHasOrder) {
    return -1; // a comes before b
  }
  if (bHasOrder) {
    return 1; // b comes before a
  }
  return 0; // maintain original relative order
}
