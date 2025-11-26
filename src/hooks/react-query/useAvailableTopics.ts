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

import { APIError } from '@/lib/types/api';
import { TAllUsedKeys, TAvailableTopicsResultsQueryData } from '@/lib/types/react-query';
import {
  addNewItemToQueryCache,
  deleteItemFromQueryCache,
  getUnqueItemsList,
  invalidateAllUsedKeysExcept,
  stringifyQueryKey,
  updateItemInQueryCache,
} from '@/lib/helpers/react-query';
import { composeUrlQuery } from '@/lib/helpers/urls';
import { TGetAvailableTopicsParams, TGetAvailableTopicsResults } from '@/lib/zod-schemas';
import { defaultItemsLimit, defaultStaleTime } from '@/constants';
import {
  defaultTopicsManageScope,
  TopicsManageScopeIds,
  TTopicsManageScopeId,
} from '@/contexts/TopicsContext';
import { getAvailableTopics } from '@/features/topics/actions';
import { TAvailableTopic, TTopicId } from '@/features/topics/types';

import { useSessionUser } from '../useSessionUser';

const itemsLimit = defaultItemsLimit;

const staleTime = defaultStaleTime;

// TODO: Register all the query keys

type TUseAvailableTopicsProps = Omit<TGetAvailableTopicsParams, 'skip' | 'take'>;

/** Collection of the all used query keys (mb, already invalidated).
 *
 * QueryKey's are stored with strigified keys.
 *
 * TODO:
 * - To use `QueryCache.subscribe` to remove invalidated keys?
 * - Create a helper to invalidate all the keys or all the keys, except current?
 */
const allUsedKeys: TAllUsedKeys = {};

function useAvailableTopics(props: TUseAvailableTopicsProps = {}) {
  const { enabled = true, ...queryProps } = props;
  const queryClient = useQueryClient();
  // const invalidateKeys = useInvalidateReactQueryKeys();
  const routePath = usePathname();

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
    () => ['available-topics', queryUrlHash],
    [queryUrlHash],
  );
  allUsedKeys[stringifyQueryKey(queryKey)] = queryKey;

  const query: UseInfiniteQueryResult<TAvailableTopicsResultsQueryData, Error> = useInfiniteQuery<
    TGetAvailableTopicsResults,
    Error,
    InfiniteData<TGetAvailableTopicsResults>,
    QueryKey,
    number // Cursor type (from `skip` api parameter)
  >({
    enabled,
    queryKey,
    staleTime, // Data validity period
    // gcTime: 10 * staleTime, // Inactive cache validity period
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      /* // Take only unique topics (it cause permanent 'more items available' if some topics has been loaded twice)
       * const loadedCount = getUnqueItemsList(allPages).length;
       */
      // A naive solution
      const loadedCount = allPages.reduce((acc, page) => acc + page.items.length, 0);
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    queryFn: async (params) => {
      /* // DEBUG: Test error
       * throw new Error('Test error');
       */
      const { pageParam = 0 } = params;
      try {
        // OPTION: Using server function
        const result = await getAvailableTopics({
          ...queryProps,
          skip: pageParam,
          take: itemsLimit,
        });
        return result;
        /* // OPTION: Using route api fetch
         * const paginationHash = composeUrlQuery(
         *   { skip: pageParam, take: itemsLimit },
         * );
         * const url = appendUrlQueries('/api/topics', queryUrlHash, paginationHash);
         * const result = await handleApiResponse<TGetAvailableTopicsResults>(fetch(url), {
         *   onInvalidateKeys: invalidateKeys,
         *   debugDetails: {
         *     initiator: 'useAvailableTopics',
         *     action: 'getAvailableTopics',
         *     pageParam,
         *   },
         * });
         * return result.data as TGetAvailableTopicsResults;
         */
      } catch (error) {
        const details = error instanceof APIError ? error.details : null;
        const message = 'Cannot load topics data';
        // eslint-disable-next-line no-console
        console.error('[useAvailableTopics:queryFn]', message, {
          details,
          error,
          pageParam,
          // url,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        toast.error(message);
        throw error;
      }
    },
  });

  // Derived data...

  const allTopics = React.useMemo(() => getUnqueItemsList(query.data?.pages), [query.data?.pages]);

  // Incapsulated helpers...

  /** Add new topic record to the pages data
   * @param {TAvailableTopic} newTopic - Record to add
   * @param {boolean} toStart - Add the new item to the beginning of the existing items. TODO: Determine default behavior by `orderBy`?
   */
  const addNewTopic = React.useCallback(
    (newTopic: TAvailableTopic, toStart?: boolean) =>
      addNewItemToQueryCache<TAvailableTopic>(queryClient, queryKey, newTopic, toStart),
    [queryClient, queryKey],
  );

  /** Delete the specified topic (by id) from the pages data.
   * @param {TTopicId} topicIdToDelete - Assuming topic has a unique id of string or number type
   */
  const deleteTopic = React.useCallback(
    (topicIdToDelete: TTopicId) =>
      deleteItemFromQueryCache<TAvailableTopic>(queryClient, queryKey, topicIdToDelete),
    [queryClient, queryKey],
  );

  /** Delete the specified topic (by id) from the pages data.
   * @param {TTopicId} topicIdToDelete - Assuming topic has a unique id of string or number type
   */
  const updateTopic = React.useCallback(
    (updatedTopic: TAvailableTopic) =>
      updateItemInQueryCache<TAvailableTopic>(queryClient, queryKey, updatedTopic),
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
      queryUrlHash,
      allUsedKeys,
      allTopics,
      hasTopics: !!allTopics.length, // !!query.data?.pages[0]?.totalCount,
      // Helpers...
      addNewTopic,
      deleteTopic,
      updateTopic,
      invalidateAllKeysExcept,
    };
  }, [
    query,
    // Derived data...
    routePath,
    queryProps,
    queryKey,
    queryUrlHash,
    // allUsedKeys,
    allTopics,
    // Helpers...
    addNewTopic,
    deleteTopic,
    updateTopic,
    invalidateAllKeysExcept,
  ]);
}

