type TUnknownObject = Record<string, unknown>;

/** Shallow operation: Removes all empty arrays from the object. Returns changed copy. */
export function removeEmptyArrays<T extends TUnknownObject>(obj: T) {
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key]) && !obj[key].length) {
      delete obj[key];
    }
  });
  return obj;
}

/** Shallow operation: Removes all empty strings from the object. Returns changed copy. */
export function removeEmptyStrings<T extends TUnknownObject>(obj: T) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === '') {
      delete obj[key];
    }
  });
  return obj;
}

/** Shallow operation: Removes all falsy values from the object. Returns changed copy. */
export function removeFalsyValues<T extends TUnknownObject>(obj: T) {
  Object.keys(obj).forEach((key) => {
    if (!obj[key]) {
      delete obj[key];
    }
  });
  return obj;
}

/** Shallow operation: Removes null or undefined values from the object. Returns changed copy. */
export function removeNullUndefinedValues<T extends TUnknownObject>(obj: T) {
  const result: T = { ...obj };
  Object.keys(result).forEach((key) => {
    if (result[key] === null || result[key] === undefined) {
      delete result[key];
    }
  });
  return result;
}

/** Prepares an object to lossy compare (via `deepCompare` or whatever. Returns changed copy.
 * Removes on the first level (shallow):
 * - Nullable entries (null or undefined).
 * - Empty string ('').
 * - Empty arrays.
 */
export function prepareObjectToLossyCompare<T extends TUnknownObject>(obj: T) {
  return removeEmptyArrays(removeEmptyStrings(removeNullUndefinedValues(obj)));
}

/** Only for debugging purposes */
export function getObjectsDiff<T extends TUnknownObject>(obj1?: T, obj2?: T): Partial<T> {
  const diff: Partial<T> = {};

  if (!obj1 || !obj2) {
    return obj1 || obj2 || {};
  }

  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (diff as any)[key] = undefined; // Key deleted
      } else if (
        typeof obj1[key] === 'object' &&
        obj1[key] !== null &&
        typeof obj2[key] === 'object' &&
        obj2[key] !== null
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nestedDiff = getObjectsDiff(obj1[key] as any, obj2[key] as any);
        if (Object.keys(nestedDiff).length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (diff as any)[key] = nestedDiff;
        }
      } else if (obj1[key] !== obj2[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (diff as any)[key] = obj2[key]; // Value changed
      }
    }
  }

  for (const key in obj2) {
    if (
      Object.prototype.hasOwnProperty.call(obj2, key) &&
      !Object.prototype.hasOwnProperty.call(obj1, key)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (diff as any)[key] = obj2[key]; // Key added
    }
  }

  return diff;
}

type TDeepCompareOptions = {
  noNulls?: boolean;
};

/** Deeply compares two objects for equality with customizable options.
 *
 * @template T - The type of objects being compared, extending TUnknownObject
 * @param obj1 - The first object to compare
 * @param obj2 - The second object to compare
 * @param [opts] - Configuration options for the comparison
 * @param [opts.noNulls] - Don't count nullable (null, undefines) entries
 * @returns True if the objects are deeply equal, false otherwise
 */
export function deepCompare<T extends TUnknownObject>(
  obj1: T | null | undefined,
  obj2: T | null | undefined,
  opts: TDeepCompareOptions = {},
): boolean {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (opts.noNulls) {
    if (!Array.isArray(obj1)) {
      obj1 = removeNullUndefinedValues(obj1);
    }
    if (!Array.isArray(obj2)) {
      obj2 = removeNullUndefinedValues(obj2);
    }
  }

  const keys1 = Object.keys(obj1) as (keyof T)[];
  const keys2 = Object.keys(obj2) as (keyof T)[];

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepCompare(obj1[key] as TUnknownObject, obj2[key] as TUnknownObject, opts)) return false;
  }

  return true;
}
