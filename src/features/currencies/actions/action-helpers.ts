'use server';

import { getErrorText } from '@/lib/helpers';

import { fetchRubRatio, fetchTgStarRatio } from './currency-fetchers';
import { TCurrencyType } from './shared-types';

const derivedCurrencyFetchers: Partial<Record<TCurrencyType, () => Promise<number>>> = {
  RUB: fetchRubRatio,
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
