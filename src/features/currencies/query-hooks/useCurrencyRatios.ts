import React from 'react';
import { QueryKey, useQuery } from '@tanstack/react-query';

import { extraLongStaleTime, yearlyFromMonthlyRatio } from '@/constants';

import { getAllCurrencyRatios } from '../actions';
import { calcAllPrices, stringifyPrices } from '../helpers';
import { allCurrencies, TCurrencyPrices, TCurrencyRatios } from '../types/shared-types';

const staleTime = extraLongStaleTime;

export function useCurrencyRatios() {
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
    // enabled: !!userId,
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

export function useAllPrices(basePrice: number) {
  const ratiosQuery = useCurrencyRatios();
  const { ratios } = ratiosQuery;
  const monthlyPrices = React.useMemo(() => calcAllPrices(basePrice, ratios), [basePrice, ratios]);
  const yearlyPrices = React.useMemo(() => {
    return allCurrencies.reduce<TCurrencyPrices>((yearlyPrices, currency) => {
      const price = monthlyPrices[currency] || 0;
      yearlyPrices[currency] = price * yearlyFromMonthlyRatio;
      return yearlyPrices;
    }, {} as TCurrencyPrices);
  }, [monthlyPrices]);
  const stringifiedMonthlyPrices = React.useMemo(
    () => stringifyPrices(monthlyPrices),
    [monthlyPrices],
  );
  const stringifiedYearlyPrices = React.useMemo(
    () => stringifyPrices(yearlyPrices),
    [yearlyPrices],
  );
  return {
    monthlyPrices,
    yearlyPrices,
    stringifiedMonthlyPrices,
    stringifiedYearlyPrices,
    ...ratiosQuery,
  };
}
