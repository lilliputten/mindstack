import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { TAvailableAnswersResultsQueryData } from '@/lib/types/react-query';
import { appendUrlQueries, composeUrlQuery } from '@/lib/helpers/urls';
import { TGetAvailableAnswerByIdParams } from '@/lib/zod-schemas';
import { defaultStaleTime } from '@/constants';
import { getAvailableAnswerById } from '@/features/answers/actions/getAvailableAnswerById';
import { TAvailableAnswer } from '@/features/answers/types';

interface TUseAvailableAnswerByIdProps extends TGetAvailableAnswerByIdParams {
  /** availableAnswersQueryKey - A query key from `useAvailableAnswers` */
  availableAnswersQueryKey?: QueryKey;
  enabled?: boolean;
  traceId?: string;
}

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

const staleTime = defaultStaleTime;

/** Get answer data from cached `useAvailableAnswers` query data or fetch it now */
export function useAvailableAnswerById(props: TUseAvailableAnswerByIdProps) {
  const queryClient = useQueryClient();
  // const invalidateKeys = useInvalidateReactQueryKeys();
  const { availableAnswersQueryKey, id: answerId, enabled = true, traceId, ...queryProps } = props;

  const memo = React.useMemo<TMemo>(() => ({}), []);

  /* Use partrial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);

  const queryKey = React.useMemo<QueryKey>(
    () => ['available-answer', answerId, queryUrlHash],
    [queryUrlHash, answerId],
  );

  // Check cached infinite query data first
  const availableAnswersData: TAvailableAnswersResultsQueryData | undefined =
    availableAnswersQueryKey &&
    queryClient.getQueryData<TAvailableAnswersResultsQueryData>(availableAnswersQueryKey);

  // Try to find the answer in cached infinite pages
  const cachedAnswer = availableAnswersData?.pages
    .flatMap((page) => page.items)
    .find((answer) => answer.id === answerId);

  const isCached = !!cachedAnswer;
  const isEnabled = enabled && !isCached;

  const queryFn = React.useCallback(async () => {
    const url = appendUrlQueries(`/api/answers/${answerId}`, queryUrlHash);

    try {
      const result = await Promise.race([
        getAvailableAnswerById({ id: answerId, ...queryProps }),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);

      return result;
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableAnswerById:queryFn]', traceId, message, { answerId, url });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableAnswerById:queryFn]', traceId, message, { answerId, url });
      } else {
        const details = error instanceof APIError ? error.details : null;
        const message = 'Cannot load answer data';
        // eslint-disable-next-line no-console
        console.error('[useAvailableAnswerById:queryFn]', traceId, message, {
          details,
          error,
          url,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
        throw error;
      }
      return null;
    }
  }, [answerId, queryProps, queryUrlHash, traceId, memo]);

  const query = useQuery<TAvailableAnswer | null>({
    queryKey,
    staleTime, // Data validity period
    queryFn,
    enabled: isEnabled, // Disable query if already cached
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
      answer: cachedAnswer ?? query.data,
      isCached,
      queryKey,
      queryUrlHash,
    }),
    [query, cachedAnswer, isCached, queryKey, queryUrlHash],
  );
}
