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

export const filtersDataSchema = z.object({
  searchText: z.string().max(maxSearchTextLength).optional(),
  searchLang: z.string().max(maxSearchTextLength).optional(),
  showOnlyMyTopics: AvailableTopicsFiltersSchema.shape.showOnlyMyTopics,
  hasWorkoutStats: threeStateSchema,
  hasActiveWorkouts: threeStateSchema,
  hasQuestions: threeStateSchema,
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
};

export const fieldUnionStrings = {
  true: 'Yes',
  false: 'No',
  null: 'Ignore',
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
