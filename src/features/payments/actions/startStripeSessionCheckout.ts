'use server';

import Stripe from 'stripe';

import { stripeSecretKey, useFakePrices, WEBHOOK_HOST } from '@/config/envServer';
import { CustomAPIError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { pricingChooseRoute } from '@/config';
import { TCurrencyType } from '@/features/currencies/types';
import { calculatePricingForUser } from '@/features/payments/actions/calculatePricingForUser';
import { TSubscriptionType } from '@/features/subscriptions';
import { getT } from '@/i18n';

export interface TMakeStripePaymentParams {
  subscriptionType: TSubscriptionType;
  uniqueKey: string; // Idempotency key
  currency?: TCurrencyType;
}

/** Start stripe payment */
export async function startStripeSessionCheckout(params: TMakeStripePaymentParams) {
  const { uniqueKey, subscriptionType: rawSubscriptionType, currency = 'USD' } = params;
  const t = await getT();

  const user = await getCurrentUser();
  if (!user) {
    throw new CustomAPIError(t('StripePayment.UnauthorizedPaymentError'));
  }

  // Use calculatePricingForUser to get proper pricing and comparison data
  const { prices, subscriptionType } = await calculatePricingForUser(rawSubscriptionType);

  const price = useFakePrices ? 1 : prices?.[currency];

  if (!price) {
    throw new Error(
      t('StripePayment.FailedToCalculatePrice', { subscriptionType: rawSubscriptionType }),
    );
  }

  const priceCents = Math.round(price * 100);

  try {
    const successKey = [
      // Compose success url from provider (STRIPE, in lowercase) and uniqueKey
      'stripe',
      uniqueKey,
    ].join('-');

    // Route: `/pricing/choose/[subscriptionType]/success/[successKey]`
    const successUrl = `${WEBHOOK_HOST}${pricingChooseRoute}/${subscriptionType.toLowerCase()}/success/${successKey}`;
    const cancelUrl = `${WEBHOOK_HOST}${pricingChooseRoute}/${subscriptionType.toLowerCase()}/cancel/${successKey}`;

    const stripeConfig: Stripe.StripeConfig = {
      // apiVersion: '2022-11-15',
    };
    const stripe = new Stripe(stripeSecretKey, stripeConfig);

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: t('StripePayment.PaymentName', { subscriptionType }),
              description: t('StripePayment.PaymentDescription', { subscriptionType }),
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl, // TODO: To use a different cancel URL?
      metadata: {
        userId: user.id,
        subscriptionType,
        uniqueKey,
      },
      branding_settings: {
        display_name: t('Pages.RootTitle'),
      },
    };
    const stripeOptions: Stripe.RequestOptions = {
      idempotencyKey: uniqueKey,
    };

    const checkout: Stripe.Response<Stripe.Checkout.Session> =
      await stripe.checkout.sessions.create(checkoutParams, stripeOptions);

    if (!checkout.url) {
      throw new Error(t('StripePayment.FailedToCreateCheckoutSessionUrl'));
    }

    const resultData = {
      paymentUrl: checkout.url, // Return the checkout URL
      paymentId: checkout.id, // Use checkout session ID as payment ID
      successUrl,
      price,
      currency,
      uniqueKey,
    };

    return resultData;
  } catch (error) {
    const message = t('StripePayment.PaymentError');
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[startStripeSessionCheckout]', comboMsg, {
      error,
      params,
    });
    debugger; // eslint-disable-line no-debugger
    // Re-throw error
    throw error;
  }
}
