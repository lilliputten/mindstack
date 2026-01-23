import z from 'zod';

import { getBaseField } from '@/lib/helpers/zod';
import { TTranslator } from '@/i18n';
import { TWorkoutData } from '@/features/workouts/types';

import {
  fieldUnionStrings,
  filterFieldNames,
  specifcFieldUnionStrings,
} from './WorkoutsFiltersTexts';
import {
  dontUseOnlyValueFor,
  filtersDataSchema,
  TAvailableWorkoutsFiltersParams,
  TFiltersData,
  TFiltersDataKey,
} from './WorkoutsFiltersTypes';

/** Extended filter params type that includes orderBySelect for local filtering */
type TLocalWorkoutFilters = TAvailableWorkoutsFiltersParams & {
  orderBySelect?: string;
};

export type { TFiltersData, TFiltersDataKey };

/**
 * Extended workout data type that includes fields stored in IndexedDB
 */
export type TIndexedDBWorkoutData = TWorkoutData & {
  topicId: string;
  updatedAt: Date;
  createdAt: Date;
};

export function getFilterUnionString(value: unknown, t?: TTranslator) {
  const key = value ? (String(value) as keyof typeof fieldUnionStrings) : 'null';
  const str = fieldUnionStrings[key] || fieldUnionStrings.null;
  if (t && str) {
    return t(str);
  }
  return str;
}

export function getFilterFieldName(id: TFiltersDataKey, t?: TTranslator) {
  const key = id ? (String(id) as keyof typeof filterFieldNames) : '';
  const str = key ? filterFieldNames[key] : id;
  if (t && str) {
    return t(str);
  }
  return str;
}

interface TFiltersDataValueStringOptions {
  filtersData?: TFiltersData;
  specific?: boolean;
  t?: TTranslator;
}

export function getFiltersDataRawValueString(
  fieldId: TFiltersDataKey,
  value: unknown,
  opts: TFiltersDataValueStringOptions,
) {
  const { specific, t } = opts;
  const origValue = String(value);
  const shape = filtersDataSchema.shape;
  const field = shape[fieldId];
  const baseField = getBaseField(field);
  const isBoolean = baseField instanceof z.ZodBoolean;
  const isUnion = baseField instanceof z.ZodUnion;
  const isEnum = baseField instanceof z.ZodEnum;
  let strValue = origValue;
  let showOnlyValue = false;
  if (isBoolean || isUnion || isEnum) {
    let unionValue: string | undefined;
    if (specific) {
      const specificData = specifcFieldUnionStrings[fieldId];
      unionValue = specificData && (specificData[strValue] || specificData[origValue]);
      if (unionValue) {
        if (t && unionValue) {
          unionValue = t(unionValue);
        }
        if (!dontUseOnlyValueFor.includes(fieldId)) {
          showOnlyValue = true;
        }
      }
    }
    if (!unionValue) {
      unionValue = getFilterUnionString(strValue, t);
    }
    if (unionValue) {
      strValue = unionValue;
    }
  }
  return { showOnlyValue, value: strValue };
}

export function getFiltersLabelValueString(
  fieldId: TFiltersDataKey,
  value: unknown,
  t?: TTranslator,
) {
  return getFiltersDataRawValueString(fieldId, value, { specific: true, t }).value;
}

export function getFiltersDataValueString(
  fieldId: TFiltersDataKey,
  opts: TFiltersDataValueStringOptions,
) {
  const { filtersData } = opts;
  const value = filtersData?.[fieldId];
  return getFiltersDataRawValueString(fieldId, value, opts);
}

/**
 * Extracts the IDs of all active filters from the provided filters data.
 *
 * A filter is considered active if:
 * - Its value is not null or undefined
 * - For string values, the string is not empty or whitespace-only
 * - For boolean values, the value is true
 *
 * @param filtersData - The filters data object containing filter values
 * @returns An array of active filter IDs, or empty array if no filters are active
 */
export function getActiveFilterIds(filtersData?: TFiltersData) {
  if (!filtersData) {
    return [];
  }
  const activeItems = Object.entries(filtersData)
    .map(([id, value]) => {
      const fieldId = id as TFiltersDataKey;
      if (value == null) {
        return null;
      }
      if (typeof value === 'string' && !value.trim()) {
        return null;
      }
      /* // NOTE: Date filtering is not used yet
       * if (value instanceof Date) {
       *   // Dates are considered active if they exist
       *   return id;
       * }
       */
      const shape = filtersDataSchema.shape;
      const field = shape[fieldId];
      const baseField = getBaseField(field);
      const isBoolean = baseField instanceof z.ZodBoolean;
      if (isBoolean && !value) {
        return null;
      }
      return id;
    })
    .filter(Boolean) as TFiltersDataKey[];
  return activeItems;
}

/**
 * Filter workouts stored in IndexedDB based on filter parameters.
 * This function is used when no authenticated user is available and we need
 * to filter workouts locally instead of using the API.
 *
 * @param workouts - Array of workouts from IndexedDB (with topicId field)
 * @param filters - Filter parameters to apply
 * @returns Filtered array of workouts
 */
