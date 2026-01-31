import { redirect } from 'next/navigation';

import { TAwaitedLocaleProps } from '@/i18n';
import { publicPricingRoute } from '@/config';
import { TPaidableSubscriptionType } from '@/features/subscriptions';

type TAwaitedProps = TAwaitedLocaleProps<{ subscriptionType: TPaidableSubscriptionType }>;

export default async function PricingChooseRedirectRoute({
  params: _awaitedParams,
}: TAwaitedProps) {
  // const params = await awaitedParams;
  // const { locale, subscriptionType } = params;

  return redirect(publicPricingRoute);
}
