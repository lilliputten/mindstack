'use server';

import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';
import { epochStartDate } from '@/constants';

import { defaultCurrencyType, TCurrencyType } from '../types/shared-types';
import {
  initialRatios,
  revalidateTimeout,
  updateTimeout,
  updatingTimeout,
} from './action-constants';
import { fetchDerivedCurrencyRatio } from './action-helpers';

export async function getCurrencyRatio(currencyType: TCurrencyType) {
  if (currencyType === defaultCurrencyType) {
    return 1;
  }

  const defaultRatio = initialRatios[currencyType];

  try {
    const now = new Date();
    const nowTime = now.getTime();

    // Get the currency record from the database
    let currencyRecord = await prisma.currency.findUnique({
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
    currencyRecord = await prisma.currency.upsert({
      where: { type: currencyType },
      update: { updatingSince: now },
      create: {
        type: currencyType,
        ratio: defaultRatio,
        updatingSince: now,
        updatedAt: epochStartDate,
      },
    });

    // Try to retrieve (and then store for future use and return) the value from the API
    try {
      const ratio = await fetchDerivedCurrencyRatio(currencyType);
      await prisma.currency.upsert({
        where: { type: currencyType },
        update: {
          ratio,
          updatedAt: now,
          updatingSince: null,
        },
        create: {
          type: currencyType,
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
      await prisma.currency.upsert({
        where: { type: currencyType },
        update: { updatingSince: null },
        create: {
          type: currencyType,
          ratio: initialRatios[currencyType],
          updatedAt: new Date(),
          updatingSince: null,
        },
      });
      // NOTE: Don't re-throw errors as it's a non-critical code
    }

    // Otherwise return old or inital ratio;
    return currencyRecord?.ratio || defaultRatio;
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
    [`currency-${currency}`, 'currencies'], // Unique key per currency type
    {
      tags: [`currency-${currency}`, 'currencies'], // Unique tag per currency for revalidation
      revalidate: Math.round(revalidateTimeout / 1000), // Optional: auto-revalidate after 1 hour, in seconds
    },
  );
  return cachedFn();
};
