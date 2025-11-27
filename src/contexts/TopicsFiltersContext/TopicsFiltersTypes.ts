import z from 'zod';

import { GetAvailableTopicsParamsSchema } from '@/lib/zod-schemas';
import { threeStateSchema } from '@/components/ui/ThreeStateField';
import { isDev } from '@/config';

export const AvailableTopicsFiltersSchema = GetAvailableTopicsParamsSchema.pick({
  showOnlyMyTopics: true as const,
  orderBy: true as const,
  searchText: true as const,
  hasWorkoutStats: true as const,
  hasActiveWorkouts: true as const,
  hasQuestions: true as const,
  searchLang: true as const,
});
export type TAvailableTopicsFiltersParams = z.infer<typeof AvailableTopicsFiltersSchema>;

export const maxSearchTextLength = isDev ? 10 : 50;

export const orderBySelectOptions = [
  // Sort options
  'byRecent',
  'byOldest',
  'byNameAsc',
  'byNameDesc',
] as const;
export const orderBySelectDefault = orderBySelectOptions[0]

export const orderBySelectSchema = z.enum(orderBySelectOptions);

export const filtersDataSchema = z.object({
  searchText: z.string().max(maxSearchTextLength).optional(),
  searchLang: z.string().max(maxSearchTextLength).optional(),
  showOnlyMyTopics: AvailableTopicsFiltersSchema.shape.showOnlyMyTopics,
  hasWorkoutStats: threeStateSchema,
  hasActiveWorkouts: threeStateSchema,
  hasQuestions: threeStateSchema,
  orderBySelect: orderBySelectSchema.optional(),
});

export type TFiltersData = z.infer<typeof filtersDataSchema>;
export type TFiltersDataKey = keyof TFiltersData;

export const filtersDataDefaults: TFiltersData = {
  searchText: '',
  searchLang: '',
  showOnlyMyTopics: false,
  hasWorkoutStats: null,
  hasActiveWorkouts: null,
  hasQuestions: null,
  orderBySelect: orderBySelectDefault,
};

export const orderByMap = {
  byRecent: [{ updatedAt: 'desc' as const }, { name: 'asc' as const }],
  byOldest: [{ updatedAt: 'asc' as const }, { name: 'asc' as const }],
  byNameAsc: [{ name: 'asc' as const }, { updatedAt: 'desc' as const }],
  byNameDesc: [{ name: 'desc' as const }, { updatedAt: 'desc' as const }],
};

/** Don't omit filed label for short info (in the `AvailableTopicsFiltersInfo`) */
export const dontUseOnlyValueFor: TFiltersDataKey[] = ['orderBySelect'];
