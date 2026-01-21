'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';

import {
  getMostRecentSuggestedCategory,
  TGetMostRecentSuggestedCategoryParams,
} from '@/features/categories/actions/getMostRecentSuggestedCategory';
import { TCategory } from '@/features/categories/types';

import { allowSuggestCategoriesIn } from '../constants';

export interface TUseMostRecentSuggestedCategoryProps
  extends TGetMostRecentSuggestedCategoryParams {
  enabled?: boolean;
}

/** Update cahce once a period */
const staleTime = Math.round(allowSuggestCategoriesIn / 3);

/** Hook to fetch the most recent suggested category by the current user */
export function useMostRecentSuggestedCategory(
  props: TUseMostRecentSuggestedCategoryProps = {},
): UseQueryResult<TCategory | null, Error> {
  const { enabled = true, ...queryParams } = props;

  const query = useQuery({
    enabled,
    queryKey: ['most-recent-suggested-category', queryParams],
    queryFn: () => getMostRecentSuggestedCategory(queryParams),
    staleTime,
  });

  return query;
}

export type TUseMostRecentSuggestedCategoryResult = ReturnType<
  typeof useMostRecentSuggestedCategory
>;
