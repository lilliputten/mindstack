import { TCurrencyType } from '@/features/currencies/types';

/** Discount percent for the yearly paid plans */
export const yearlyDiscountPercents = 25;

/** Precalculated ratio, derived from the `yearlyDiscountPercents` */
export const yearlyFromMonthlyRatio = 12 * ((100 - yearlyDiscountPercents) / 100);

/** Monthly base (USD) price for PRO subsription plan */
export const proSubscirptionMonthlyBasePrice = 2; // In USD

/** PREMIUM subsription plan multiplier, see `getAllSubscriptionPrices` */
export const premiumSubscriptionMultiplier = 2;

/** Extra diviiders for specific currencies to calculate from base (USD) price.
 * See for the usage in `src/features/currencies/helpers.ts` (`calcPriceForCurrency`).
 */
export const customCurrencyRatios: Partial<Record<TCurrencyType, number>> = {
  RUB: 0.5,
  TGSTAR: 0.75,
};
