import z from 'zod';

import { GetAvailableTopicsParamsSchema } from '@/lib/zod-schemas';
import { threeStateSchema } from '@/components/ui/ThreeStateField';

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

/*
 * These fields should have 3 states: undefined (null), true and false. Use `ThreeStateField` form field.
 * - hasWorkoutStats
 * - hasActiveWorkouts
 * - hasQuestions
 */

const maxSearchTextLength = 50;

/** Filters data schema. It should be converted to `AvailableTopicsFiltersSchema` schema to apply filters. */
export const filtersDataSchema = z.object({
  searchText: z.string().max(maxSearchTextLength),
  hasWorkoutStats: threeStateSchema,
  // isPublic: z.boolean().optional(),
  // keywords: z.string().optional(),
  // answersCountMax: z.union([z.string().optional(), z.number()]),
});

export type TFiltersData = z.infer<typeof filtersDataSchema>;

export const filtersDataDefaults: TFiltersData = {
  // Default filter calues
  searchText: '',
  hasWorkoutStats: null,
};
