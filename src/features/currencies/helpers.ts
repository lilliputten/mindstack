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
  roundHunderds?: boolean;
  roundTens?: boolean;
  round?: boolean;
  roundDecimals?: boolean;
  // Don't show zero, always show a minimal value
  noZero?: boolean;
};

const defaultCalcCurrencyOptions: Record<TCurrencyType, TCalcCurrencyOptions> = {
  USD: { roundDecimals: true },
  EUR: { roundDecimals: true },
  RUB: { roundHunderds: true },
  TGSTAR: { roundHunderds: true },
};

function calcCurrencyFromBase(basePrice: number, ratio?: number, opts: TCalcCurrencyOptions = {}) {
  if (!basePrice || !ratio) {
    return 0;
  }
  let value = basePrice / ratio;
  if (opts.roundHunderds) {
    value = Math.round(value / 100) * 100;
    if (!value && opts.noZero) {
      value = 100;
    }
  } else if (opts.roundTens) {
    value = Math.round(value * 10) / 10;
    if (!value && opts.noZero) {
      value = 10;
    }
  } else if (opts.round) {
    value = Math.round(value);
    if (!value && opts.noZero) {
      value = 1;
    }
  } else if (opts.roundDecimals) {
    value = Math.round(value * 10) / 10;
    if (!value && opts.noZero) {
      value = 10;
    }
  }
  return value;
}

export function calcPriceForCurrency(
  basePrice: number,
  ratio?: number,
  currency: TCurrencyType = defaultCurrencyType,
) {
  const opts = defaultCalcCurrencyOptions[currency];
  if (ratio && customCurrencyRatios[currency]) {
    ratio /= customCurrencyRatios[currency];
  }
  const price = calcCurrencyFromBase(basePrice, ratio, opts);
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

export function stringifyPrice(price: number = 0, _currency: TCurrencyType = defaultCurrencyType) {
  const intVal = Math.round(price);
  const isInt = intVal === price;
  const decimals = !isInt && intVal < 10 ? 2 : 0;
  const result = decimals ? price.toFixed(decimals) : String(intVal);
  return result;
}

export function stringifyPrices(prices: TCurrencyPrices): TCurrencyStrings {
  const strings = allCurrencies.reduce<TCurrencyStrings>((strings, currency) => {
    strings[currency] = stringifyPrice(prices[currency], currency);
    return strings;
  }, {} as TCurrencyStrings);
  return strings;
}
