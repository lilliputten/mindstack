/* // Sample code:
fetch(tgStarRatioUrl)
  .then((r) => r.json())
  .then((data) => console.log(1 / data.usdt_per_star + ' Stars per USD'));
fetch(rubRatioUrl)
  .then((r) => r.json())
  .then((data) => console.log(`1 RUB = ${data.rates.USD} USD`));
*/

import { getErrorText } from '@/lib/helpers';

import { rubRatioUrl, tgStarRatioUrl } from './constants';

export type TCurrencyRatios = {
  rubRatio: number;
  tgStarRatio: number;
};

export async function fetchRubRatio(): Promise<number> {
  let res: Response | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any | unknown;
  try {
    res = await fetch(rubRatioUrl);
    if (!res.ok) throw new Error('RUB API unavailable');
    data = await res.json();
    value = data.usdt_per_star;
    if (!value || isNaN(value)) {
      throw new Error('RUB ratio is not a number: ${value}');
    }
    return Number(value);
  } catch (error) {
    const message = 'RUB ratio fetch failed';
    const details = getErrorText(error);
    const errStr = [message, details].join(': ');
    // eslint-disable-next-line no-console
    console.error('[src/features/currencies/helpers:fetchRubRatio]', errStr, {
      message,
      details,
      error,
      res,
      data,
      value,
    });
    throw error;
  }
}

export async function fetchTgStarRatio(): Promise<number> {
  let res: Response | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any | unknown;
  try {
    res = await fetch(tgStarRatioUrl);
    if (!res.ok) throw new Error('TGSTAR API unavailable');
    data = await res.json();
    value = data.usdt_per_star;
    if (!value || isNaN(value)) {
      throw new Error('TGSTAR ratio is not a number: ${value}');
    }
    return Number(value);
  } catch (error) {
    const message = 'TGSTAR ratio fetch failed';
    const details = getErrorText(error);
    const errStr = [message, details].join(': ');
    // eslint-disable-next-line no-console
    console.error('[src/features/currencies/helpers:fetchTgStarRatio]', errStr, {
      message,
      details,
      error,
      res,
      data,
      value,
    });
    throw error;
  }
}

export async function fetchCurrencyRatios(): Promise<TCurrencyRatios> {
  try {
    const [rubRatio, tgStarRatio] = await Promise.all([fetchRubRatio(), fetchTgStarRatio()]);
    return {
      rubRatio,
      tgStarRatio,
    };
  } catch (error) {
    const message = 'Price ratios fetch failed';
    const details = getErrorText(error);
    const errStr = [message, details].join(': ');
    // eslint-disable-next-line no-console
    console.error('[src/features/currencies/helpers:fetchCurrencyRatios]', errStr, {
      message,
      details,
      error,
    });
    throw error;
  }
}

/* On 2025.12.26:
 *
 * tgStarRatio: 0.015
 * rubRatio: 0.0128
 *
 * ->
 *
 *  1 USD = 67 TGSTAR
 *  1 USD = 78 RUB
 */

export type TCalcCurrencyOptions = {
  roundHunderds?: boolean;
  roundDecimals?: boolean;
  round?: boolean;
  noZero?: boolean;
};

export function calcCurrencyFromUsd(
  usdPrice: number,
  ratio: number,
  opts: TCalcCurrencyOptions = {},
) {
  let value = usdPrice / ratio;
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
