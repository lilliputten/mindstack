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
import { TAllUsedKeys, TAvailableQuestionsResultsQueryData } from '@/lib/types/react-query';
import {
  addNewItemToQueryCache,
  deleteItemFromQueryCache,
  getUnqueItemsList,
  invalidateAllUsedKeysExcept,
  stringifyQueryKey,
  updateItemInQueryCache,
} from '@/lib/helpers/react-query';
import { composeUrlQuery } from '@/lib/helpers/urls';
import { TGetAvailableQuestionsParams, TGetAvailableQuestionsResults } from '@/lib/zod-schemas';
import { useT } from '@/i18n';
import { defaultItemsLimit, defaultStaleTime } from '@/constants';
import { getAvailableQuestions } from '@/features/questions/actions/getAvailableQuestions';
import { TAvailableQuestion, TQuestionId } from '@/features/questions/types';

const staleTime = defaultStaleTime;

// TODO: Register all the query keys

interface TUseAvailableQuestionsProps extends Omit<TGetAvailableQuestionsParams, 'skip' | 'take'> {
  enabled?: boolean;
  itemsLimit?: number | null;
}

/** Collection of the all used query keys (mb, already invalidated).
 *
 * TODO:
 * - Use `QueryCache.subscribe` to remove invalidated keys?
 * - Create a helper to invalidate all the keys or all the keys, except current?
 */
const allUsedKeys: TAllUsedKeys = {};

export function useAvailableQuestions(props: TUseAvailableQuestionsProps = {}) {
  const { enabled = true, topicId, ...queryProps } = props;
  const queryClient = useQueryClient();
  // const invalidateKeys = useInvalidateReactQueryKeys();
  const routePath = usePathname();

  const t = useT();

  /* Use partrial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);
  const queryKey = React.useMemo<QueryKey>(
    () => ['available-questions-for-topic', topicId, queryUrlHash],
    [topicId, queryUrlHash],
  );
  allUsedKeys[stringifyQueryKey(queryKey)] = queryKey;

  const query: UseInfiniteQueryResult<TAvailableQuestionsResultsQueryData, Error> =
    useInfiniteQuery<
      TGetAvailableQuestionsResults,
      Error,
      InfiniteData<TGetAvailableQuestionsResults>,
      QueryKey,
      number // Cursor type (from `skip` api parameter)
    >({
      queryKey,
      staleTime, // Data validity period
      enabled,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const loadedCount = allPages.reduce((acc, page) => acc + page.items.length, 0);
        return loadedCount < lastPage.totalCount ? loadedCount : undefined;
      },
      queryFn: async (params) => {
        const { pageParam = 0 } = params;
        try {
          // OPTION 1: Using server function
          const results = await getAvailableQuestions({
            ...queryProps,
            topicId,
            skip: pageParam,
            take:
              queryProps.itemsLimit == null
                ? undefined
                : queryProps.itemsLimit || defaultItemsLimit,
          });
          return results;
          /* // OPTION 2: Using route api fetch
           * const paginationHash = composeUrlQuery({ skip: pageParam, take: itemsLimit });
           * const baseUrl = `/api/questions`;
           * const url = appendUrlQueries(baseUrl, queryUrlHash, paginationHash);
           * const results = await handleApiResponse<TGetAvailableQuestionsResults>(fetch(url), {
           *   onInvalidateKeys: invalidateKeys,
           *   debugDetails: {
           *     initiator: 'useAvailableTopics',
           *     action: 'getAvailableTopics',
           *     pageParam,
           *   },
           * });
           * if (!results.ok || !results.data) {
           *   throw new Error('No data returned');
           * }
           * return results.data;
           */
        } catch (error) {
          const details = error instanceof APIError ? error.details : null;
          const message = t('UseAvailableQuestions.CannotLoadQuestionsData');
          // eslint-disable-next-line no-console
          console.error('[useAvailableQuestions:queryFn]', message, {
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

  const allQuestions = React.useMemo(
    () => getUnqueItemsList<TAvailableQuestion>(query.data?.pages),
    [query.data?.pages],
  );

  // Incapsulated helpers...

  /** Add new question record to the pages data
   * @param {TAvailableQuestion} newQuestion - Record to add
   * @param {boolean} toStart - Add the new item to the beginning of the existing items. TODO: Determine default behavior by `orderBy`?
   */
  const addNewQuestion = React.useCallback(
    (newQuestion: TAvailableQuestion, toStart?: boolean) =>
      addNewItemToQueryCache<TAvailableQuestion>(queryClient, queryKey, newQuestion, toStart),
    [queryClient, queryKey],
  );

  /** Delete the specified question (by id) from the pages data.
   * @param {TQuestionId} questionIdToDelete - Assuming question has a unique id of string or number type
   */
  const deleteQuestion = React.useCallback(
    (questionIdToDelete: TQuestionId) =>
      deleteItemFromQueryCache<TAvailableQuestion>(queryClient, queryKey, questionIdToDelete),
    [queryClient, queryKey],
  );

  /** Delete the specified question (by id) from the pages data.
   * @param {TQuestionId} questionIdToDelete - Assuming question has a unique id of string or number type
   */
  const updateQuestion = React.useCallback(
    (updatedQuestion: TAvailableQuestion) =>
      updateItemInQueryCache<TAvailableQuestion>(queryClient, queryKey, updatedQuestion),
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

  return {
    ...query,
    // Derived data...
    routePath,
    queryProps,
    queryKey,
    allUsedKeys,
    allQuestions,
    hasQuestions: !!allQuestions.length, // !!query.data?.pages[0]?.totalCount,
    // Helpers...
    addNewQuestion,
    deleteQuestion,
    updateQuestion,
    invalidateAllKeysExcept,
  };
}

/* // UNUSED?
 * interface TUseAvailableTopicsByScopeProps {
 *   manageScope?: TTopicsManageScopeId;
 * }
 * export function useAvailableQuestionsByScope(props: TUseAvailableTopicsByScopeProps = {}) {
 *   const {
 *     manageScope = defaultTopicsManageScope,
 *     // user,
 *   } = props;
 *   const user = useSessionUser();
 *   const queryProps: TUseAvailableQuestionsProps = React.useMemo(() => {
 *     const isAdmin = user?.role === 'ADMIN';
 *     return {
 *       // skip, // Skip records (start from the nth record), default = 0 // z.number().int().nonnegative().optional()
 *       // take, // Amount of records to return, default = {itemsLimit} // z.number().int().positive().optional()
 *       adminMode: manageScope === TopicsManageScopeIds.ALL_TOPICS && isAdmin, // Get all users' data not only your own (admins only: will return no data for non-admins) ??? // z.boolean().optional()
 *       showOnlyMyQuestions: manageScope === TopicsManageScopeIds.MY_TOPICS, // Display only current user's questions
 *       includeTopic: true, // Include (limited) topic data // z.boolean().optional()
 *       includeAnswersCount: true, // Include related answers count, in `_count: { questions }` // z.boolean().optional()
 *       orderBy: { updatedAt: 'desc' }, // Sort by parameter, default: `{ updatedAt: 'desc' }`, packed json string // TopicFindManyArgsSchema.shape.orderBy // This approach doesn't work
 *       // topicIds, // Include only listed topic ids // z.array(z.string()).optional()
 *     } satisfies TUseAvailableQuestionsProps;
 *   }, [manageScope, user]);
 *   return useAvailableTopics(queryProps);
 * }
 */
