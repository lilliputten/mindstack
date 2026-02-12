import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

import { TAllUsedKeys } from '@/lib/types/react-query';
import { stringifyQueryKey } from '@/lib/helpers/react-query';
import { getAvailableQuestionsIdsForTopicId } from '@/features/questions/actions/getAvailableQuestionsIdsForTopicId';
import { TTopicId } from '@/features/topics/types';

interface TUseQuestionIdsForTopicIdProps {
  topicId?: TTopicId;
  traceId?: string;
}

const allUsedKeys: TAllUsedKeys = {};

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

export function useQuestionIdsForTopicId({ topicId, traceId }: TUseQuestionIdsForTopicIdProps) {
  const queryKey: QueryKey = React.useMemo(
    () => ['available-questions-ids-for-topic', topicId],
    [topicId],
  );
  allUsedKeys[stringifyQueryKey(queryKey)] = queryKey;

  const queryClient = useQueryClient();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const queryFn = React.useCallback(async () => {
    try {
      const result = await Promise.race([
        topicId ? getAvailableQuestionsIdsForTopicId(topicId) : Promise.resolve([]),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);
      return result;
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useQuestionIdsForTopicId:queryFn]', traceId, message, { topicId });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useQuestionIdsForTopicId:queryFn]', traceId, message, { topicId });
      } else {
        const message = 'Cannot load question IDs';
        // eslint-disable-next-line no-console
        console.error('[useQuestionIdsForTopicId:queryFn]', message, {
          traceId,
          error,
          topicId,
        });
        debugger; // eslint-disable-line no-debugger
      }
      throw error;
    }
  }, [memo, topicId, traceId]);

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: !!topicId,
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

  return {
    ...query,
    questionIds: query.data,
    queryKey,
    allUsedKeys,
  };
}
