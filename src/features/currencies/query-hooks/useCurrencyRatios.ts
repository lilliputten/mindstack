import React from 'react';
import { QueryKey, useQuery } from '@tanstack/react-query';

import { extraLongStaleTime } from '@/constants';

import { getAllCurrencyRatios } from '../actions';
import { TCurrencyRatios } from '../types/shared-types';

const staleTime = extraLongStaleTime;

export function useCurrencyRatios({ isReady }: { isReady?: boolean } = {}) {
  const queryKey: QueryKey = React.useMemo(() => ['currency_ratios'], []);

  const queryFn = React.useCallback(async () => {
    try {
      return await getAllCurrencyRatios();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[useCurrencyRatios:queryFn] Error getting currency ratios', {
        error,
      });
      throw error;
    }
  }, []);

  const query = useQuery<TCurrencyRatios | undefined>({
    queryKey,
    staleTime,
    queryFn,
    enabled: isReady !== false,
  });

  const ratios = query.data;
  const loading = !query.isFetched || query.isLoading;

  return React.useMemo(
    () => ({
      ratios,
      loading,
      queryKey,
      ...query,
    }),
    [ratios, loading, queryKey, query],
  );
}
