import z from 'zod';

import { GetAvailableTopicsParamsSchema } from '@/lib/zod-schemas';
import { threeStateSchema } from '@/components/ui/ThreeStateField';
import { isDev } from '@/config';

export const AvailableTopicsFiltersSchema = GetAvailableTopicsParamsSchema.pick({
  showOnlyMyTopics: true as const, // z.coerce.boolean().optional(),
  orderBy: true as const, // zTopicOrderBy,
  searchText: true as const, // z.string().optional(),
  hasWorkoutStats: true as const, // z.coerce.boolean().optional(),
  hasActiveWorkouts: true as const, // z.coerce.boolean().optional(),
  hasQuestions: true as const, // z.coerce.boolean().optional(),
  // minCreatedAt: true as const, // z.coerce.date().optional(),
  // maxCreatedAt: true as const, // z.coerce.date().optional(),
  // minUpdatedAt: true as const, // z.coerce.date().optional(),
  // maxUpdatedAt: true as const, // z.coerce.date().optional(),
  searchLang: true as const, // z.string().optional(),
});
export type TAvailableTopicsFiltersParams = z.infer<typeof AvailableTopicsFiltersSchema>;

/*
 * These fields should have 3 states: undefined (null), true and false. Use `ThreeStateField` form field.
 * - hasWorkoutStats
 * - hasActiveWorkouts
 * - hasQuestions
 */

export const maxSearchTextLength = isDev ? 10 : 50;

/** Filters data schema. It should be converted to `AvailableTopicsFiltersSchema` schema to apply filters. */
export const filtersDataSchema = z.object({
  // searchText: AvailableTopicsFiltersSchema.shape.searchText, // z.string().max(maxSearchTextLength),
  searchText: z.string().max(maxSearchTextLength).optional(),
  searchLang: z.string().max(maxSearchTextLength).optional(),
  showOnlyMyTopics: AvailableTopicsFiltersSchema.shape.showOnlyMyTopics,
  hasWorkoutStats: threeStateSchema, // AvailableTopicsFiltersSchema.shape.hasWorkoutStats,
  hasActiveWorkouts: threeStateSchema,
  hasQuestions: threeStateSchema,
  // isPublic: z.boolean().optional(),
  // keywords: z.string().optional(),
  // answersCountMax: z.union([z.string().optional(), z.number()]),
});
/*
 * // DEBUG: Log the values being validated
 * .superRefine((data, ctx) => {
 *   console.log('[AvailableTopicsFiltersTypes:filtersDataSchema:superRefine] DEBUG', {
 *     hasWorkoutStats: data.hasWorkoutStats,
 *     data,
 *     ctx,
 *   });
 *   debugger;
 * })
 */

export type TFiltersData = z.infer<typeof filtersDataSchema>;
export type TFiltersDataKey = keyof TFiltersData;

export const filtersDataDefaults: TFiltersData = {
  // Default filter values
  searchText: '',
  searchLang: '',
  showOnlyMyTopics: false, // Take from settings
  hasWorkoutStats: null,
  hasActiveWorkouts: null,
  hasQuestions: null,
  // isPublic: true,
};

// Predefined text values (might be translated)

export const fieldUnionStrings = {
  true: 'Yes',
  false: 'No',
  null: 'Undefined',
};

export const specifcFieldUnionStrings: Partial<Record<TFiltersDataKey, Record<string, string>>> = {
  hasWorkoutStats: {
    true: 'With Statistics',
    false: 'Without Statistics',
  },
  hasActiveWorkouts: {
    true: 'With Active Workouts',
    false: 'Without Active Workouts',
  },
  hasQuestions: {
    true: 'With Questions',
    false: 'Without Questions',
  },
  showOnlyMyTopics: {
    true: 'Only My Topics',
  },
};

export const filterFieldNames: Record<TFiltersDataKey, string> = {
  searchText: 'Search for',
  searchLang: 'Language',
  showOnlyMyTopics: 'Only My',
  hasWorkoutStats: 'Statistics',
  hasActiveWorkouts: 'Active Workouts',
  hasQuestions: 'Questions',
};
