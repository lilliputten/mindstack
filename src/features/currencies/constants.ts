import { hourMs } from '@/constants';

/*
 * The base unit is USD. All othe rea calculating from it using ratios.
 */

export const tgStarRatioUrl = 'https://bes-dev.github.io/telegram_stars_rates/api.json';
/* // Sample result
 * {
 *   "usdt_per_star": 0.015004658665884255,
 *   "ton_per_star": 0.009806966448290362,
 *   "usdt_per_ton": 1.53,
 *   "timestamp": "2025-12-26T12:10:30.730813+00:00",
 *   "transactions_analyzed": 100,
 *   "source": "fragment_blockchain_analysis",
 *   "rate_source": "coingecko",
 *   "last_updated": "2025-12-26T12:10:30.730813+00:00"
 * }%
 */

export const rubRatioUrl = 'https://api.exchangerate-api.com/v4/latest/RUB';
/* // Sample result
 * {
 *   "provider": "https://www.exchangerate-api.com",
 *   "WARNING_UPGRADE_TO_V6": "https://www.exchangerate-api.com/docs/free",
 *   "terms": "https://www.exchangerate-api.com/terms",
 *   "base": "RUB",
 *   "date": "2025-12-26",
 *   "time_last_updated": 1766707201,
 *   "rates": {
 *     "RUB": 1,
 *     ...
 *     "USD": 0.0128,
 *     ...
 *   }
 * }
 */

export const calcExtraRatios = {
  RUB: 1.5,
  TGSTAR: 1.2,
};

/** Update ratios once per 4 hours */
export const updateTimeout = hourMs * 4;
