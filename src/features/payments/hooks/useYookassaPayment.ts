'use client';

import React from 'react';
import { Payment } from '@a2seven/yoo-checkout';

import { Defer } from '@/lib/types/ts';
import { InternalError } from '@/lib/errors';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { isDev } from '@/config';
import { minuteMs } from '@/constants';
import {
  addUserPayment,
  checkYookassaPayment,
  makeYookassaPayment,
  paymentPollDelay,
  TCheckYookassaPaymentParams,
  TMakeYookassaPaymentParams,
  updateUserPayment,
} from '@/features/payments';
import { TPaidableSubscriptionType } from '@/features/subscriptions';

interface TYookassaPaymentParams {
  subscriptionType: TPaidableSubscriptionType;
}

type TResult = boolean;

interface TMemo {
  defer?: Defer<TResult>;
  timeout?: ReturnType<typeof setTimeout>;
  uniqueKey: string;
  paymentId?: string;
  checkPayment?: () => void;
  startedAt?: number;
}

const maxWaitTimeout = isDev ? minuteMs * 1 : minuteMs * 10;

export function useYookassaPayment(params: TYookassaPaymentParams) {
  const { subscriptionType } = params;

  const memo = React.useMemo<TMemo>(() => ({ uniqueKey: getRandomHashString() }), []);

  const [isApiWorking, startApiWorking] = React.useTransition();
  const [activePaymentId, setActivePaymentId] = React.useState<string | undefined>();

  const isReady = true; // isPricesQueryReady;

  const checkPaymentStatus = React.useCallback(
    (status: Payment['status']) => {
      const now = Date.now();
      const startedAt = memo.startedAt || 0;
      const estimated = now - startedAt;
      if (status === 'succeeded') {
        // succeeded
        /* console.log('[PricingChoosePage:checkPaymentStatus] succeeded', {
         *   status,
         *   estimated,
         *   memo,
         * });
         */
        updateUserPayment({
          provider: 'YOOKASSA',
          uniqueKey: memo.uniqueKey,
          paymentId: memo.paymentId,
          updates: { status: 'SUCCEED' },
        });
        memo.defer?.resolve(true);
        memo.defer = undefined;
        setActivePaymentId(undefined);
        // Finish polling
      } else if (status === 'canceled') {
        // canceled
        /* console.log('[PricingChoosePage:checkPaymentStatus] canceled', {
         *   status,
         *   estimated,
         *   memo,
         * });
         */
        updateUserPayment({
          provider: 'YOOKASSA',
          uniqueKey: memo.uniqueKey,
          paymentId: memo.paymentId,
          updates: { status: 'FAILED' },
        });
        memo.defer?.reject(new InternalError('Payment canceled', status));
        memo.defer = undefined;
        setActivePaymentId(undefined);
        // Finish polling
      } else if (estimated > maxWaitTimeout) {
        // timeout exceeded
        /* console.log('[PricingChoosePage:checkPaymentStatus] timeout exceeded', {
         *   estimated,
         *   maxWaitTimeout,
         *   status,
         *   memo,
         * });
         */
        updateUserPayment({
          provider: 'YOOKASSA',
          uniqueKey: memo.uniqueKey,
          paymentId: memo.paymentId,
          updates: { status: 'FAILED' },
        });
        memo.defer?.reject(new InternalError('Payment timeout exceeded', 'timeout'));
        memo.defer = undefined;
        setActivePaymentId(undefined);
      } else {
        // waiting
        /* console.log('[PricingChoosePage:checkPaymentStatus] waiting', {
         *   status,
         *   estimated,
         *   maxWaitTimeout,
         *   memo,
         * });
         */
        // Continue polling...
        if (!memo.checkPayment) {
          memo.defer?.reject(
            new InternalError('No "checkPayment" callback found!', 'internal-error'),
          );
          memo.defer = undefined;
        } else {
          if (memo.timeout) clearTimeout(memo.timeout);
          memo.timeout = setTimeout(memo.checkPayment, paymentPollDelay);
        }
      }
    },
    [memo],
  );

  const _checkPayment = React.useCallback(() => {
    if (!memo.paymentId) {
      const errMsg = 'Failed to calculate a proper price for the payment';
      const error = new InternalError(errMsg, 'data-error');
      // eslint-disable-next-line no-console
      console.error('[PricingChoosePage:_checkPayment]', errMsg, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      throw error;
    }
    const checkYookassaPaymentParams: TCheckYookassaPaymentParams = {
      paymentId: memo.paymentId,
      uniqueKey: memo.uniqueKey,
    };
    startApiWorking(async () => {
      try {
        /* console.log('[PricingChoosePage:checkPayment] start', {
         *   checkYookassaPaymentParams,
         * });
         */
        const result = await checkYookassaPayment(checkYookassaPaymentParams);
        const { status } = result;
        checkPaymentStatus(status);
      } catch (error) {
        const message = 'Payment checking failure';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[PricingChoosePage:checkPayment]', comboMsg, {
          error,
          checkYookassaPaymentParams,
        });
        debugger; // eslint-disable-line no-debugger
        memo.defer?.reject(new InternalError(comboMsg, 'api-error'));
        memo.defer = undefined;
      }
    });
  }, [memo, checkPaymentStatus]);
  // NOTE: Using only throught memo reference
  memo.checkPayment = _checkPayment;

  const startYoukassaPayment = React.useCallback(() => {
    const makeYookassaPaymentParams: TMakeYookassaPaymentParams = {
      subscriptionType,
      uniqueKey: memo.uniqueKey,
    };
    return new Promise<Awaited<ReturnType<typeof makeYookassaPayment>>>((resolve, reject) => {
      startApiWorking(async () => {
        try {
          const result = await makeYookassaPayment(makeYookassaPaymentParams);
          const { paymentId, price, currency } = result;
          await addUserPayment({
            provider: 'YOOKASSA',
            paymentId,
            uniqueKey: memo.uniqueKey,
            status: 'PENDING',
            subscriptionType,
            price,
            currency,
          });
          /* console.log('[PricingChoosePage:startYoukassaPayment] done', {
           *   paymentId,
           *   result,
           *   makeYookassaPaymentParams,
           *   // addedUserPaymentRecord,
           *   // paymentUrl,
           *   // status,
           * });
           */
          resolve(result);
        } catch (error) {
          const message = 'Payment starting error';
          const details = getErrorText(error);
          const comboMsg = [message, details].filter(Boolean).join(': ');
          // eslint-disable-next-line no-console
          console.error('[PricingChoosePage:startYoukassaPayment]', comboMsg, {
            error,
            makeYookassaPaymentParams,
          });
          debugger; // eslint-disable-line no-debugger
          reject(new InternalError(comboMsg, 'api-error'));
        }
      });
    });
  }, [subscriptionType, memo]);

  const startYoukassaPaymentLoop = React.useCallback(() => {
    if (memo.defer) {
      memo.defer.reject(new InternalError('New payment started', 'canceled'));
    }
    const defer = new Defer<TResult>();
    memo.defer = defer;
    startApiWorking(async () => {
      try {
        const result = await startYoukassaPayment();
        const { paymentId, status } = result;
        setActivePaymentId(paymentId);
        memo.paymentId = paymentId;
        memo.startedAt = Date.now();
        checkPaymentStatus(status);
      } catch (error) {
        const message = 'Payment processing failure';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[PricingChoosePage:startYoukassaPaymentLoop]', comboMsg, {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        defer.reject(new InternalError(comboMsg, 'api-error'));
        memo.defer = undefined;
      }
    });
    return defer.promise;
  }, [memo, startYoukassaPayment, checkPaymentStatus]);

  return {
    isReady,
    // uniqueKey,
    paymentId: activePaymentId,
    isWorking: isApiWorking || !!activePaymentId,
    startYoukassaPayment,
    startYoukassaPaymentLoop, // ???
  };
}
