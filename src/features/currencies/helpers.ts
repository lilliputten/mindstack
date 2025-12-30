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
