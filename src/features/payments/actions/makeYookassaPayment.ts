'use server';

import { ICreatePayment, IPaymentMethodType, YooCheckout } from '@a2seven/yoo-checkout';

import { PUBLIC_URL, WEBHOOK_HOST } from '@/config/envServer';
import { CustomAPIError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { pricingChooseRoute } from '@/config';
import { TSubscriptionType } from '@/constants';
import { TCurrencyType } from '@/features/currencies/types';

import { youkassaSecretKey, youkassaShopId } from '../constants/yookassa-payment-constants';

interface TMakeYookassaPaymentParams {
  amount: number;
  currency?: TCurrencyType; // RUB is default

  idempotenceKey: string; // Idempotency key
  paymentType?: IPaymentMethodType; // 'bank_card' etc

  subscriptionType: TSubscriptionType;
}

export async function makeYookassaPayment(params: TMakeYookassaPaymentParams) {
  const {
    // ...
    amount,
    currency,
    idempotenceKey,
    paymentType,
    subscriptionType,
  } = params;

  const user = await getCurrentUser();
  if (!user) {
    throw new CustomAPIError('Cannot proceed payments for unauthorized users');
  }

  try {
    const checkout = new YooCheckout({ shopId: youkassaShopId, secretKey: youkassaSecretKey });

    const successKey = [
      // Create success url
      user.id,
      idempotenceKey,
    ].join(';');
    // Route: `/pricing/choose/[subscriptionType]/success/[successKey]`
    const returnUrl = `${WEBHOOK_HOST}/${pricingChooseRoute}/${subscriptionType}/success/${successKey}`;
    // const returnUrl = new URL(WEBHOOK_HOST);

    const payment_method_data = paymentType ? { type: paymentType } : undefined;
    const createPayload: ICreatePayment = {
      amount: {
        value: amount.toFixed(2),
        currency: currency || 'RUB',
      },
      payment_method_data,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
    };

    console.log('[makeYookassaPayment] start', {
      createPayload,
      successKey,
      returnUrl,
      user,
      checkout,
      params,
      youkassaShopId,
      youkassaSecretKey,
      subscriptionType,
      WEBHOOK_HOST,
      PUBLIC_URL,
    });
    debugger;

    const payment = await checkout.createPayment(createPayload, idempotenceKey);

    console.log('[makeYookassaPayment] done', {
      payment,
    });
    debugger;

    return payment;
  } catch (error) {
    const message = 'Error making yookassa payment';
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[makeYookassaPayment]', comboMsg, {
      error,
      params,
    });
    debugger; // eslint-disable-line no-debugger
    // Re-throw errors from checkAllowedAIGenerations or other errors
    throw error;
  }
}
