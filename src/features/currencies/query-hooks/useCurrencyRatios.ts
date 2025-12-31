import React from 'react';
import { QueryKey, useQuery } from '@tanstack/react-query';

import { extraLongStaleTime, yearlyFromMonthlyRatio } from '@/constants';

import { getAllCurrencyRatios } from '../actions';
import { calcAllPrices, prettifyPrice, prettifyPrices, stringifyPrices } from '../helpers';
import { allCurrencies, TCurrencyPrices, TCurrencyRatios } from '../types/shared-types';

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

interface TAllPricesOptions {
  prettify?: boolean;
  isReady?: boolean;
}

export function useAllPrices(basePrice: number, opts: TAllPricesOptions = {}) {
  const { prettify, isReady } = opts;
  const ratiosQuery = useCurrencyRatios({ isReady });
  const { ratios } = ratiosQuery;
  const basePrices = React.useMemo(() => {
    return calcAllPrices(basePrice, ratios);
  }, [basePrice, ratios]);
  const monthlyPrices = React.useMemo(() => {
    return prettify ? prettifyPrices(basePrices) : basePrices;
  }, [basePrices, prettify]);
  const yearlyPrices = React.useMemo(() => {
    return allCurrencies.reduce<TCurrencyPrices>((yearlyPrices, currency) => {
      const price = basePrices[currency] || 0;
      let yearlyPrice = price * yearlyFromMonthlyRatio;
      if (prettify) {
        yearlyPrice = prettifyPrice(yearlyPrice, currency);
      }
      /* // DEBUG
       * // prettier-ignore
       * console.log('[useCurrencyRatios:useAllPrices:yearlyPrice]', currency, prettify, ':', price, '->', yearlyPrice);
       */
      yearlyPrices[currency] = yearlyPrice;
      return yearlyPrices;
    }, {} as TCurrencyPrices);
  }, [basePrices, prettify]);
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
