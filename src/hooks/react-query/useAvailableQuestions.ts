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

interface TUseAvailableQuestionsProps extends Omit<TGetAvailableQuestionsParams, 'skip' | 'take'> {
  enabled?: boolean;
  itemsLimit?: number | null;
  traceId?: string;
}

interface TMemo {
  query?: UseInfiniteQueryResult<TAvailableQuestionsResultsQueryData, Error>;
  mounted?: boolean;
}

const staleTime = defaultStaleTime;

/** Collection of the all used query keys (may already be invalidated).
 *
 * TODO:
 * - Use `QueryCache.subscribe` to remove invalidated keys?
 * - Create a helper to invalidate all the keys or all the keys, except current?
 */
const allUsedKeys: TAllUsedKeys = {};

export function useAvailableQuestions(props: TUseAvailableQuestionsProps = {}) {
  const { enabled = true, topicId, traceId, ...queryProps } = props;
  const queryClient = useQueryClient();
  const routePath = usePathname();
  const t = useT();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  /* Use partial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);
  const queryKey = React.useMemo<QueryKey>(
    () => ['available-questions-for-topic', topicId, queryUrlHash],
    [topicId, queryUrlHash],
  );
  const keyId = stringifyQueryKey(queryKey);
  allUsedKeys[keyId] = queryKey;

  const queryFn = React.useCallback(
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      try {
        const result = await Promise.race([
          getAvailableQuestions({
            ...queryProps,
            topicId,
            skip: pageParam,
            take:
              queryProps.itemsLimit == null
                ? undefined
                : queryProps.itemsLimit || defaultItemsLimit,
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
        ]);
        return result;
      } catch (error) {
        if (!memo.mounted) {
          const message = 'Query failed while unmounted. Probably, that is not an error.';
          // eslint-disable-next-line no-console
          console.warn('[useAvailableQuestions:queryFn]', traceId, message, { pageParam, topicId });
        } else if (error === 'timeout') {
          const message = 'Query has been timed out and will be started over';
          // eslint-disable-next-line no-console
          console.warn('[useAvailableQuestions:queryFn]', traceId, message, { pageParam, topicId });
        } else {
          const details = error instanceof APIError ? error.details : null;
          const message = t('UseAvailableQuestions.CannotLoadQuestionsData');
          // eslint-disable-next-line no-console
          console.error('[useAvailableQuestions:queryFn]', traceId, message, {
            details,
            error,
            pageParam,
            topicId,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
        }
        throw error;
      }
    },
    [memo, queryProps, topicId, t, traceId],
  );

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
      enabled: !!topicId && enabled,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const loadedCount = allPages.reduce((acc, page) => acc + (page?.items.length || 0), 0);
        return loadedCount < lastPage.totalCount ? loadedCount : undefined;
      },
      queryFn,
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
        if (isFetching) {
          queryClient.cancelQueries({ queryKey, exact: true });
          queryClient.resetQueries({ queryKey, exact: true });
          queryClient.removeQueries({ queryKey, exact: true });
        }
      };
    }
  }, [memo, queryKey, queryClient]);

  // Derived data...
  const allQuestions = React.useMemo(
    () => getUnqueItemsList<TAvailableQuestion>(query.data?.pages),
    [query.data?.pages],
  );

  // Incapsulated helpers...
  const addNewQuestion = React.useCallback(
    (newQuestion: TAvailableQuestion, toStart?: boolean) =>
      addNewItemToQueryCache<TAvailableQuestion>(queryClient, queryKey, newQuestion, toStart),
    [queryClient, queryKey],
  );

  const deleteQuestion = React.useCallback(
    (questionIdToDelete: TQuestionId) =>
      deleteItemFromQueryCache<TAvailableQuestion>(queryClient, queryKey, questionIdToDelete),
    [queryClient, queryKey],
  );

  const updateQuestion = React.useCallback(
    (updatedQuestion: TAvailableQuestion) =>
      updateItemInQueryCache<TAvailableQuestion>(queryClient, queryKey, updatedQuestion),
    [queryClient, queryKey],
  );

  const invalidateAllKeysExcept = React.useCallback(
    (excludeKeys?: QueryKey[]) =>
      invalidateAllUsedKeysExcept(queryClient, excludeKeys, allUsedKeys),
    [queryClient],
  );

  return React.useMemo(
    () => ({
      ...query,
      // Derived data...
      routePath,
      queryProps,
      queryKey,
      queryUrlHash,
      allUsedKeys,
      allQuestions,
      hasQuestions: !!allQuestions.length,
      // Helpers...
      addNewQuestion,
      deleteQuestion,
      updateQuestion,
      invalidateAllKeysExcept,
    }),
    [
      query,
      routePath,
      queryProps,
      queryKey,
      queryUrlHash,
      allQuestions,
      addNewQuestion,
      deleteQuestion,
      updateQuestion,
      invalidateAllKeysExcept,
    ],
  );
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
