import z from 'zod';

import { CategoryOrderByWithRelationInputSchema } from '@/generated/prisma';

import { threeStateSchema } from '@/components/ui/ThreeStateField';
import { isDev } from '@/config';
import { GetAvailableCategoriesParamsSchema } from '@/features/categories/types/Categories';

export const AvailableCategoriesFiltersSchema = GetAvailableCategoriesParamsSchema.pick({
  orderBy: true as const,
  searchText: true as const,
  searchLang: true as const,
  status: true as const,
  hasImage: true as const,
  hasTopics: true as const,
  minCreatedAt: true as const,
  maxCreatedAt: true as const,
  minUpdatedAt: true as const,
  maxUpdatedAt: true as const,
});
export type TAvailableCategoriesFiltersParams = z.infer<typeof AvailableCategoriesFiltersSchema>;

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

export type TCategoryOrderBy = z.infer<typeof CategoryOrderByWithRelationInputSchema>;

export const filtersDataSchema = z.object({
  searchText: z.string().max(maxSearchTextLength).optional(),
  searchLang: z.string().max(maxSearchTextLength).optional(),
  status: z.enum(['PUBLIC', 'SUGGESTED', 'HIDDEN']).optional(),
  hasImage: threeStateSchema,
  hasTopics: threeStateSchema,
  orderBySelect: orderBySelectSchema.optional(),
  /* // NOTE: Date filtering is not used yet
   * minCreatedAt: z.coerce.date().optional(),
   * maxCreatedAt: z.coerce.date().optional(),
   * minUpdatedAt: z.coerce.date().optional(),
   * maxUpdatedAt: z.coerce.date().optional(),
   */
});

export type TFiltersData = z.infer<typeof filtersDataSchema>;
export type TFiltersDataKey = keyof TFiltersData;

export const filtersDataDefaults: TFiltersData = {
  searchText: '',
  searchLang: '',
  status: undefined,
  hasImage: null,
  hasTopics: null,
  orderBySelect: orderBySelectDefault,
  /* // NOTE: Date filtering is not used yet
   * minCreatedAt: undefined,
   * maxCreatedAt: undefined,
   * minUpdatedAt: undefined,
   * maxUpdatedAt: undefined,
   */
};

// Note: Categories don't have a direct name field, they have translations
// For name-based sorting, we'll use updatedAt/createdAt as fallback
// In the future, this could be enhanced to sort by translation name
export const orderByMap: Record<TOrderBySelectOption, TCategoryOrderBy> = {
  byRecent: { updatedAt: 'desc' },
  byOldest: { createdAt: 'asc' },
  byNameAsc: { updatedAt: 'desc' }, // TODO: Sort by translation name when supported
  byNameDesc: { updatedAt: 'desc' }, // TODO: Sort by translation name when supported
};

/** Don't omit field label for short info (in the `AvailableCategoriesFiltersInfo`) */
export const dontUseOnlyValueFor: TFiltersDataKey[] = ['orderBySelect'];
