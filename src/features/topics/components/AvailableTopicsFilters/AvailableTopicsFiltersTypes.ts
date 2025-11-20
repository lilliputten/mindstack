import { GetAvailableTopicsParamsSchema } from '@/lib/zod-schemas';

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
