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
  traceId?: string;
  enabled?: boolean;
}

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

const staleTime = defaultStaleTime;

/** Get category data from cached `useAvailableCategories` query data or fetch it now */
export function useAvailableCategoryById(props: TUseAvailableCategoryByIdProps) {
  const {
    enabled = true,
    traceId,
    availableCategoriesQueryKey,
    id: categoryId,
    ...queryProps
  } = props;

  const memo = React.useMemo<TMemo>(() => ({}), []);
  const queryClient = useQueryClient();

  /* Use partial query url as a part of the query key */
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
  const isEnabled = enabled && !!categoryId && !isCached;

  const queryFn = React.useCallback(async () => {
    try {
      if (categoryId) {
        const result = await Promise.race([
          getCategoryById({ id: categoryId, ...queryProps }),
          new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
        ]);
        return result;
      }
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableCategoryById:queryFn]', traceId, message, {
          categoryId,
          queryUrlHash,
        });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableCategoryById:queryFn]', traceId, message, {
          categoryId,
          queryUrlHash,
        });
      } else {
        const message = 'Cannot load category data';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[useAvailableCategoryById:queryFn]', traceId, comboMsg, {
          traceId,
          details,
          error,
          queryProps,
          queryUrlHash,
          queryKey,
          categoryId,
          isEnabled,
          enabled,
        });
        if (isEnabled) {
          debugger; // eslint-disable-line no-debugger
        }
        throw error;
      }
      return null;
    }
  }, [categoryId, queryProps, memo, traceId, queryUrlHash, queryKey, isEnabled, enabled]);

  // Only fetch if the category is not cached
  const query = useQuery<TAvailableCategory | undefined | null>({
    queryKey,
    staleTime, // Data validity period
    queryFn,
    enabled: isEnabled, // Disable query if already cached or no id provided
  });

  memo.query = query;

  React.useEffect(() => {
    const query = memo.query;
    if (query) {
      memo.mounted = true;
      return () => {
        memo.mounted = false;
        const { isFetching } = query;
        if (isFetching) {
          queryClient.cancelQueries({ queryKey, exact: true });
          queryClient.resetQueries({ queryKey, exact: true });
          queryClient.removeQueries({ queryKey, exact: true });
        }
      };
    }
  }, [memo, queryKey, queryClient]);

  return React.useMemo(
    () => ({
      category: cachedCategory ?? query.data,
      isCached,
      queryKey,
      queryUrlHash,
      queryClient,
      ...query,
    }),
    [cachedCategory, isCached, query, queryKey, queryUrlHash, queryClient],
  );
}
