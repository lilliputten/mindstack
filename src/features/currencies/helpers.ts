import { customCurrencyRatios } from '@/constants/prices';

import {
  allCurrencies,
  defaultCurrencyType,
  TCurrencyPrices,
  TCurrencyRatios,
  TCurrencyStrings,
  TCurrencyType,
} from './types';

export type TCalcCurrencyOptions = {
  // round?: 'decimals' | 'pretty';
  // Don't show zero, always show a minimal value
  noZero?: boolean;
};

const defaultCalcCurrencyOptions: Partial<Record<TCurrencyType, TCalcCurrencyOptions>> = {
  // USD: { round: 'pretty' },
  // EUR: { round: 'pretty' },
  // RUB: { round: 'pretty' },
  // TGSTAR: { round: 'pretty' },
};

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

export function prettifyPrice(price: number = 0, currency: TCurrencyType = defaultCurrencyType) {
  let value = price;
  // Get required options...
  const opts = defaultCalcCurrencyOptions[currency] || {};
  const { noZero } = opts;
  // Analyze the number...
  const intVal = Math.round(price);
  // const isInt = intVal === price;
  const intValStr = String(intVal);
  const intSize = intValStr.length;
  // Prettify...
  if (intSize > 1) {
    const zerableDecimalPositions = intSize > 2 ? Math.min(3, Math.round(intSize / 2)) : 0;
    const zerableBase = zerableDecimalPositions ? Math.pow(10, zerableDecimalPositions) : 5;
    value = Math.round(value / zerableBase) * zerableBase;
    if (!value && noZero) {
      value = zerableBase;
    }
  } else {
    // Keep 2 fixed digits after floating point
    value = Math.round(value * 10) / 10;
    if (!value && noZero) {
      value = 10;
    }
  }
  /* // DEBUG
   * if (price) {
   *   console.log('[helpers:prettifyPrice]', currency, 'done :', price, '->', value);
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
  return price;
}

export function calcAllPrices(basePrice: number, ratios?: TCurrencyRatios): TCurrencyPrices {
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
  const decimals = !isInt && intVal < 10 ? 2 : 0;
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
    prettifiedPrices[currency] = prettifyPrice(prices[currency], currency);
    return prettifiedPrices;
  }, {} as TCurrencyPrices);
  return prettifiedPrices;
}
