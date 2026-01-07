import React from 'react';
import { QueryKey, useQuery } from '@tanstack/react-query';

import { extraLongStaleTime } from '@/constants';
import { TCurrencyRatios } from '@/features/currencies';

import { getAllSubscriptionPrices } from '../actions/getAllSubscriptionPrices';
import { TPaidableSubscriptionType } from '../types';

const staleTime = extraLongStaleTime;

interface TParams {
  isReady?: boolean;
  subscriptionType: TPaidableSubscriptionType;
}
export function useAllSubscriptionPrices(params: TParams) {
  const { isReady = true, subscriptionType } = params;
  const queryKey: QueryKey = React.useMemo(
    () => ['AllSubscriptionPrices', subscriptionType],
    [subscriptionType],
  );

  const queryFn = React.useCallback(async () => {
    try {
      return await getAllSubscriptionPrices(subscriptionType);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[useAllSubscriptionPrices:queryFn] Error getting currency ratios', {
        error,
      });
      throw error;
    }
  }, [subscriptionType]);

  const query = useQuery<TCurrencyRatios | undefined>({
    queryKey,
    staleTime,
    queryFn,
    enabled: isReady !== false,
  });

  const prices = query.data;
  const loading = !query.isFetched || query.isLoading;

  return React.useMemo(
    () => ({
      prices,
      loading,
      queryKey,
      ...query,
    }),
    [prices, loading, queryKey, query],
  );
}
