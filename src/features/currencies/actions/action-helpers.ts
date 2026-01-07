'use server';

import { getErrorText } from '@/lib/helpers';

import { TCurrencyType } from '../types/shared-types';
import { fetchExchangerateApiRatio, fetchTgStarRatio } from './currency-fetchers';

const derivedCurrencyFetchers: Record<TCurrencyType, () => Promise<number>> = {
  USD: async () => 1,
  RUB: fetchExchangerateApiRatio.bind(null, 'RUB'),
  EUR: fetchExchangerateApiRatio.bind(null, 'EUR'),
  TGSTAR: fetchTgStarRatio,
};

export async function fetchDerivedCurrencyRatio(currencyType: TCurrencyType): Promise<number> {
  const fetcher = derivedCurrencyFetchers[currencyType];
  if (!fetcher) {
    const error = new Error(`No fetcher defined for the currency "${currencyType}"`);
    // eslint-disable-next-line no-console
    console.error('[action-helpers:fetchDerivedCurrencyRatio]', error);
    throw error;
  }
  try {
    return await fetcher();
  } catch (error) {
    const message = `Failed fetching of the currency "${currencyType}"`;
    const details = getErrorText(error);
    const errStr = [message, details].join(': ');
    // eslint-disable-next-line no-console
    console.error('[action-helpers:fetchDerivedCurrencyRatio]', errStr, {
      message,
      details,
      error,
    });
    throw error;
  }
}
