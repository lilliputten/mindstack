import z from 'zod';

import { getBaseField } from '@/lib/helpers/zod';
import { TTranslator } from '@/i18n';

import {
  fieldUnionStrings,
  filterFieldNames,
  specifcFieldUnionStrings,
} from './WorkoutsFiltersTexts';
import {
  dontUseOnlyValueFor,
  filtersDataSchema,
  TFiltersData,
  TFiltersDataKey,
} from './WorkoutsFiltersTypes';

export type { TFiltersData, TFiltersDataKey };

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
