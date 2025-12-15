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
        const a = caseSensitive ? keyA : keyA.toLowerCase();
        const b = caseSensitive ? keyB : keyB.toLowerCase();
        keyComparison = a.localeCompare(b);
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
          const aCompare = caseSensitive ? a : a.toLowerCase();
          const bCompare = caseSensitive ? b : b.toLowerCase();
          valueComparison = aCompare.localeCompare(bCompare);
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
