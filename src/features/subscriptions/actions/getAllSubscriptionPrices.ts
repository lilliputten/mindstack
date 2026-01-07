import {
  premiumSubscriptionMultiplier,
  proSubscirptionMonthlyBasePrice,
  yearlyFromMonthlyRatio,
} from '@/constants/prices';
import {
  allCurrencies,
  calcPriceForCurrency,
  getAllCurrencyRatios,
  prettifyPrice,
  TCurrencyPrices,
} from '@/features/currencies';

import { parsePaidableSubscriptionType } from '../helpers/parsePaidableSubscriptionType';
import { paidableSubscriptionTypes, TPaidableSubscriptionType } from '../types/subscriptions';

export async function getAllPricesForSubscriptionTypeAndBasePrice(
  subscriptionType: TPaidableSubscriptionType,
  basePrice?: number,
) {
  if (basePrice == undefined) {
    return basePrice;
  }
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType);
  const ratios = await getAllCurrencyRatios();
  const prices = allCurrencies.reduce<TCurrencyPrices>((prices, currency) => {
    const ratio = ratios?.[currency];
    let price = calcPriceForCurrency(basePrice, ratio, currency);
    if (period === 'YEAR') {
      price = price * yearlyFromMonthlyRatio;
    }
    price = prettifyPrice(price) || 0;
    if (grade === 'PREMIUM') {
      // Don't prettify here -- we consider that `premiumSubscriptionMultiplier` will produce nice numbers
      price = price * premiumSubscriptionMultiplier;
    }
    prices[currency] = price;
    return prices;
  }, {} as TCurrencyPrices);
  return prices;
}

export function calculatePriceDifferencies(
  minuends: TCurrencyPrices,
  subtrahends: TCurrencyPrices,
) {
  const differencies = allCurrencies.reduce<TCurrencyPrices>(
    (differencies, currency) => {
      differencies[currency] -= subtrahends[currency];
      return differencies;
    },
    { ...minuends },
  );
  return differencies;
}

/** Get all prices for all curencies for given subscription type */
export async function getAllSubscriptionPrices(subscriptionType: TPaidableSubscriptionType) {
  if (!paidableSubscriptionTypes.includes(subscriptionType)) {
    // eslint-disable-next-line no-console
    console.warn('[getAllSubscriptionPrices]', 'Not a paidable subscription:', subscriptionType);
    return undefined;
  }
  const basePrice = proSubscirptionMonthlyBasePrice;
  return getAllPricesForSubscriptionTypeAndBasePrice(subscriptionType, basePrice);
}