export function filterLocalWorkouts(
  workouts: Array<TIndexedDBWorkoutData>,
  filters: TLocalWorkoutFilters,
): Array<TIndexedDBWorkoutData> {
  let filteredWorkouts = workouts;

  console.log('[WorkoutsFiltersHelpers:filterLocalWorkouts]', {
    filters,
    workouts,
  });

  /* // TODO: For searchText & searchLang (or langCode or langName) topic data is required
   * // Filter by search text (matches against topicId since we don't have topic name in IndexedDB)
   * if (filters.searchText && filters.searchText.trim()) {
   *   const searchLower = filters.searchText.toLowerCase().trim();
   *   filteredWorkouts = filteredWorkouts.filter((workout) => {
   *     // Search in topicId (as a fallback since topic data is not stored in IndexedDB)
   *     return workout.topicId.toLowerCase().includes(searchLower);
   *   });
   * }
   */

  // Filter by hasWorkoutStats (boolean with null = ignore)
  if (filters.hasWorkoutStats != undefined) {
    // Note: We can't actually filter by workoutStats in IndexedDB since they're not stored
    // This is a placeholder for future implementation when workoutStats are stored locally
    // For now, we just accept all workouts when this filter is active
  }

  // Filter by hasActiveWorkouts (boolean with null = ignore)
  if (filters.hasActiveWorkouts != undefined) {
    debugger;
    if (filters.hasActiveWorkouts) {
      // Filter for active workouts (started but not finished)
      filteredWorkouts = filteredWorkouts.filter((workout) => workout.started && !workout.finished);
    } else {
      // Filter for inactive workouts (not started or finished)
      filteredWorkouts = filteredWorkouts.filter((workout) => !workout.started || workout.finished);
    }
  }

  // Filter by date ranges
  if (filters.minStarted) {
    const minStarted = new Date(filters.minStarted);
    filteredWorkouts = filteredWorkouts.filter(
      (workout) => workout.startedAt && new Date(workout.startedAt) >= minStarted,
    );
  }

  if (filters.maxStarted) {
    const maxStarted = new Date(filters.maxStarted);
    filteredWorkouts = filteredWorkouts.filter(
      (workout) => workout.startedAt && new Date(workout.startedAt) <= maxStarted,
    );
  }

  if (filters.minFinished) {
    const minFinished = new Date(filters.minFinished);
    filteredWorkouts = filteredWorkouts.filter(
      (workout) => workout.finishedAt && new Date(workout.finishedAt) >= minFinished,
    );
  }

  if (filters.maxFinished) {
    const maxFinished = new Date(filters.maxFinished);
    filteredWorkouts = filteredWorkouts.filter(
      (workout) => workout.finishedAt && new Date(workout.finishedAt) <= maxFinished,
    );
  }

  // Apply sorting
  // Note: orderBySelect is converted to orderBy format internally, we check if orderBySelect was used
  const orderBySelect = filters.orderBySelect || filters.orderBy;
  if (orderBySelect) {
    filteredWorkouts = sortWorkoutsByOption(filteredWorkouts, orderBySelect);
  }

  return filteredWorkouts;
}

/**
 * Sort workouts based on the selected order option
 *
 * @param workouts - Array of workouts to sort
 * @param orderBySelect - The order option to apply
 * @returns Sorted array of workouts
 */
function sortWorkoutsByOption(
  workouts: Array<TIndexedDBWorkoutData>,
  orderBySelect: string,
): Array<TIndexedDBWorkoutData> {
  const sorted = [...workouts];

  switch (orderBySelect) {
    case 'byRecent':
      sorted.sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        return dateB - dateA;
      });
      break;

    case 'byOldest':
      sorted.sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        return dateA - dateB;
      });
      break;

    case 'byStartedRecent':
      sorted.sort((a, b) => {
        const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return dateB - dateA;
      });
      break;

    case 'byStartedOldest':
      sorted.sort((a, b) => {
        const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return dateA - dateB;
      });
      break;

    case 'byFinishedRecent':
      sorted.sort((a, b) => {
        const dateA = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
        const dateB = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
        // Put null values at the end
        if (dateA === 0 && dateB === 0) return 0;
        if (dateA === 0) return 1;
        if (dateB === 0) return -1;
        return dateB - dateA;
      });
      break;

    case 'byFinishedOldest':
      sorted.sort((a, b) => {
        const dateA = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
        const dateB = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
        // Put null values at the end
        if (dateA === 0 && dateB === 0) return 0;
        if (dateA === 0) return 1;
        if (dateB === 0) return -1;
        return dateA - dateB;
      });
      break;

    case 'byNameAsc':
      sorted.sort((a, b) => {
        // Sort by topicId as a fallback since topic name is not stored in IndexedDB
        return a.topicId.localeCompare(b.topicId);
      });
      break;

    case 'byNameDesc':
      sorted.sort((a, b) => {
        // Sort by topicId as a fallback since topic name is not stored in IndexedDB
        return b.topicId.localeCompare(a.topicId);
      });
      break;

    default:
      // No sorting for unknown options
      break;
  }

  return sorted;
}
