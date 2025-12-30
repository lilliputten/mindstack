import { initialRatios } from './action-constants';
import { getCachedCurrencyRatio } from './getCachedCurrencyRatio';
import { defaultCurrencyType, derivedCurrencies, TCurrencyRatios } from './shared-types';

export async function getAllCurrencyRatios() {
  const promisesList = derivedCurrencies.map((currency) => getCachedCurrencyRatio(currency));
  const settledList = await Promise.allSettled(promisesList);
  // Combine all the cached derived currency ratios with the default...
  const ratios = derivedCurrencies.reduce<Partial<TCurrencyRatios>>(
    (ratios, id, idx) => {
      // Combine all the derived ratios...
      const settledItem = settledList[idx];
      ratios[id] = (settledItem.status === 'fulfilled' && settledItem.value) || initialRatios[id];
      return ratios;
    },
    {
      // Start with default currency ratio...
      [defaultCurrencyType]: 1,
    },
  );
  console.log('[getAllCurrencyRatios] results', {
    promisesList,
    settledList,
    ratios,
  });
  debugger;
  // Return the full data (for all the currencies)
  return ratios as TCurrencyRatios;
}
