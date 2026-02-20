import z from 'zod';

import { UserTopicWorkoutOrderByWithRelationInputSchema } from '@/generated/prisma';

import { threeStateSchema } from '@/components/ui/ThreeStateField';
import { isDev } from '@/config';
import { GetAvailableWorkoutsParamsSchema } from '@/features/workouts/types';

export const AvailableWorkoutsFiltersSchema = GetAvailableWorkoutsParamsSchema.pick({
  adminMode: true as const,
  orderBy: true as const,
  searchText: true as const,
  hasWorkoutStats: true as const,
  hasActiveWorkouts: true as const,
  langCode: true as const,
  langName: true as const,
  // searchLang: true as const,
  minStarted: true as const,
  maxStarted: true as const,
  minFinished: true as const,
  maxFinished: true as const,
  categoryIds: true as const,
});

export type TAvailableWorkoutsFiltersParams = z.infer<typeof AvailableWorkoutsFiltersSchema>;

export const maxSearchTextLength = isDev ? 10 : 50;

export const orderBySelectOptions = [
  'byRecent',
  'byOldest',
  'byStartedRecent',
  'byStartedOldest',
  'byFinishedRecent',
  'byFinishedOldest',
  'byNameAsc',
  'byNameDesc',
] as const;
export const orderBySelectDefault = orderBySelectOptions[0];
export type TOrderBySelectOption = (typeof orderBySelectOptions)[number];

export const orderBySelectSchema = z.enum(orderBySelectOptions);

export const zWorkoutOrderBy = z
  .union([
    UserTopicWorkoutOrderByWithRelationInputSchema.array(),
    UserTopicWorkoutOrderByWithRelationInputSchema,
  ])
  .optional();
export type TWorkoutOrderBy = z.infer<typeof zWorkoutOrderBy>;

/* Old approach for `TWorkoutOrderBy`
 * export const zWorkoutOrderBy = z.union([z.any().array(), z.any()]);
 * export type TWorkoutOrderBy = z.infer<typeof zWorkoutOrderBy>;
 */

export const orderByMap: Record<TOrderBySelectOption, TWorkoutOrderBy[]> = {
  byRecent: [{ updatedAt: 'desc' }],
  byOldest: [{ updatedAt: 'asc' }],
  byStartedRecent: [{ startedAt: 'desc' }],
  byStartedOldest: [{ startedAt: 'asc' }],
  byFinishedRecent: [{ finishedAt: 'desc' }],
  byFinishedOldest: [{ finishedAt: 'asc' }],
  byNameAsc: [{ topic: { name: 'asc' } }, { updatedAt: 'desc' }],
  byNameDesc: [{ topic: { name: 'desc' } }, { updatedAt: 'desc' }],
};

// prettier-ignore
export const filtersDataSchema = z.object({
  adminMode: z.boolean().optional().describe('Admin-only mode to see all workouts regardless of ownership (verified server-side)'),
  orderBy: z.union([z.any().array(), z.any()]).optional().describe('Sorting criteria (field + direction) for workout results'),
  orderBySelect: orderBySelectSchema.optional().describe('User-friendly sorting option that maps to orderBy'),
  searchText: z.string().max(maxSearchTextLength).optional().describe('Search text to match against topic name, description or keywords'),
  hasWorkoutStats: threeStateSchema.describe('Filter workouts by whether they have stats recorded (null = ignore, true = with, false = without)'),
  hasActiveWorkouts: threeStateSchema.describe('Filter workouts by active status (started but not finished) (null = ignore, true = with, false = without)'),
  // searchLang: z.string().optional().describe('Free-form parameter to search by language - matches code exactly for 2-char inputs, or does partial name search for longer inputs'),
  langCode: z.string().optional().describe('Exact 2-letter language code filter (e.g., "en", "es")'),
  langName: z.string().optional().describe('Exact language name filter (e.g., "English", "Spanish")'),
  langCustom: z.boolean().optional(),
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
  orderBySelect: undefined,
  searchText: '',
  hasWorkoutStats: null,
  hasActiveWorkouts: null,
  langCode: undefined,
  langName: undefined,
  // searchLang: undefined,
  minStarted: undefined,
  maxStarted: undefined,
  minFinished: undefined,
  maxFinished: undefined,
  categoryIds: undefined,
};

/** Don't omit field label for short info */
export const dontUseOnlyValueFor: TFiltersDataKey[] = ['orderBySelect'];
