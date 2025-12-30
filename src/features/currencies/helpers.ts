import { allCurrencies, defaultCurrencyType, TCurrencyRatios, TCurrencyType } from './actions';

export type TCalcCurrencyOptions = {
  roundHunderds?: boolean;
  roundDecimals?: boolean;
  round?: boolean;
  noZero?: boolean;
};

export function calcCurrencyFromUsd(
  basePrice: number,
  ratio?: number,
  opts: TCalcCurrencyOptions = {},
) {
  if (!basePrice || !ratio) {
    return 0;
  }
  let value = basePrice / ratio;
  if (opts.roundHunderds) {
    value = Math.round(value / 100) * 100;
    if (!value && opts.noZero) {
      value = 100;
    }
  } else if (opts.round) {
    value = Math.round(value);
    if (!value && opts.noZero) {
      value = 1;
    }
  } else if (opts.roundDecimals) {
    value = Math.round(value * 100) / 100;
    if (!value && opts.noZero) {
      value = 0.01;
    }
  }
  return value;
}

const defaultCalcCurrencyOptions: Record<TCurrencyType, TCalcCurrencyOptions> = {
  USD: { round: true },
  EUR: { round: true },
  RUB: { roundHunderds: true },
  TGSTAR: { roundHunderds: true },
};

export function calcPriceForCurrency(
  basePrice: number,
  ratio?: number,
  currency: TCurrencyType = defaultCurrencyType,
) {
  const opts = defaultCalcCurrencyOptions[currency];
  return calcCurrencyFromUsd(basePrice, ratio, opts);
}

export function calcAllPrices(basePrice: number, ratios?: TCurrencyRatios) {
  const prices = allCurrencies.reduce<Partial<TCurrencyRatios>>((prices, currency) => {
    const ratio = ratios?.[currency];
    const price = calcPriceForCurrency(basePrice, ratio, currency);
    prices[currency] = price;
    return prices;
  }, {});
  return prices as TCurrencyRatios;
}
