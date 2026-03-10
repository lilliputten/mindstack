import { compareDates } from '@/lib/helpers';

import { newItemIdPrefix } from './constants';
import { TCmpItemBase, TCmpItemId } from './types';

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

/** Generate an id for the new item, based on the deleted and actual ids */
export function getUniqueIdForSet(usedIds: Set<TCmpItemId>, prefix = newItemIdPrefix) {
  let count = 0;
  let id: string;
  do {
    // ...find the first avaiable id...
    id = `${prefix}${++count}`;
  } while (usedIds.has(id));
  return id;
}

export type TDateOrderable = { createdAt?: Date; updatedAt?: Date };
export function reorderByDate<T extends TDateOrderable>(items: T[], _lang: string) {
  const itemDates = new WeakMap(items.map((item) => [item, item.createdAt || item.updatedAt]));
  const reorderedItems = [...items].sort((aIt, bIt) => {
    const a = itemDates.get(aIt);
    const b = itemDates.get(bIt);
    return compareDates(a, b);
  });
  return reorderedItems;
}
