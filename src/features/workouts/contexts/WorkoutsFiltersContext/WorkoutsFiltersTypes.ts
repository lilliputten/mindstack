import z from 'zod';

import { isDev } from '@/config';
import { GetAvailableWorkoutsParamsSchema } from '@/features/workouts/types';

export const AvailableWorkoutsFiltersSchema = GetAvailableWorkoutsParamsSchema.pick({
  adminMode: true as const,
  orderBy: true as const,
  searchText: true,
  hasWorkoutStats: true,
  hasActiveWorkouts: true,
  langCode: true,
  langName: true,
  searchLang: true,
  minStarted: true,
  maxStarted: true,
  minFinished: true,
  maxFinished: true,
  categoryIds: true as const,
});

export type TAvailableWorkoutsFiltersParams = z.infer<typeof AvailableWorkoutsFiltersSchema>;

export const maxSearchTextLength = isDev ? 10 : 50;

// prettier-ignore
export const filtersDataSchema = z.object({
  adminMode: z.boolean().optional().describe('Admin-only mode to see all workouts regardless of ownership (verified server-side)'),
  orderBy: z.union([z.any().array(), z.any()]).optional().describe('Sorting criteria (field + direction) for workout results'),
  searchText: z.string().max(maxSearchTextLength).optional().describe('Search text to match against topic name, description or keywords'),
  hasWorkoutStats: z.boolean().optional().describe('Filter workouts by whether they have stats recorded'),
  hasActiveWorkouts: z.boolean().optional().describe('Filter workouts by active status (started but not finished)'),
  langCode: z.string().optional().describe('Exact 2-letter language code filter (e.g., "en", "es")'),
  langName: z.string().optional().describe('Exact language name filter (e.g., "English", "Spanish")'),
  searchLang: z.string().optional().describe('Free-form parameter to search by language - matches code exactly for 2-char inputs, or does partial name search for longer inputs'),
  minStarted: z.coerce.date().optional().describe('Earliest workout start date to include'),
  maxStarted: z.coerce.date().optional().describe('Latest workout start date to include'),
  minFinished: z.coerce.date().optional().describe('Earliest workout finish date to include'),
  maxFinished: z.coerce.date().optional().describe('Latest workout finish date to include'),
  categoryIds: z.array(z.string()).optional().describe('Filter by specific category IDs'),
});

export type TFiltersData = z.infer<typeof filtersDataSchema>;
export type TFiltersDataKey = keyof TFiltersData;

export const filtersDataDefaults: TFiltersData = {
  adminMode: false,
  orderBy: undefined,
  searchText: '',
  hasWorkoutStats: undefined,
  hasActiveWorkouts: undefined,
  langCode: undefined,
  langName: undefined,
  searchLang: undefined,
  minStarted: undefined,
  maxStarted: undefined,
  minFinished: undefined,
  maxFinished: undefined,
  categoryIds: undefined,
};

/** Don't omit field label for short info */
export const dontUseOnlyValueFor: TFiltersDataKey[] = [];
