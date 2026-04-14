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

import { TAllUsedKeys, TAvailableTopicsResultsQueryData } from '@/lib/types/react-query';
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
import { TGetAvailableTopicsParams, TGetAvailableTopicsResults } from '@/lib/zod-schemas';
import { useT } from '@/i18n';
import { defaultItemsLimit, defaultStaleTime } from '@/constants';
import {
  defaultTopicsManageScope,
  TopicsManageScopeIds,
  TTopicsManageScopeId,
} from '@/contexts/TopicsContext';
import { getAvailableTopics } from '@/features/topics/actions';
import { TAvailableTopic, TTopicId } from '@/features/topics/types';

import { useSessionUser } from '../useSessionUser';

interface TUseAvailableTopicsProps extends Omit<TGetAvailableTopicsParams, 'skip' | 'take'> {
  traceId?: string;
  enabled?: boolean;
}

interface TMemo {
  query?: UseInfiniteQueryResult<TAvailableTopicsResultsQueryData, Error>;
  mounted?: boolean;
}

const itemsLimit = defaultItemsLimit;
const staleTime = defaultStaleTime;

/** Collection of all used query keys (may already be invalidated).
 *
 * QueryKeys are stored with stringified keys.
 */
const allUsedKeys: TAllUsedKeys = {};

function useAvailableTopics(props: TUseAvailableTopicsProps = {}) {
  const { traceId, enabled = true, ...queryProps } = props;
  const queryClient = useQueryClient();
  const routePath = usePathname();
  const t = useT();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  /* Use partial query url as a part of the query key */
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
  const keyId = stringifyQueryKey(queryKey);
  allUsedKeys[keyId] = queryKey;

  const queryFn = React.useCallback(
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      try {
        const result = await Promise.race([
          getAvailableTopics({
            ...queryProps,
            skip: pageParam,
            take: itemsLimit,
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
        ]);

        return result;
      } catch (error) {
        if (!memo.mounted) {
          const message = 'Query failed while unmounted. Probably, that is not an error.';
          // eslint-disable-next-line no-console
          console.warn('[useAvailableTopics:queryFn]', traceId, message, { pageParam });
        } else if (error === 'timeout') {
          const message = 'Query has been timed out and will be started over';
          // eslint-disable-next-line no-console
          console.warn('[useAvailableTopics:queryFn]', traceId, message, { pageParam });
        } else {
          const details = getErrorText(error);
          const message = t('UseAvailableTopics.CannotLoadTopicsData');
          // eslint-disable-next-line no-console
          console.error('[useAvailableTopics:queryFn]', traceId, message, {
            details,
            error,
            pageParam,
          });
          debugger; // eslint-disable-line no-debugger
        }
        throw error;
      }
    },
    [memo, queryProps, t, traceId],
  );

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
  const allTopics = React.useMemo(() => getUnqueItemsList(query.data?.pages), [query.data?.pages]);

  // Incapsulated helpers...
  const addNewTopic = React.useCallback(
    (newTopic: TAvailableTopic, toStart?: boolean) =>
      addNewItemToQueryCache<TAvailableTopic>(queryClient, queryKey, newTopic, toStart),
    [queryClient, queryKey],
  );

  const deleteTopic = React.useCallback(
    (topicIdToDelete: TTopicId) =>
      deleteItemFromQueryCache<TAvailableTopic>(queryClient, queryKey, topicIdToDelete),
    [queryClient, queryKey],
  );

  const updateTopic = React.useCallback(
    (updatedTopic: TAvailableTopic) =>
      updateItemInQueryCache<TAvailableTopic>(queryClient, queryKey, updatedTopic),
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
      queryClient,
      // Derived data...
      routePath,
      queryProps,
      queryKey,
      queryUrlHash,
      allUsedKeys,
      allTopics,
      hasTopics: !!allTopics.length,
      // Helpers...
      addNewTopic,
      deleteTopic,
      updateTopic,
      invalidateAllKeysExcept,
    }),
    [
      query,
      queryClient,
      routePath,
      queryProps,
      queryKey,
      queryUrlHash,
      allTopics,
      addNewTopic,
      deleteTopic,
      updateTopic,
      invalidateAllKeysExcept,
    ],
  );
}

interface TUseAvailableTopicsByScopeProps extends TUseAvailableTopicsProps {
  manageScope?: TTopicsManageScopeId;
}

export function useAvailableTopicsByScope(props: TUseAvailableTopicsByScopeProps = {}) {
  const { traceId, manageScope = defaultTopicsManageScope, ...queryProps } = props;
  const user = useSessionUser();
  const passQueryProps: TUseAvailableTopicsProps = React.useMemo(() => {
    const isAdmin = user?.role === 'ADMIN';
    return {
      traceId,
      adminMode: manageScope === TopicsManageScopeIds.ALL_TOPICS && isAdmin,
      showOnlyMyTopics: manageScope === TopicsManageScopeIds.MY_TOPICS,
      includeWorkout: true,
      includeUser: true,
      includeQuestionsCount: true,
      orderBy: { updatedAt: 'desc' },
      ...queryProps,
    } satisfies TUseAvailableTopicsProps;
  }, [traceId, manageScope, queryProps, user]);
  return useAvailableTopics(passQueryProps);
}
