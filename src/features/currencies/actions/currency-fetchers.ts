import { getErrorText } from '@/lib/helpers';
import { secondMs } from '@/constants';

const timeoutDuration = secondMs * 30;

type TExchangerateApiCurrencyId = 'RUB' | 'EUR';

/** Fetch generalized currnecy via api.
 * NOTE: It's possible to fetch all the currencies in a reversed api:
 * Retrieving the USD endpoint and fetch the required currencies from the `rates` object, and use the `1/ratio` formula.
 */
export async function fetchExchangerateApiRatio(
  apiCurrencyId: TExchangerateApiCurrencyId,
): Promise<number> {
  const apiUrl = `https://api.exchangerate-api.com/v4/latest/${apiCurrencyId}`;
  let res: Response | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any | unknown;
  try {
    res = await fetch(apiUrl, {
      signal: AbortSignal.timeout(timeoutDuration), // Automatically aborts after duration
    });
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
    if (!res.ok) throw new Error('The exchangerate-api endpoint is unavailable');
    data = await res.json();
    value = data?.rates?.USD;
    if (!value || isNaN(value)) {
      throw new Error(`RUB ratio is not a number: ${value}`);
    }
    return Number(value);
  } catch (error) {
    const message = 'RUB ratio fetch failed';
    const details = getErrorText(error);
    const errStr = [message, details].join(': ');
    // eslint-disable-next-line no-console
    console.error('[currency-fetchers:fetchExchangerateApiRatio]', errStr, {
      message,
      details,
      error,
      res,
      data,
      value,
      apiUrl,
      apiCurrencyId,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}

export async function fetchTgStarRatio(): Promise<number> {
  let res: Response | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any | unknown;
  const apiUrl = 'https://bes-dev.github.io/telegram_stars_rates/api.json';
  try {
    res = await fetch(apiUrl, {
      signal: AbortSignal.timeout(timeoutDuration), // Automatically aborts after duration
    });
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
    if (!res.ok) throw new Error('The TGSTAR API endpoint is unavailable');
    data = await res.json();
    value = data.usdt_per_star;
    if (!value || isNaN(value)) {
      throw new Error(`TGSTAR ratio is not a number: ${value}`);
    }
    return Number(value);
  } catch (error) {
    const message = 'TGSTAR ratio fetch failed';
    const details = getErrorText(error);
    const errStr = [message, details].join(': ');
    // eslint-disable-next-line no-console
    console.error('[currency-fetchers:fetchTgStarRatio]', errStr, {
      message,
      details,
      error,
      res,
      data,
      value,
      apiUrl,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
