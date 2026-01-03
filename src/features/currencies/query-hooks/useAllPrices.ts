import React from 'react';

import { yearlyFromMonthlyRatio } from '@/constants';

import { calcAllPrices, stringifyPrices } from '../helpers';
import {
  allCurrencies,
  TCurrencyPrices,
  TProcessCurrencyPricesOptions,
} from '../types/shared-types';
import { useCurrencyRatios } from './useCurrencyRatios';

export function useAllPrices(basePrice: number, opts: TProcessCurrencyPricesOptions = {}) {
  const {
    // prettify,
    isReady,
  } = opts;
  const ratiosQuery = useCurrencyRatios({ isReady });
  const { ratios } = ratiosQuery;
  const basePrices = React.useMemo(() => {
    return calcAllPrices(basePrice, ratios);
  }, [basePrice, ratios]);
  const monthlyPrices = basePrices;
  /*
   * const monthlyPrices = React.useMemo(() => {
   *   return prettify ? prettifyPrices(basePrices) : basePrices;
   * }, [basePrices, prettify]);
   */
  const yearlyPrices = React.useMemo(() => {
    return allCurrencies.reduce<TCurrencyPrices>((yearlyPrices, currency) => {
      const price = basePrices[currency] || 0;
      const yearlyPrice = price * yearlyFromMonthlyRatio;
      /*
       * if (prettify) {
       *   yearlyPrice = prettifyPrice(yearlyPrice);
       * }
       */
      /* // DEBUG
       * // prettier-ignore
       * console.log('[useCurrencyRatios:useAllPrices:yearlyPrice]', currency, prettify, ':', price, '->', yearlyPrice);
       */
      yearlyPrices[currency] = yearlyPrice;
      return yearlyPrices;
    }, {} as TCurrencyPrices);
  }, [basePrices]);
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
