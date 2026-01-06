'use client';

import React from 'react';
import { Payment } from '@a2seven/yoo-checkout';
import { Stripe } from '@stripe/stripe-js';

import { Defer } from '@/lib/types/ts';
import { InternalError } from '@/lib/errors';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { isDev } from '@/config';
import { minuteMs } from '@/constants';
import { TPaidableSubscriptionType } from '@/features/subscriptions';
import { useT } from '@/i18n';

import {
  addUserPayment,
  updateUserPayment,
  // checkStripePayment,
  // makeStripePayment,
  // TCheckStripePaymentParams,
  // TMakeStripePaymentParams,
} from '../actions';
import { paymentPollDelay } from '../constants';

interface TStripePaymentParams {
  subscriptionType: TPaidableSubscriptionType;
}

type TMakeStripePaymentParams = unknown;

type TResult = boolean;

interface TMemo {
  uniqueKey: string;
  startedAt?: number;
  stripeClientPromise?: Promise<Stripe | null>;
  // defer?: Defer<TResult>;
  // timeout?: ReturnType<typeof setTimeout>;
  // paymentId?: string;
  // checkPayment?: () => void;
}

type TPaymentResult = unknown; // Awaited<ReturnType<typeof makeStripePayment>>;

const maxWaitTimeout = isDev ? minuteMs * 1 : minuteMs * 10;

export function useStripePayment(params: TStripePaymentParams) {
  const { subscriptionType } = params;
  const t = useT();

  const memo = React.useMemo<TMemo>(() => ({ uniqueKey: getRandomHashString() }), []);

  const [isApiWorking, startApiWorking] = React.useTransition();
  const [activePaymentId, setActivePaymentId] = React.useState<string | undefined>();

  const isReady = true; // isPricesQueryReady;

  /** The core hook -- it initialized the payment, and allows to jump to the
   * payment link (`paymentUrl`, returned from the `makeStripePayment` API
   * call), and/or to wait for a payment status updates
   * (`resolveStripePaymentInLoop`) */
  const startYoukassaPayment = React.useCallback(() => {
    const makeStripePaymentParams: TMakeStripePaymentParams = {
      subscriptionType,
      uniqueKey: memo.uniqueKey,
    };
    return new Promise<TPaymentResult>((resolve, reject) => {
      startApiWorking(async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await new Promise((r) => setTimeout(r, 2000, {})); // await makeStripePayment(makeStripePaymentParams);
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
          const message = t('UseStripePayment.PaymentStartingError');
          const details = getErrorText(error);
          const comboMsg = [message, details].filter(Boolean).join(': ');
          // eslint-disable-next-line no-console
          console.error('[PricingChoosePage:startYoukassaPayment]', comboMsg, {
            error,
            makeStripePaymentParams,
          });
          debugger; // eslint-disable-line no-debugger
          reject(new InternalError(comboMsg, 'api-error'));
        }
      });
    });
  }, [subscriptionType, memo.uniqueKey, t]);

  return {
    isReady,
    // uniqueKey,
    paymentId: activePaymentId,
    isWorking: isApiWorking || !!activePaymentId,
    startYoukassaPayment,
  };
}
