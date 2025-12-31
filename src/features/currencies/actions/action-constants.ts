import { hourMs, minuteMs } from '@/constants';

import { TCurrencyType } from '../types/shared-types';

/*
 * The base unit is USD. All other consider as derived and calculated from the base using ratios.
 */

/** Default ratios, as on 2025.12
 *
 * RUB: 0.0128
 * EUR: 1.18
 * TGSTAR: 0.015
 *
 * ->
 *
 *  1 USD = 78 RUB
 *  1 USD = 67 TGSTAR
 */
export const initialRatios: Record<TCurrencyType, number> = {
  USD: 1,
  EUR: 1.18,
  RUB: 0.0128,
  TGSTAR: 0.015,
};

/** Update ratios once per 4 hours */
export const updateTimeout = hourMs * 4;
/** Time to allow currency fetching process */
export const updatingTimeout = minuteMs * 5;
/** Caching time for next cache */
export const revalidateTimeout = hourMs;
