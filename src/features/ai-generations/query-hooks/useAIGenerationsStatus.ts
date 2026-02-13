import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  AIGenerationError,
  AIGenerationErrorTexts,
  TAIGenerationErrorCode,
} from '@/lib/errors/AIGenerationError';
import { defaultStaleTime } from '@/constants';

import { getUserAIGenerationsStatus } from '../actions';
import { TAIGenerationsStatus, unlimitedGenerations } from '../types/TAIGenerationsStatus';

interface TMemo {
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

const staleTime = defaultStaleTime;

export const aiGenerationsStatusQueryKey: QueryKey = ['ai-generations-status'];

export function useAIGenerationsStatus({ traceId }: { traceId?: string } = {}) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const queryClient = useQueryClient();
  const [mounted, setMounted] = React.useState(false);

  const queryKey = aiGenerationsStatusQueryKey; // React.useMemo<QueryKey>(() => ['ai-generations-status'], []);

  const queryFn = React.useCallback(async (): Promise<TAIGenerationsStatus | undefined | null> => {
    try {
      const result = await Promise.race([
        getUserAIGenerationsStatus(),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);
      if (!result) {
        throw new Error('No generations status data received');
      }
      return result;
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useAIGenerationsStatus:queryFn]', traceId, message, { queryKey });
        return null;
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useAIGenerationsStatus:queryFn]', traceId, message, { queryKey });
        throw new Error('Query timed out');
      } else {
        const isAIGenerationError =
          error instanceof AIGenerationError ||
          (error instanceof Error && error.name === 'AIGenerationError');
        let message = 'Error getting generations status';
        if (isAIGenerationError) {
          const code = error.message as TAIGenerationErrorCode;
          message = AIGenerationErrorTexts[code] || code;
          // eslint-disable-next-line no-console
          console.warn('[useAIGenerationsStatus:queryFn] AIGenerationError', traceId, message, {
            code,
            error,
          });
          debugger; // eslint-disable-line no-debugger
        } else {
          // eslint-disable-next-line no-console
          console.error('[useAIGenerationsStatus:queryFn] Unexpected error', traceId, message, {
            error,
          });
          debugger; // eslint-disable-line no-debugger
        }
        throw new Error(message);
      }
    }
  }, [memo, queryKey, traceId]);

  const query = useQuery<TAIGenerationsStatus | undefined | null>({
    queryKey,
    staleTime,
    queryFn,
    enabled: mounted,
  });

  memo.query = query;

  React.useEffect(() => {
    const query = memo.query;
    if (query) {
      memo.mounted = true;
      setMounted(true);
      return () => {
        memo.mounted = false;
        setMounted(false);
        const { isFetching } = query;
        if (isFetching) {
          // Cleanup pending requests on unmount
          queryClient.cancelQueries({ queryKey, exact: true });
          // queryClient.resetQueries({ queryKey, exact: true });
          // queryClient.removeQueries({ queryKey, exact: true });
        }
      };
    }
  }, [memo, queryClient, queryKey]);

  const aiGenerationsStatus: TAIGenerationsStatus | undefined | null = query.data;
  const {
    availableGenerations, // number;
    usedGenerations, // number;
    generationMode, // TGenerationMode;
    role, // UserRoleType;
    grade, // UserGradeType;
    reasonCode, // TAIGenerationErrorCode;
  } = aiGenerationsStatus || {};

  const allowed =
    (!!availableGenerations && availableGenerations > 0) ||
    availableGenerations === unlimitedGenerations;
  const loading = !query.isFetched || query.isLoading;
  const error = query.error;

  return React.useMemo(() => {
    return {
      // Core properties...
      availableGenerations, // number;
      usedGenerations, // number;
      generationMode, // TGenerationMode;
      role, // UserRoleType;
      grade, // UserGradeType;
      reasonCode, // TAIGenerationErrorCode;
      // Calculated properties...
      allowed,
      loading,
      error,
      // Additional properties for abort and mount state
      isMounted: !!memo.mounted,
      isFetching: query.isFetching,
    };
  }, [
    availableGenerations, // number;
    usedGenerations, // number;
    generationMode, // TGenerationMode;
    role, // UserRoleType;
    grade, // UserGradeType;
    reasonCode, // TAIGenerationErrorCode;
    // Calculated properties...
    allowed,
    loading,
    error,
    memo.mounted,
    query.isFetching,
  ]);
}
