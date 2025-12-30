import { getErrorText } from '@/lib/helpers';

const tgStarRatioUrl = 'https://bes-dev.github.io/telegram_stars_rates/api.json';
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

const rubRatioUrl = 'https://api.exchangerate-api.com/v4/latest/RUB';
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
