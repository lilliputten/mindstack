'use server';

import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';

import {
  initialRatios,
  revalidateTimeout,
  updateTimeout,
  updatingTimeout,
} from './action-constants';
import { fetchDerivedCurrencyRatio } from './action-helpers';
import { defaultCurrencyType, TCurrencyType } from './shared-types';

export async function getCurrencyRatio(currencyType: TCurrencyType) {
  if (currencyType === defaultCurrencyType) {
    return 1;
  }
  try {
    const now = new Date();
    const nowTime = now.getTime();

    // Get the currency record from the database
    const currencyRecord = await prisma.currency.findUnique({
      where: { type: currencyType },
    });

    if (currencyRecord) {
      // Check if we should return the cached ratio
      const isUpdatedRecently = nowTime - currencyRecord.updatedAt.getTime() < updateTimeout;
      const isUpdatingRecently =
        currencyRecord.updatingSince &&
        nowTime - currencyRecord.updatingSince.getTime() < updatingTimeout;
      if (isUpdatedRecently || isUpdatingRecently) {
        return currencyRecord.ratio;
      }
    }

    // Set updatingSince to current datetime to indicate an update is in progress
    await prisma.currency.update({
      where: { type: currencyType },
      data: { updatingSince: now },
    });

    // Try to retrieve (and then store for future use and return) the value from the API
    try {
      const ratio = await fetchDerivedCurrencyRatio(currencyType);
      console.log('[getCachedCurrencyRatio] fetchDerivedCurrencyRatio', {
        ratio,
        currencyType,
      });
      debugger;
      await prisma.currency.update({
        where: { type: currencyType },
        data: {
          ratio,
          updatedAt: now,
          updatingSince: null,
        },
      });
      /* // UNUSED (as unneeded due to the `revalidate` parameter: Revalidate the cache for this currency on successful update
       * revalidateTag(`currency-${currencyType}`);
       */
      return ratio;
    } catch (error) {
      const errMsg = getErrorText(error);
      // eslint-disable-next-line no-console
      console.warn('[getCachedCurrencyRatio]', errMsg, {
        error,
        currencyType,
      });
      debugger; // eslint-disable-line no-debugger
      // Reset updatingSince
      await prisma.currency.update({
        where: { type: currencyType },
        data: { updatingSince: null },
      });
      // NOTE: Don't re-throw errors as it's a non-critical code
    }

    // Otherwise return old or inital ratio;
    return currencyRecord?.ratio || initialRatios[currencyType];
  } catch (error) {
    const message = `Failed geting the currency "${currencyType}"`;
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[getCachedCurrencyRatio]', message, errMsg, {
      error,
      currencyType,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(message);
  }
}

// Cached version: unique key/tag per currency
export const getCachedCurrencyRatio = async (currency: TCurrencyType) => {
  const cachedFn = unstable_cache(
    async () => getCurrencyRatio(currency),
    [`currency-${currency}`], // Unique key per currency type
    {
      tags: [`currency-${currency}`], // Unique tag per currency for revalidation
      revalidate: revalidateTimeout, // Optional: auto-revalidate after 1 hour
    },
  );
  return cachedFn();
};
