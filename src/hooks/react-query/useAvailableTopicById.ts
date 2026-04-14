import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

import { TAvailableTopicsResultsQueryData } from '@/lib/types/react-query';
import { getErrorText } from '@/lib/helpers';
import { composeUrlQuery } from '@/lib/helpers/urls';
import { TGetAvailableTopicByIdParams } from '@/lib/zod-schemas';
import { defaultStaleTime } from '@/constants';
import { getAvailableTopicById } from '@/features/topics/actions';
import { TAvailableTopic } from '@/features/topics/types';

interface TUseAvailableTopicByIdProps extends TGetAvailableTopicByIdParams {
  /** availableTopicsQueryKey - A query key from `useAvailableTopics` */
  availableTopicsQueryKey?: QueryKey;
  traceId?: string;
}

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

const staleTime = defaultStaleTime;

/** Get topic data from cached `useAvailableTopics` query data or fetch it now */
export function useAvailableTopicById(props: TUseAvailableTopicByIdProps) {
  const queryClient = useQueryClient();
  const { availableTopicsQueryKey, id: topicId, traceId, ...queryProps } = props;

  const memo = React.useMemo<TMemo>(() => ({}), []);

  /* Use partial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);

  const queryKey = React.useMemo<QueryKey>(
    () => ['available-topic', topicId, queryUrlHash],
    [queryUrlHash, topicId],
  );

  // Check cached infinite query data first
  const availableTopicsData: TAvailableTopicsResultsQueryData | undefined =
    availableTopicsQueryKey &&
    queryClient.getQueryData<TAvailableTopicsResultsQueryData>(availableTopicsQueryKey);

  // Try to find the topic in cached infinite pages
  const cachedTopic = availableTopicsData?.pages
    .flatMap((page) => page.items)
    .find((topic) => topic.id === topicId);

  const isCached = !!cachedTopic;
  const enabled = !!topicId && !isCached;

  const queryFn = React.useCallback(async () => {
    try {
      const result = await Promise.race([
        getAvailableTopicById({ id: topicId, ...queryProps }),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);

      return result;
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableTopicById:queryFn]', traceId, message, { topicId });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableTopicById:queryFn]', traceId, message, { topicId });
      } else {
        const errDetails = getErrorText(error);
        const message = 'Cannot load topic data';
        // eslint-disable-next-line no-console
        console.error('[useAvailableTopicById:queryFn]', traceId, message, {
          errDetails,
          error,
          queryProps,
          topicId,
        });
        debugger; // eslint-disable-line no-debugger
        throw error;
      }
      return null;
    }
  }, [topicId, queryProps, traceId, memo]);

  // Only fetch if the topic is not cached
  const query = useQuery<TAvailableTopic | null>({
    queryKey,
    staleTime, // Data validity period
    queryFn,
    enabled, // Disable query if already cached
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
      topic: cachedTopic ?? query.data,
      isCached,
      queryKey,
      queryUrlHash,
      queryClient,
      ...query,
    }),
    [cachedTopic, isCached, query, queryKey, queryUrlHash, queryClient],
  );
}
