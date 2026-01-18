'use client';

import React from 'react';
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from '@tanstack/react-query';

// import { toast } from 'sonner';

import { TGetResults, TGetResultsInfiniteQueryData } from '@/lib/types/api';
import { TAllUsedKeys } from '@/lib/types/react-query';
import { composeUrlQuery, getErrorText } from '@/lib/helpers';
import {
  addNewItemToQueryCache,
  deleteItemFromQueryCache,
  getUnqueItemsList,
  invalidateAllUsedKeysExcept,
  stringifyQueryKey,
  updateItemInQueryCache,
} from '@/lib/helpers/react-query';
import { defaultItemsLimit, defaultStaleTime } from '@/constants';
import { getAvailableCategories } from '@/features/categories/actions/getAvailableCategories';
import {
  TAvailableCategory,
  TCategoryId,
  TGetAvailableCategoriesParams,
  TGetAvailableCategoriesResults,
} from '@/features/categories/types';

const itemsLimit = defaultItemsLimit;
const staleTime = defaultStaleTime;

/** Collection of all used query keys (may already be invalidated).
 *
 * QueryKeys are stored with stringified keys.
 */
const allUsedKeys: TAllUsedKeys = {};

type TUseAvailableCategoriesProps = Omit<TGetAvailableCategoriesParams, 'skip' | 'take'> & {
  traceId?: string;
  enabled?: boolean;
  all?: boolean;
};

/** Hook to fetch available categories with pagination support */
export function useAvailableCategories(props: TUseAvailableCategoriesProps = {}) {
  const { all, traceId, enabled = true, ...queryProps } = props;
  const queryClient = useQueryClient();

  /* Use partrial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => {
    // Convert Date objects to ISO strings for URL composition
    const urlParams = {
      ...queryProps,
      minCreatedAt: queryProps.minCreatedAt?.toISOString(),
      maxCreatedAt: queryProps.maxCreatedAt?.toISOString(),
      minUpdatedAt: queryProps.minUpdatedAt?.toISOString(),
      maxUpdatedAt: queryProps.maxUpdatedAt?.toISOString(),
    };
    return composeUrlQuery(urlParams);
  }, [queryProps]);
  const queryKey = React.useMemo<QueryKey>(
    () => ['available-categories', all ? 'all' : 'incremental', queryUrlHash],
    [queryUrlHash],
  );
  allUsedKeys[stringifyQueryKey(queryKey)] = queryKey;

  const query = useInfiniteQuery<
    TGetAvailableCategoriesResults,
    Error,
    InfiniteData<TGetAvailableCategoriesResults>,
    QueryKey,
    number // Cursor type (from `skip` api parameter)
  >({
    enabled,
    queryKey,
    staleTime,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = (allPages as TGetResults<TAvailableCategory>[]).reduce(
        (acc, page) => acc + page.items.length,
        0,
      );
      return loadedCount < (lastPage as TGetResults<TAvailableCategory>).totalCount
        ? loadedCount
        : undefined;
    },
    queryFn: async (params) => {
      const { pageParam = 0 } = params;
      try {
        console.log('[useAvailableCategories:queryFn] before', traceId, {
          params,
        });
        if (traceId === 'CategorySelect') {
          // debugger;
        }
        const result = await getAvailableCategories({
          ...queryProps,
          skip: pageParam as number,
          take: all ? undefined : itemsLimit,
        });
        console.log('[useAvailableCategories:queryFn] done', {
          result,
        });
        if (traceId === 'CategorySelect') {
          // debugger;
        }
        return result;
      } catch (error) {
        const details = getErrorText(error);
        const message = 'Cannot load categories data';
        // eslint-disable-next-line no-console
        console.error('[useAvailableCategories:queryFn]', message, traceId, {
          traceId,
          details,
          error,
          pageParam,
        });
        // toast.error(message);
        throw error;
      }
    },
  }) as UseInfiniteQueryResult<TGetResultsInfiniteQueryData<TAvailableCategory>, Error>;

  const allCategories = React.useMemo(
    () => getUnqueItemsList(query.data?.pages),
    [query.data?.pages],
  );

  /** Add new category record to the pages data */
  const addNewCategory = React.useCallback(
    (newCategory: TAvailableCategory, toStart: boolean = true) =>
      addNewItemToQueryCache<TAvailableCategory>(queryClient, queryKey, newCategory, toStart),
    [queryClient, queryKey],
  );

  /** Delete the specified category (by id) from the pages data */
  const deleteCategory = React.useCallback(
    (categoryIdToDelete: TCategoryId) =>
      deleteItemFromQueryCache<TAvailableCategory>(queryClient, queryKey, categoryIdToDelete),
    [queryClient, queryKey],
  );

  /** Update the specified category in the pages data */
  const updateCategory = React.useCallback(
    (updatedCategory: TAvailableCategory) =>
      updateItemInQueryCache<TAvailableCategory>(queryClient, queryKey, updatedCategory),
    [queryClient, queryKey],
  );

  /** Invalidate all used keys, except optional specified ones */
  const invalidateAllKeysExcept = React.useCallback(
    (excludeKeys?: QueryKey[]) =>
      invalidateAllUsedKeysExcept(queryClient, excludeKeys, allUsedKeys),
    [queryClient],
  );

  return React.useMemo(() => {
    return {
      ...query,
      queryClient,
      queryKey,
      allUsedKeys,
      allCategories,
      hasCategories: !!allCategories.length,
      // Helpers...
      addNewCategory,
      deleteCategory,
      updateCategory,
      invalidateAllKeysExcept,
      queryUrlHash,
    };
  }, [
    query,
    queryClient,
    queryKey,
    allCategories,
    addNewCategory,
    deleteCategory,
    updateCategory,
    invalidateAllKeysExcept,
    queryUrlHash,
  ]);
}

export type TUseAvailableCategoriesResult = ReturnType<typeof useAvailableCategories>;
export type TUseAvailableCategoriesByScopeResult = ReturnType<typeof useAvailableCategories>;
