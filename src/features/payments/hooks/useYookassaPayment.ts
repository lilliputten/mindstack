'use client';

import React from 'react';
import { Payment } from '@a2seven/yoo-checkout';

import { Defer } from '@/lib/types/ts';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { isDev } from '@/config';
import { TCurrencyType } from '@/features/currencies';
import {
  checkYookassaPayment,
  makeYookassaPayment,
  paymentPollDelay,
  TCheckYookassaPaymentParams,
  TMakeYookassaPaymentParams,
} from '@/features/payments';
import { TPaidableSubscriptionType, useAllSubscriptionPrices } from '@/features/subscriptions';

interface TYookassaPaymentParams {
  subscriptionType: TPaidableSubscriptionType;
}

type TResult = boolean;

interface TMemo {
  defer?: Defer<TResult>;
  timeout?: ReturnType<typeof setTimeout>;
  idempotenceKey: string;
  paymentId?: string;
  checkPayment?: () => void;
}

export function useYookassaPayment(params: TYookassaPaymentParams) {
  const { subscriptionType } = params;
  const allSubscriptionPricesQuery = useAllSubscriptionPrices({ subscriptionType });
  const { prices, isLoading, isFetched } = allSubscriptionPricesQuery;
  const isPricesQueryReady = !!prices && !isLoading && isFetched;

  const memo = React.useMemo<TMemo>(() => ({ idempotenceKey: getRandomHashString() }), []);

  const actualCurrency: TCurrencyType = 'RUB';
  const actualPrice = isDev ? 1 : prices?.[actualCurrency];

  const [isApiWorking, startApiWorking] = React.useTransition();
  const [activePaymentId, setActivePaymentId] = React.useState<string | undefined>();

  const isReady = isPricesQueryReady;

  const checkPaymentStatus = React.useCallback(
    (status: Payment['status']) => {
      if (status === 'succeeded') {
        // succeeded
        console.log('[PricingChoosePage:checkPaymentStatus] succeeded', {
          status,
          memo,
        });
        debugger;
        memo.defer?.resolve(true);
        memo.defer = undefined;
        setActivePaymentId(undefined);
        // Finish polling
      } else if (status === 'canceled') {
        // canceled
        console.log('[PricingChoosePage:checkPaymentStatus] canceled', {
          status,
          memo,
        });
        debugger;
        memo.defer?.reject('Payment canceled');
        memo.defer = undefined;
        setActivePaymentId(undefined);
        // Finish polling
      } else {
        // waiting
        console.log('[PricingChoosePage:checkPaymentStatus] waiting', {
          status,
          memo,
        });
        debugger;
        // Continue polling...
        if (!memo.checkPayment) {
          throw new Error('No "checkPayment" callback found!');
        }
        if (memo.timeout) clearTimeout(memo.timeout);
        memo.timeout = setTimeout(memo.checkPayment, paymentPollDelay);
      }
    },
    [memo],
  );

  const _checkPayment = React.useCallback(() => {
    if (!memo.paymentId) {
      const errMsg = 'Failed to calculate a proper price for the payment';
      const error = new Error(errMsg);
      // eslint-disable-next-line no-console
      console.error('[PricingChoosePage:startYoukassaPayment]', errMsg, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      throw error;
    }
    const checkYookassaPaymentParams: TCheckYookassaPaymentParams = {
      paymentId: memo.paymentId,
      idempotenceKey: memo.idempotenceKey,
    };
    startApiWorking(async () => {
      try {
        console.log('[PricingChoosePage:checkPayment] start', {
          checkYookassaPaymentParams,
        });
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
        memo.defer?.reject(new Error(comboMsg));
        memo.defer = undefined;
      }
    });
  }, [memo, checkPaymentStatus]);
  // NOTE: Using only throught memo reference
  memo.checkPayment = _checkPayment;

  const startYoukassaPayment = React.useCallback(() => {
    if (!actualPrice) {
      const errMsg = 'Failed to calculate a proper price for the payment';
      const error = new Error(errMsg);
      // eslint-disable-next-line no-console
      console.warn('[PricingChoosePage:startYoukassaPayment]', errMsg, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      // toast.error(errMsg);
      return Promise.reject(error);
    }
    const makeYookassaPaymentParams: TMakeYookassaPaymentParams = {
      subscriptionType,
      amount: actualPrice,
      currency: actualCurrency,
      idempotenceKey: memo.idempotenceKey,
    };
    if (memo.defer) {
      memo.defer.reject('New payment started');
    }
    const defer = new Defer<TResult>();
    memo.defer = defer;
    startApiWorking(async () => {
      try {
        console.log('[PricingChoosePage:startYoukassaPayment] start', {
          makeYookassaPaymentParams,
          memo,
          subscriptionType,
        });
        const result = await makeYookassaPayment(makeYookassaPaymentParams);
        const { paymentId, status } = result;
        console.log('[PricingChoosePage:startYoukassaPayment] done', {
          paymentId,
          status,
          result,
          makeYookassaPaymentParams,
        });
        debugger;
        setActivePaymentId(paymentId);
        memo.paymentId = paymentId;
        checkPaymentStatus(status);
      } catch (error) {
        const message = 'Payment processing failure';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[PricingChoosePage:startYoukassaPayment]', comboMsg, {
          error,
          params,
        });
        debugger; // eslint-disable-line no-debugger
        defer.reject(new Error(comboMsg));
        memo.defer = undefined;
      }
    });
    return defer.promise;
  }, [actualPrice, checkPaymentStatus, subscriptionType, memo, params]);

  return {
    isReady,
    // idempotenceKey,
    paymentId: activePaymentId,
    isWorking: isApiWorking || !!activePaymentId,
    startYoukassaPayment,
  };
}
