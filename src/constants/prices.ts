import { TCurrencyType } from '@/features/currencies/types';

/** Discount percent for the yearly paid plans */
export const yearlyDiscountPercents = 25;

/** Precalculated ratio, derived from the `yearlyDiscountPercents` */
export const yearlyFromMonthlyRatio = 12 * ((100 - yearlyDiscountPercents) / 100);

/** Monthly base (USD) price for PRO subsription plan */
export const PRO_MONTHLY_USD_PRICE = 2;

/** Monthly base (USD) price for PREMIUM subsription plan */
export const PREMIUM_MONTHLY_USD_PRICE = 4;

/* // NOTE: Yearly prices are calculating in the `useCurrencyRatios` hook
 * export const PRO_YEARLY_USD_PRICE = Math.round(PRO_MONTHLY_USD_PRICE * yearlyFromMonthlyRatio);
 * export const PREMIUM_YEARLY_USD_PRICE = Math.round(PREMIUM_MONTHLY_USD_PRICE * yearlyFromMonthlyRatio);
 */

/** Extra diviiders for specific currencies to calculate from base (USD) price.
 * See for the usage in `src/features/currencies/helpers.ts` (`calcPriceForCurrency`).
 */
export const customCurrencyRatios: Partial<Record<TCurrencyType, number>> = {
  RUB: 0.5,
  TGSTAR: 0.75,
};
