'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { TAllUsedKeys, TAvailableAnswersResultsQueryData } from '@/lib/types/react-query';
import { getErrorText } from '@/lib/helpers';
import {
  addNewItemToQueryCache,
  deleteItemFromQueryCache,
  getUnqueItemsList,
  invalidateAllUsedKeysExcept,
  stringifyQueryKey,
  updateItemInQueryCache,
} from '@/lib/helpers/react-query';
import { composeUrlQuery } from '@/lib/helpers/urls';
import { TGetAvailableAnswersParams, TGetAvailableAnswersResults } from '@/lib/zod-schemas';
import { useT } from '@/i18n';
import { defaultItemsLimit, defaultStaleTime } from '@/constants';
import { getAvailableAnswers } from '@/features/answers/actions/getAvailableAnswers';
import { TAnswerId, TAvailableAnswer } from '@/features/answers/types';

interface TUseAvailableAnswersProps extends Omit<TGetAvailableAnswersParams, 'skip' | 'take'> {
  enabled?: boolean;
  itemsLimit?: number | null;
  traceId?: string;
  staleTime?: number;
}

interface TMemo {
  query?: UseInfiniteQueryResult<TAvailableAnswersResultsQueryData, Error>;
  mounted?: boolean;
}

/** Collection of the all used query keys (mb, already invalidated).
 *
 * TODO:
 * - Use `QueryCache.subscribe` to remove invalidated keys?
 * - Create a helper to invalidate all the keys or all the keys, except current?
 */
const allUsedKeys: TAllUsedKeys = {};

