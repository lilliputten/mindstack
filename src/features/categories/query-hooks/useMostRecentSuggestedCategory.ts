'use client';

import React from 'react';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import {
  getMostRecentSuggestedCategory,
  TGetMostRecentSuggestedCategoryParams,
} from '@/features/categories/actions/getMostRecentSuggestedCategory';
import { TCategory } from '@/features/categories/types';

import { allowSuggestCategoriesIn } from '../constants';

interface TUseMostRecentSuggestedCategoryProps extends TGetMostRecentSuggestedCategoryParams {
  enabled?: boolean;
  traceId?: string;
}

/** Update cache once a period */
const staleTime = Math.round(allowSuggestCategoriesIn / 3);

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

/** Hook to fetch the most recent suggested category by the current user */
export function useMostRecentSuggestedCategory(
  props: TUseMostRecentSuggestedCategoryProps = {},
): UseQueryResult<TCategory | null, Error> {
  const { enabled = true, traceId, ...queryParams } = props;

  const queryClient = useQueryClient();

  const memo = React.useMemo<TMemo>(() => ({}), []);
  const queryKey = React.useMemo(
    () => ['most-recent-suggested-category', queryParams],
    [queryParams],
  );
  const queryFn = React.useCallback(async () => {
    try {
      const result = await Promise.race([
        getMostRecentSuggestedCategory(queryParams),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);
      return result;
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useMostRecentSuggestedCategory:queryFn]', traceId, message, {
          queryParams,
        });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useMostRecentSuggestedCategory:queryFn]', traceId, message, {
          queryParams,
        });
      } else {
        const message = 'Cannot load most recent suggested category';
        // eslint-disable-next-line no-console
        console.error('[useMostRecentSuggestedCategory:queryFn]', message, {
          traceId,
          error,
          queryParams,
        });
        debugger; // eslint-disable-line no-debugger
      }
      throw error;
    }
  }, [memo, queryParams, traceId]);

  const query = useQuery({
    enabled,
    queryKey,
    queryFn,
    staleTime,
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
      queryKey,
      queryClient,
      ...query,
    }),
    [query, queryClient, queryKey],
  );
}

export type TUseMostRecentSuggestedCategoryResult = ReturnType<
  typeof useMostRecentSuggestedCategory
>;
