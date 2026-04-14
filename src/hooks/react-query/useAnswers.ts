import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { handleApiResponse } from '@/lib/api';
import { useInvalidateReactQueryKeys } from '@/lib/data/invalidateReactQueryKeys';
import { defaultStaleTime } from '@/constants';
import { TAnswerData } from '@/features/answers/types';

interface UseAnswersOptions {
  questionId?: string;
  enabled?: boolean;
  traceId?: string;
}

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

const staleTime = defaultStaleTime;

export function useAnswers({ questionId, enabled = true, traceId }: UseAnswersOptions) {
  const invalidateKeys = useInvalidateReactQueryKeys();
  const queryClient = useQueryClient();
  const memo = React.useMemo<TMemo>(() => ({}), []);

  const queryKey: QueryKey = React.useMemo(() => ['answers', questionId], [questionId]);

  const queryFn = React.useCallback(async () => {
    if (!questionId) return [];
    const url = `/api/questions/${questionId}/answers`;

    try {
      const result = await Promise.race([
        handleApiResponse<TAnswerData[]>(fetch(url), {
          debugDetails: { initiator: 'useAnswers', url },
          onInvalidateKeys: invalidateKeys,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);

      if (result.ok && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useAnswers:queryFn]', traceId, message, { questionId, url });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useAnswers:queryFn]', traceId, message, { questionId, url });
      } else {
        const details = error instanceof APIError ? error.details : null;
        const message = 'Cannot load answers';
        // eslint-disable-next-line no-console
        console.error('[useAnswers:queryFn]', traceId, message, {
          details,
          error,
          questionId,
          url,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
        throw error;
      }
      return null;
    }
  }, [questionId, invalidateKeys, traceId, memo]);

  const query = useQuery({
    queryKey,
    enabled: enabled && !!questionId,
    staleTime,
    retry: 1,
    queryFn,
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
      ...query,
      queryKey,
    }),
    [query, queryKey],
  );
}
