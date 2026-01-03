import { customCurrencyRatios } from '@/constants/prices';

import {
  allCurrencies,
  defaultCurrencyType,
  TCurrencyPrices,
  TCurrencyRatios,
  TCurrencyStrings,
  TCurrencyType,
} from './types';

/* UNSED: Options
 * export type TCalcCurrencyOptions = {
 *   // round?: 'decimals' | 'pretty';
 *   // Don't show zero, always show a minimal value
 *   noZero?: boolean;
 * };
 * const defaultCalcCurrencyOptions: Partial<Record<TCurrencyType, TCalcCurrencyOptions>> = {
 *   // USD: { round: 'pretty' },
 *   // EUR: { round: 'pretty' },
 *   // RUB: { round: 'pretty' },
 *   // TGSTAR: { round: 'pretty' },
 * };
 */

function calcCurrencyFromBase(
  basePrice: number,
  ratio?: number,
  _currency: TCurrencyType = defaultCurrencyType,
) {
  if (!basePrice || !ratio) {
    return 0;
  }
  return basePrice / ratio;
}

export function prettifyPrice(price?: number) {
  if (price == undefined) {
    return undefined;
  }
  let value = price;
  // Analyze the number...
  const intVal = Math.round(value);
  const intValStr = String(intVal);
  const intSize = intValStr.length;
  // Prettify...
  if (intSize > 1) {
    const zerableDecimalPositions = intSize > 2 ? Math.min(3, Math.round(intSize / 2)) : 0;
    const zerableBase = zerableDecimalPositions ? Math.pow(10, zerableDecimalPositions) : 5;
    value = Math.round(value / zerableBase) * zerableBase;
  } else {
    // Keep 2 fixed digits after floating point
    value = Math.round(value * 10) / 10;
  }
  /* // DEBUG
   * if (price) {
   *   console.log('[helpers:prettifyPrice] done :', price, '->', value);
   * }
   */
  return value;
}

export function calcPriceForCurrency(
  basePrice: number,
  ratio?: number,
  currency: TCurrencyType = defaultCurrencyType,
) {
  if (ratio && customCurrencyRatios[currency]) {
    ratio /= customCurrencyRatios[currency];
  }
  const price = calcCurrencyFromBase(basePrice, ratio, currency);
  return prettifyPrice(price) || 0;
}

export function calcAllCurrenciesFromBasePrice(
  basePrice: number,
  ratios?: TCurrencyRatios,
): TCurrencyPrices {
  const prices = allCurrencies.reduce<TCurrencyPrices>((prices, currency) => {
    const ratio = ratios?.[currency];
    const price = calcPriceForCurrency(basePrice, ratio, currency);
    prices[currency] = price;
    return prices;
  }, {} as TCurrencyPrices);
  return prices;
}

export function stringifyPrice(price: number = 0) {
  const intVal = Math.round(price);
  const isInt = intVal === price;
  const decimals = isInt ? 0 : 2;
  const result = decimals ? price.toFixed(decimals) : String(intVal);
  return result;
}

export function stringifyPrices(prices: TCurrencyPrices): TCurrencyStrings {
  const strings = allCurrencies.reduce<TCurrencyStrings>((strings, currency) => {
    strings[currency] = stringifyPrice(prices[currency]);
    return strings;
  }, {} as TCurrencyStrings);
  return strings;
}

export function prettifyPrices(prices: TCurrencyPrices): TCurrencyPrices {
  const prettifiedPrices = allCurrencies.reduce<TCurrencyPrices>((prettifiedPrices, currency) => {
    prettifiedPrices[currency] = prettifyPrice(prices[currency]) || 0;
    return prettifiedPrices;
  }, {} as TCurrencyPrices);
  return prettifiedPrices;
}
