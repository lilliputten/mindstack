import { loadStripe, Stripe } from '@stripe/stripe-js';

import { stripePublishableKey } from '@/config';

/** Returns a promise for the Stripe client */
export function getStripeClient(): Promise<Stripe | null> {
  return loadStripe(stripePublishableKey);
}
