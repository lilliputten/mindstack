import z from 'zod';

import { GetAvailableTopicsParamsSchema, TTopicOrderBy } from '@/lib/zod-schemas';
import { threeStateSchema } from '@/components/ui/ThreeStateField';
import { isDev } from '@/config';

export const AvailableTopicsFiltersSchema = GetAvailableTopicsParamsSchema.pick({
  showOnlyMyTopics: true as const,
  orderBy: true as const,
  searchText: true as const,
  hasWorkoutStats: true as const,
  hasActiveWorkouts: true as const,
  hasQuestions: true as const,
  // searchLang: true as const,
  langCode: true as const,
  langName: true as const,
  // langCustom: true as const,
  categoryIds: true as const, // Adding categoryIds filter
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
export const orderBySelectDefault = orderBySelectOptions[0];
export type TOrderBySelectOption = (typeof orderBySelectOptions)[number];

export const orderBySelectSchema = z.enum(orderBySelectOptions);

export const filtersDataSchema = z.object({
  searchText: z.string().max(maxSearchTextLength).optional(),
  // searchLang: z.string().max(maxSearchTextLength).optional(),
  langCode: z.string().optional(),
  langName: z.string().optional(),
  langCustom: z.boolean().optional(),
  showOnlyMyTopics: AvailableTopicsFiltersSchema.shape.showOnlyMyTopics,
  hasWorkoutStats: threeStateSchema,
  hasActiveWorkouts: threeStateSchema,
  hasQuestions: threeStateSchema,
  categoryIds: GetAvailableTopicsParamsSchema.shape.categoryIds, // Adding categoryIds to filters
  orderBySelect: orderBySelectSchema.optional(),
});

export type TFiltersData = z.infer<typeof filtersDataSchema>;
export type TFiltersDataKey = keyof TFiltersData;

export const filtersDataDefaults: TFiltersData = {
  searchText: '',
  // searchLang: '',
  langCode: '',
  langName: '',
  // langCustom: false,
  showOnlyMyTopics: false,
  hasWorkoutStats: null,
  hasActiveWorkouts: null,
  hasQuestions: null,
  categoryIds: undefined, // Adding categoryIds to defaults
  orderBySelect: orderBySelectDefault,
};

export const orderByMap: Record<TOrderBySelectOption, TTopicOrderBy> = {
  // TODO: Sort by updated or created?
  byRecent: [{ updatedAt: 'desc' as const }, { name: 'asc' as const }],
  byOldest: [{ updatedAt: 'asc' as const }, { name: 'asc' as const }],
  byNameAsc: [{ name: 'desc' as const }, { updatedAt: 'desc' as const }],
  byNameDesc: [{ name: 'asc' as const }, { updatedAt: 'desc' as const }],
};

/** Don't omit filed label for short info (in the `AvailableTopicsFiltersInfo`) */
export const dontUseOnlyValueFor: TFiltersDataKey[] = ['orderBySelect'];
