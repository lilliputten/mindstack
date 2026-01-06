'use client';

import React from 'react';
import { Stripe } from '@stripe/stripe-js';

import { InternalError } from '@/lib/errors';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { TPaidableSubscriptionType } from '@/features/subscriptions';
import { useT } from '@/i18n';

import { addUserPayment, startStripeSessionCheckout } from '../actions';

interface TStripePaymentParams {
  subscriptionType: TPaidableSubscriptionType;
}

interface TMemo {
  uniqueKey: string;
  startedAt?: number;
  stripeClientPromise?: Promise<Stripe | null>;
}

type TSessionCheckoutResult = Awaited<ReturnType<typeof startStripeSessionCheckout>>;

export function useStripePayment(params: TStripePaymentParams) {
  const { subscriptionType } = params;
  const t = useT();

  const memo = React.useMemo<TMemo>(() => ({ uniqueKey: getRandomHashString() }), []);

  const [isApiWorking, startApiWorking] = React.useTransition();

  const isReady = true; // isPricesQueryReady;

  const runStartStripeCheckout = React.useCallback(() => {
    const stripeParams = {
      subscriptionType,
      uniqueKey: memo.uniqueKey,
    };
    return new Promise<TSessionCheckoutResult>((resolve, reject) => {
      startApiWorking(async () => {
        try {
          const result = await startStripeSessionCheckout(stripeParams);
          const { paymentId, price, currency } = result;
          await addUserPayment({
            provider: 'STRIPE',
            paymentId,
            uniqueKey: memo.uniqueKey,
            status: 'PENDING',
            subscriptionType,
            price,
            currency,
          });
          resolve(result);
        } catch (error) {
          const message = t('StripePayment.PaymentStartingError');
          const details = getErrorText(error);
          const comboMsg = [message, details].filter(Boolean).join(': ');
          // eslint-disable-next-line no-console
          console.error('[PricingChoosePage:runStartStripeCheckout]', comboMsg, {
            error,
            stripeParams,
          });
          debugger; // eslint-disable-line no-debugger
          reject(new InternalError(comboMsg, 'api-error'));
        }
      });
    });
  }, [subscriptionType, memo.uniqueKey, t]);

  return {
    isReady,
    isWorking: isApiWorking,
    runStartStripeCheckout,
  };
}