export function useAvailableAnswers(props: TUseAvailableAnswersProps = {}) {
  const { enabled, questionId, traceId, staleTime = defaultStaleTime, ...queryProps } = props;
  // const invalidateKeys = useInvalidateReactQueryKeys();
  const routePath = usePathname();

  const queryClient = useQueryClient();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const t = useT();

  /* Use partrial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);
  const queryKey = React.useMemo<QueryKey>(
    () => ['available-answers-for-question', questionId, queryUrlHash],
    [questionId, queryUrlHash],
  );
  const keyId = stringifyQueryKey(queryKey);
  allUsedKeys[keyId] = queryKey;

  const queryFn = React.useCallback(
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      try {
        const take =
          queryProps.itemsLimit == null ? undefined : queryProps.itemsLimit || defaultItemsLimit;

        const result = await Promise.race([
          getAvailableAnswers({ ...queryProps, questionId, skip: pageParam, take }),
          new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
        ]);
        return result;
      } catch (error) {
        if (!memo.mounted) {
          // eslint-disable-next-line no-console
          console.warn('[useAvailableAnswers:queryFn]', traceId, 'Query failed while unmounted', {
            pageParam,
          });
        } else if (error === 'timeout') {
          // eslint-disable-next-line no-console
          console.warn('[useAvailableAnswers:queryFn]', traceId, 'Query timeout', {
            traceId,
            pageParam,
          });
        } else {
          const message = t('UseAvailableAnswers.CannotLoadAnswersData');
          // eslint-disable-next-line no-console
          console.error('[useAvailableAnswers:queryFn]', message, {
            traceId,
            error: getErrorText(error),
            pageParam,
          });
          toast.error(message);
        }
        throw error;
      }
    },
    [memo, queryProps, questionId, t, traceId],
  );

  const query: UseInfiniteQueryResult<TAvailableAnswersResultsQueryData, Error> = useInfiniteQuery<
    TGetAvailableAnswersResults,
    Error,
    InfiniteData<TGetAvailableAnswersResults>,
    QueryKey,
    number // Cursor type (from `skip` api parameter)
  >({
    queryKey,
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, page) => acc + (page?.items.length || 0), 0);
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    queryFn,
    staleTime, // Data validity period
    // refetchOnWindowFocus: false,
    // refetchOnMount: false,
    // refetchOnReconnect: false,
  });
  memo.query = query;

  // Handle component mount/unmount
  React.useEffect(() => {
    const query = memo.query;
    if (query) {
      memo.mounted = true;
      return () => {
        memo.mounted = false;
        const { isFetching } = query;
        // Cleanup pending requests on unmount
        if (isFetching) {
          queryClient.cancelQueries({ queryKey, exact: true });
          queryClient.resetQueries({ queryKey, exact: true });
          queryClient.removeQueries({ queryKey, exact: true });
        }
      };
    }
  }, [memo, queryKey, queryClient, traceId]);

  // Derived data...

  const allAnswers = React.useMemo(
    () => getUnqueItemsList<TAvailableAnswer>(query.data?.pages),
    [query.data?.pages],
  );

  // Incapsulated helpers...

  /** Add new answer record to the pages data
   * @param {TAvailableAnswer} newAnswer - Record to add
   * @param {boolean} toStart - Add the new item to the beginning of the existing items. TODO: Determine default behavior by `orderBy`?
   */
  const addNewAnswer = React.useCallback(
    (newAnswer: TAvailableAnswer, toStart?: boolean) =>
      addNewItemToQueryCache<TAvailableAnswer>(queryClient, queryKey, newAnswer, toStart),
    [queryClient, queryKey],
  );

  /** Delete the specified answer (by id) from the pages data.
   * @param {TAnswerId} answerIdToDelete - Assuming answer has a unique id of string or number type
   */
  const deleteAnswer = React.useCallback(
    (answerIdToDelete: TAnswerId) =>
      deleteItemFromQueryCache<TAvailableAnswer>(queryClient, queryKey, answerIdToDelete),
    [queryClient, queryKey],
  );

  /** Delete the specified answer (by id) from the pages data.
   * @param {TAnswerId} answerIdToDelete - Assuming answer has a unique id of string or number type
   */
  const updateAnswer = React.useCallback(
    (updatedAnswer: TAvailableAnswer) =>
      updateItemInQueryCache<TAvailableAnswer>(queryClient, queryKey, updatedAnswer),
    [queryClient, queryKey],
  );

  /** Invalidate all used keys, except optional specified ones
   * @param {QueryKey[]} [excludeKeys] -- The list of keys to exclude from the invalidation
   */
  const invalidateAllKeysExcept = React.useCallback(
    (excludeKeys?: QueryKey[]) =>
      invalidateAllUsedKeysExcept(queryClient, excludeKeys, allUsedKeys),
    [queryClient],
  );

  /* // List of query properties:
   * status
   * error
   * data
   * isLoading
   * isError
   * isPending
   * isLoadingError
   * isRefetchError
   * isSuccess
   * isPlaceholderData
   * fetchNextPage
   * fetchPreviousPage
   * hasNextPage
   * hasPreviousPage
   * isFetchNextPageError
   * isFetchingNextPage
   * isFetchPreviousPageError
   * isFetchingPreviousPage
   * dataUpdatedAt
   * errorUpdatedAt
   * failureCount
   * failureReason
   * errorUpdateCount
   * isFetched
   * isFetchedAfterMount
   * isFetching
   * isInitialLoading
   * isPaused
   * isRefetching
   * isStale
   * isEnabled
   * refetch
   * fetchStatus
   * promise
   */

  return React.useMemo(() => {
    return {
      ...query,
      // Derived data...
      routePath,
      queryProps,
      queryKey,
      allUsedKeys,
      allAnswers,
      hasAnswers: !!allAnswers.length, // !!query.data?.pages[0]?.totalCount,
      // Helpers...
      addNewAnswer,
      deleteAnswer,
      updateAnswer,
      invalidateAllKeysExcept,
      queryUrlHash,
    };
  }, [
    query,
    routePath,
    queryProps,
    queryKey,
    allAnswers,
    addNewAnswer,
    deleteAnswer,
    updateAnswer,
    invalidateAllKeysExcept,
    queryUrlHash,
  ]);
}
