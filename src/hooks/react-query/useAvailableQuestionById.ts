import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { TAvailableQuestionsResultsQueryData } from '@/lib/types/react-query';
import { stringifyQueryKey } from '@/lib/helpers/react-query';
import { composeUrlQuery } from '@/lib/helpers/urls';
import { TGetAvailableQuestionByIdParams } from '@/lib/zod-schemas';
import { defaultStaleTime } from '@/constants';
import { getAvailableQuestionById } from '@/features/questions/actions';
import { TAvailableQuestion } from '@/features/questions/types';

interface TUseAvailableQuestionByIdProps extends TGetAvailableQuestionByIdParams {
  /** availableQuestionsQueryKey - A query key from `useAvailableQuestions` */
  availableQuestionsQueryKey?: QueryKey;
  traceId?: string;
}

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

const staleTime = defaultStaleTime;

/** Get question data from cached `useAvailableQuestions` query data or fetch it now */
export function useAvailableQuestionById(props: TUseAvailableQuestionByIdProps) {
  const queryClient = useQueryClient();
  const { availableQuestionsQueryKey, id: questionId, traceId, ...queryProps } = props;

  const memo = React.useMemo<TMemo>(() => ({}), []);

  /* Use partrial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);

  const queryKey = React.useMemo<QueryKey>(
    () => ['available-question', questionId, queryUrlHash],
    [queryUrlHash, questionId],
  );
  const queryHash = stringifyQueryKey(queryKey);

  // Check cached infinite query data first
  const availableQuestionsData: TAvailableQuestionsResultsQueryData | undefined =
    availableQuestionsQueryKey &&
    queryClient.getQueryData<TAvailableQuestionsResultsQueryData>(availableQuestionsQueryKey);

  // Try to find the question in cached infinite pages
  const cachedQuestion = availableQuestionsData?.pages
    .flatMap((page) => page.items)
    .find((question) => question.id === questionId);

  const isCached = !!cachedQuestion;
  const enabled = !!questionId && !isCached; // Disable query if no ID or already cached

  const queryFn = React.useCallback(async () => {
    try {
      const result = await Promise.race([
        getAvailableQuestionById({ id: questionId, ...queryProps }),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);

      return result;
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableQuestionById:queryFn]', traceId, message, {
          queryHash,
          questionId,
        });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useAvailableQuestionById:queryFn]', traceId, message, {
          queryHash,
          questionId,
        });
      } else {
        const details = error instanceof APIError ? error.details : null;
        const message = 'Cannot load question data';
        // eslint-disable-next-line no-console
        console.error('[useAvailableQuestionById:queryFn]', traceId, message, {
          queryHash,
          queryKey,
          details,
          error,
          queryProps,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
        throw error;
      }
      return null;
    }
  }, [questionId, queryProps, queryHash, queryKey, traceId, memo]);

  // Only fetch if the question is not cached
  const query = useQuery<TAvailableQuestion | null>({
    queryKey,
    staleTime, // Data validity period
    queryFn,
    enabled, // Disable query if no ID or already cached
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

  return React.useMemo(() => {
    return {
      ...query,
      questionId,
      queryKey,
      queryUrlHash,
      isLoading: query.isLoading,
      question: cachedQuestion ?? query.data,
      isCached,
    };
  }, [cachedQuestion, isCached, query, queryKey, queryUrlHash, questionId]);
}
