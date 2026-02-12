'use client';

import React from 'react';
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

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

import { TFiltersDataSchemaStatus } from '../contexts/CategoriesFiltersContext/CategoriesFiltersTypes';

const itemsLimit = defaultItemsLimit;
const staleTime = defaultStaleTime;

/** Collection of all used query keys (may already be invalidated).
 * NOTE: QueryKeys are stored with stringified keys.
 */
const allUsedKeys: TAllUsedKeys = {};

type TUseAvailableCategoriesProps = Omit<TGetAvailableCategoriesParams, 'skip' | 'take'> & {
  traceId?: string;
  enabled?: boolean;
  all?: boolean;
};

interface TMemo {
  query?: UseInfiniteQueryResult<TGetResultsInfiniteQueryData<TAvailableCategory>, Error>;
  mounted?: boolean;
}

/** Hook to fetch available categories with pagination support */
export function useAvailableCategories(props: TUseAvailableCategoriesProps = {}) {
  const { all, traceId, enabled = true, ...queryProps } = props;
  const queryClient = useQueryClient();

  const memo = React.useMemo<TMemo>(() => ({}), []);

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
    [all, queryUrlHash],
  );
  const keyId = stringifyQueryKey(queryKey);
  allUsedKeys[keyId] = queryKey;

  const queryFn = React.useCallback(
    async ({ pageParam = 0 }: { pageParam?: number; signal?: AbortSignal }) => {
      try {
        // TODO: To throw an exception if not `memo.mounted` set?
        const result = await Promise.race([
          getAvailableCategories({
            ...queryProps,
            status:
              (queryProps.status as TFiltersDataSchemaStatus) !== 'ANY'
                ? queryProps.status
                : undefined,
            skip: pageParam as number,
            take: all ? undefined : itemsLimit,
          }),
          // To kill hanged out queries, and start it over
          new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
        ]);
        return result;
      } catch (error) {
        if (error === 'timeout') {
          const message = 'Query has been timed out and will be started over';
          // eslint-disable-next-line no-console
          console.warn('[useAvailableCategories:queryFn]', traceId, message, {
            pageParam,
            memo,
            queryProps,
          });
          // NOTE: No user warnings for timeouts
        } else if (!memo.mounted) {
          const message = 'Query failed while unmounted. Probably, that is not an error.';
          // eslint-disable-next-line no-console
          console.warn('[useAvailableCategories:queryFn]', traceId, message, {
            pageParam,
            memo,
            queryProps,
          });
          // NOTE: No user warnings for problems when unmounted
        } else {
          const message = 'Cannot load categories data';
          const details = getErrorText(error);
          // eslint-disable-next-line no-console
          console.error('[useAvailableCategories:queryFn]', traceId, message, {
            traceId,
            details,
            error,
            pageParam,
            memo,
            queryProps,
          });
          toast.error(message);
        }
        throw error;
      }
    },
    [all, memo, queryProps, traceId],
  );

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
    /* // NOTE: Attempts to find proper parameters to prevent stucking with permanent 'isFetching' state in popups
     * gcTime: 10 * 1000, // 10s garbage collection
     * staleTime: 30 * 1000, // 30s stale
     * refetchOnMount: false, // Don't restart on remount
     * refetchOnWindowFocus: false,
     * // Prevent background updates
     * refetchOnReconnect: false,
     */
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
    queryFn,
  }) as UseInfiniteQueryResult<TGetResultsInfiniteQueryData<TAvailableCategory>, Error>;
  memo.query = query;

  React.useEffect(() => {
    const query = memo.query;
    if (query) {
      memo.mounted = true;
      /* console.log('[useAvailableCategories:mount]', traceId, keyId, {
       *   memo,
       * });
       */
      return () => {
        memo.mounted = false;
        const { isFetching } = query;
        // NOTE: Trying to prevent stucking on permanent isFetching state on fast simultaneous unmounts (in dialog popups)
        if (isFetching) {
          // 1. IMMEDIATELY cancel pending requests
          queryClient.cancelQueries({ queryKey, exact: true });
          // 2. RESET to idle state (stops isLoading)
          queryClient.resetQueries({ queryKey, exact: true });
          // 3. Remove from cache entirely (prevents stale blocking)
          queryClient.removeQueries({ queryKey, exact: true });
        }
      };
    }
  }, [memo, queryKey, queryClient, traceId, keyId]);

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
