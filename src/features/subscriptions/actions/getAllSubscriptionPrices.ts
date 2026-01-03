import { calcAllPrices, getAllCurrencyRatios } from '@/features/currencies';

import { getBaseSubscriptionPlanPrice } from '../helpers';
import { parsePaidableSubscriptionType } from '../helpers/parsePaidableSubscriptionType';
import { paidableSubscriptionTypes, TPaidableSubscriptionType } from '../types/subscriptions';

export async function getAllSubscriptionPrices(subscriptionType: TPaidableSubscriptionType) {
  if (!paidableSubscriptionTypes.includes(subscriptionType)) {
    // eslint-disable-next-line no-console
    console.warn('[getAllSubscriptionPrices]', 'Not a paidable subscription:', subscriptionType);
    return undefined;
  }
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType);
  const ratios = await getAllCurrencyRatios();
  const basePrice = getBaseSubscriptionPlanPrice(grade, period);
  return calcAllPrices(basePrice, ratios);
}