interface TUseAvailableTopicsByScopeProps extends TUseAvailableTopicsProps {
  manageScope?: TTopicsManageScopeId;
}

export function useAvailableTopicsByScope(props: TUseAvailableTopicsByScopeProps = {}) {
  const { manageScope = defaultTopicsManageScope, ...queryProps } = props;
  const user = useSessionUser();
  const passQueryProps: TUseAvailableTopicsProps = React.useMemo(() => {
    const isAdmin = user?.role === 'ADMIN';
    return {
      // skip, // Skip records (start from the nth record), default = 0 // z.number().int().nonnegative().optional()
      // take, // Amount of records to return, default = {itemsLimit} // z.number().int().positive().optional()
      adminMode: manageScope === TopicsManageScopeIds.ALL_TOPICS && isAdmin, // Get all users' data not only your own (admins only: will return no data for non-admins) ??? // z.boolean().optional()
      showOnlyMyTopics: manageScope === TopicsManageScopeIds.MY_TOPICS, // Display only current user's topics, TODO: To use the settings value?
      includeWorkout: true, // Include (limited) active workout data // z.boolean().optional()
      // includeStats: true,  // Include (limited) workout stats data // z.boolean().optional()
      includeUser: true, // Include compact user info data (name, email) in the `user` property of result object // z.boolean().optional()
      includeQuestionsCount: true, // Include related questions count, in `_count: { questions }` // z.boolean().optional()
      orderBy: { updatedAt: 'desc' }, // Sort by parameter, default: `{ updatedAt: 'desc' }`, packed json string // TopicFindManyArgsSchema.shape.orderBy // This approach doesn't work
      // topicIds, // Include only listed topic ids // z.array(z.string()).optional()
      ...queryProps,
    } satisfies TUseAvailableTopicsProps;
  }, [manageScope, queryProps, user]);
  return useAvailableTopics(passQueryProps);
}
