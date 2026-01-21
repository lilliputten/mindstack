'use client';

import React from 'react';
import { Payment } from '@a2seven/yoo-checkout';

import { Defer } from '@/lib/types/ts';
import { InternalError } from '@/lib/errors';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { useT } from '@/i18n';
import { isDev } from '@/config';
import { minuteMs } from '@/constants';
import { TPaidableSubscriptionType } from '@/features/subscriptions';

import {
  addUserPayment,
  checkYookassaPayment,
  startYookassaCheckoutPayment,
  TCheckYookassaPaymentParams,
  TStartYookassaPaymentParams,
  updateUserPayment,
} from '../actions';
import { paymentPollDelay } from '../constants';

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

type TPaymentResult = Awaited<ReturnType<typeof startYookassaCheckoutPayment>>;

const maxWaitTimeout = isDev ? minuteMs * 1 : minuteMs * 10;

export function useYookassaPayment(params: TYookassaPaymentParams) {
  const { subscriptionType } = params;
  const t = useT();

  const memo = React.useMemo<TMemo>(() => ({ uniqueKey: getRandomHashString() }), []);

  const [isApiWorking, startApiWorking] = React.useTransition();
  const [activePaymentId, setActivePaymentId] = React.useState<string | undefined>();

  const isReady = true; // isPricesQueryReady;

  /** The core hook -- it initialized the payment, and allows to jump to the
   * payment link (`paymentUrl`, returned from the `startYookassaPayment` API
   * call), and/or to wait for a payment status updates
   * (`resolveYookassaPaymentInLoop`) */
  const startYookassaPayment = React.useCallback(() => {
    const startYookassaPaymentParams: TStartYookassaPaymentParams = {
      subscriptionType,
      uniqueKey: memo.uniqueKey,
    };
    return new Promise<TPaymentResult>((resolve, reject) => {
      startApiWorking(async () => {
        try {
          const result = await startYookassaCheckoutPayment(startYookassaPaymentParams);
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
          resolve(result);
        } catch (error) {
          const message = t('YookassaPayment.PaymentStartingError');
          const details = getErrorText(error);
          const comboMsg = [message, details].filter(Boolean).join(': ');
          // eslint-disable-next-line no-console
          console.error('[PricingChoosePage:startYoukassaPayment]', comboMsg, {
            error,
            startYookassaPaymentParams,
          });
          debugger; // eslint-disable-line no-debugger
          reject(new InternalError(comboMsg, 'api-error'));
        }
      });
    });
  }, [subscriptionType, memo.uniqueKey, t]);

  /** Payment status checker procedure. */
  const checkPaymentStatus = React.useCallback(
    (status: Payment['status']) => {
      const now = Date.now();
      const startedAt = memo.startedAt || 0;
      const estimated = now - startedAt;
      if (status === 'succeeded') {
        // succeeded
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

  /** Check payment asynchronous handler (for calling via `setTimeout`), only
   * for internal usage. It calls the `checkPaymentStatus` to check the status,
   * received from API. */
  const checkPayment = React.useCallback(() => {
    if (!memo.paymentId) {
      const errMsg = t('YookassaPayment.NotSpecifiedPaymentId');
      const error = new InternalError(errMsg, 'data-error');
      // eslint-disable-next-line no-console
      console.error('[PricingChoosePage:checkPayment]', errMsg, {
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
        const result = await checkYookassaPayment(checkYookassaPaymentParams);
        const { status } = result;
        checkPaymentStatus(status);
      } catch (error) {
        const message = t('YookassaPayment.PaymentCheckingFailure');
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
  }, [memo, t, checkPaymentStatus]);
  // NOTE: Using only throught memo reference
  memo.checkPayment = checkPayment;

  /** Start a payment (via `startYookassaPayment`) and wait to its status
   * updates, iteratively calling of the `checkPaymentStatus` callback.
   * But keep in mind that the user must to make the payment on the real page,
   * returned in the `redirectUrl` parameter.
   *
   * @param {TPaymentResult} result - The result of prviously invoked `startYookassaPayment` hook
   */
  const resolveYookassaPaymentInLoop = React.useCallback(
    (result: TPaymentResult) => {
      const { paymentId, status } = result;
      if (memo.defer) {
        memo.defer.reject(new InternalError('New payment started', 'canceled'));
      }
      const defer = new Defer<TResult>();
      memo.defer = defer;
      startApiWorking(async () => {
        try {
          setActivePaymentId(paymentId);
          memo.paymentId = paymentId;
          memo.startedAt = Date.now();
          checkPaymentStatus(status);
        } catch (error) {
          const message = t('YookassaPayment.PaymentProcessingFailure');
          const details = getErrorText(error);
          const comboMsg = [message, details].filter(Boolean).join(': ');
          // eslint-disable-next-line no-console
          console.error('[PricingChoosePage:resolveYookassaPaymentInLoop]', comboMsg, {
            error,
          });
          debugger; // eslint-disable-line no-debugger
          defer.reject(new InternalError(comboMsg, 'api-error'));
          memo.defer = undefined;
        }
      });
      return defer.promise;
    },
    [memo, checkPaymentStatus, t],
  );

  return {
    isReady,
    // uniqueKey,
    paymentId: activePaymentId,
    isWorking: isApiWorking || !!activePaymentId,
    startYookassaPayment,
    resolveYookassaPaymentInLoop, // Is it really used?
  };
}
