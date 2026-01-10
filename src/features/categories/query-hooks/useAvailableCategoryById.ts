import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

import { composeUrlQuery, getErrorText } from '@/lib/helpers';
import { defaultStaleTime } from '@/constants';

import { getCategoryById } from '../actions';
import {
  TAvailableCategoriesResultsQueryData,
  TAvailableCategory,
  TGetAvailableCategoryByIdParams,
} from '../types';

interface TUseAvailableCategoryByIdProps extends TGetAvailableCategoryByIdParams {
  /** availableCategoriesQueryKey - A query key from `useAvailableCategories` */
  availableCategoriesQueryKey?: QueryKey;
}

const staleTime = defaultStaleTime;

/** Get category data from cached `useAvailableCategories` query data or fetch it now */
export function useAvailableCategoryById(props: TUseAvailableCategoryByIdProps) {
  const { availableCategoriesQueryKey, id: categoryId, ...queryProps } = props;
  // const invalidateKeys = useInvalidateReactQueryKeys();

  const queryClient = useQueryClient();

  /* Use partrial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);

  const queryKey = React.useMemo<QueryKey>(
    () => ['available-category', categoryId, queryUrlHash],
    [queryUrlHash, categoryId],
  );

  // Check cached infinite query data first
  const availableCategoriesData =
    availableCategoriesQueryKey &&
    queryClient.getQueryData<TAvailableCategoriesResultsQueryData>(availableCategoriesQueryKey);

  // Try to find the category in cached infinite pages
  const cachedCategory: TAvailableCategory | undefined = availableCategoriesData?.pages
    .flatMap((page) => page.items)
    .find((category) => category.id === categoryId);

  const isCached = !!cachedCategory;
  const isEnabled = !!categoryId && !isCached;

  // Only fetch if the category is not cached
  const query = useQuery<TAvailableCategory | undefined>({
    queryKey,
    staleTime, // Data validity period
    enabled: isEnabled, // Disable query if already cached or no id provided
    queryFn: async (_params) => {
      try {
        if (categoryId) {
          return await getCategoryById({ id: categoryId, ...queryProps });
        }
      } catch (error) {
        const message = 'Cannot load category data';
        const details = getErrorText(error); // error instanceof APIError ? error.details : null;
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[useAvailableCategoryById:queryFn]', comboMsg, {
          details,
          error,
          queryProps,
          categoryId,
        });
        debugger; // eslint-disable-line no-debugger
        throw new Error(message);
      }
    },
  });

  return {
    category: cachedCategory ?? query.data,
    isCached,
    queryKey,
    queryClient,
    ...query,
  };
}
