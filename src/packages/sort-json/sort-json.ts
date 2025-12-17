/* eslint-disable @typescript-eslint/no-explicit-any */
export type SortOrder = 'asc' | 'desc';
export type PrimitivePosition = 'first' | 'last';

export interface SortOptions {
  order?: SortOrder;
  primitivePosition?: PrimitivePosition;
  caseSensitive?: boolean;
  numericSort?: boolean;
}

const isPrimitive = (value: any): boolean => {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
};

const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export function stringCompare(a: string, b: string, caseSensitive: boolean): number {
  /* NOTE: This doesn't work
   * return a.localeCompare(b, undefined, {
   *   sensitivity: caseSensitive ? 'case' : 'base',
   * });
   */

  if (!caseSensitive) {
    a = a.toLowerCase();
    b = b.toLowerCase();
  }
  // Case-sensitive comparison: A=65, B=66, a=97, b=98 -> A, B, a, b
  let res = 0;
  if (a < b) res = -1;
  if (a > b) res = 1;
  return res;
}

export function sortJson(data: any, options: SortOptions = {}): any {
  const {
    order = 'asc',
    primitivePosition = 'first',
    caseSensitive = false,
    numericSort = false,
  } = options;

  if (Array.isArray(data)) {
    return data.map((item) => sortJson(item, options));
  }

  if (!isObject(data)) {
    return data;
  }

  // Separate primitive and non-primitive values
  const entries = Object.entries(data);
  const primitiveEntries: [string, any][] = [];
  const nonPrimitiveEntries: [string, any][] = [];

  entries.forEach(([key, value]) => {
    if (isPrimitive(value)) {
      primitiveEntries.push([key, value]);
    } else {
      nonPrimitiveEntries.push([key, value]);
    }
  });

  // Sort each group
  const sortEntries = (entries: [string, any][]) => {
    return entries.sort(([keyA, valueA], [keyB, valueB]) => {
      // First compare keys
      let keyComparison = 0;

      if (numericSort && !isNaN(Number(keyA)) && !isNaN(Number(keyB))) {
        keyComparison = Number(keyA) - Number(keyB);
      } else {
        keyComparison = stringCompare(keyA, keyB, caseSensitive);
      }

      if (keyComparison !== 0) {
        return order === 'asc' ? keyComparison : -keyComparison;
      }

      // If keys are equal, compare values
      if (isPrimitive(valueA) && isPrimitive(valueB)) {
        let valueComparison = 0;

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          valueComparison = valueA - valueB;
        } else {
          const a = String(valueA);
          const b = String(valueB);
          valueComparison = stringCompare(a, b, caseSensitive);
        }

        return order === 'asc' ? valueComparison : -valueComparison;
      }

      return 0;
    });
  };

  const sortedPrimitives = sortEntries(primitiveEntries);
  const sortedNonPrimitives = sortEntries(nonPrimitiveEntries);

  // Combine based on primitive position
  const combinedEntries =
    primitivePosition === 'first'
      ? [...sortedPrimitives, ...sortedNonPrimitives]
      : [...sortedNonPrimitives, ...sortedPrimitives];

  // Create new sorted object
  const sortedObject: any = {};
  combinedEntries.forEach(([key, value]) => {
    sortedObject[key] = isObject(value) || Array.isArray(value) ? sortJson(value, options) : value;
  });

  return sortedObject;
}
