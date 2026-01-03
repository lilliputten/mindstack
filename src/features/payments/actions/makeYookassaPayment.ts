'use server';

import { ICreatePayment, IPaymentMethodType } from '@a2seven/yoo-checkout';

import { WEBHOOK_HOST } from '@/config/envServer';
import { CustomAPIError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { pricingChooseRoute } from '@/config';
import { stringifyPrice } from '@/features/currencies';
import { TCurrencyType } from '@/features/currencies/types';
import { TSubscriptionType } from '@/features/subscriptions';

import { getYookassCheckoutObject } from './getYookassCheckoutObject';

export interface TMakeYookassaPaymentParams {
  amount: number;
  currency?: TCurrencyType; // RUB is default
  subscriptionType: TSubscriptionType;
  uniqueKey: string; // Idempotency key
  paymentType?: IPaymentMethodType; // 'bank_card' etc
}

/** Start yookassa payment
 */
export async function makeYookassaPayment(params: TMakeYookassaPaymentParams) {
  const {
    // ...
    amount,
    currency,
    uniqueKey,
    paymentType,
    subscriptionType,
  } = params;

  const user = await getCurrentUser();
  if (!user) {
    throw new CustomAPIError('Cannot proceed payments for unauthorized users');
  }

  try {
    const checkout = getYookassCheckoutObject();

    const successKey = [
      // Compose success url from provider (YOOKASSA, in lowercase) and uniqueKey
      'yookassa',
      uniqueKey,
    ].join('-');

    // Route: `/pricing/choose/[subscriptionType]/success/[successKey]`
    const successUrl = `${WEBHOOK_HOST}${pricingChooseRoute}/${subscriptionType}/success/${successKey}`;
    // const returnUrl = new URL(WEBHOOK_HOST);

    const payment_method_data = paymentType ? { type: paymentType } : undefined;
    const createPayload: ICreatePayment = {
      amount: {
        // TODO: Convert to cents (kopeks)?
        value: stringifyPrice(amount),
        currency: currency || 'RUB',
      },
      payment_method_data,
      confirmation: {
        type: 'redirect',
        return_url: successUrl,
      },
    };

    console.log('[makeYookassaPayment] start', {
      createPayload,
      successKey,
      successUrl,
      user,
      params,
      subscriptionType,
      // checkout,
    });

    const payment = await checkout.createPayment(createPayload, uniqueKey);

    /* // Sample payment result:
     * {
     *   "id": "30ea8d53-000f-5001-9000-1c965a6160df",
     *   "status": "pending",
     *   "amount": {
     *     "value": "700.00",
     *     "currency": "RUB"
     *   },
     *   "recipient": {
     *     "account_id": "1237378",
     *     "gateway_id": "2607344"
     *   },
     *   "created_at": "2026-01-03T02:06:11.952Z",
     *   "confirmation": {
     *     "type": "redirect",
     *     "confirmation_url": "https://yoomoney.ru/checkout/payments/v2/contract?orderId=30ea8d53-000f-5001-9000-1c965a6160df"
     *   },
     *   "test": true,
     *   "paid": false,
     *   "refundable": false,
     *   "metadata": {}
     * }
     */

    const {
      // Make a data subset from the payment object
      id: paymentId,
      status,
      created_at: createdAt,
      confirmation,
      paid,
      test,
    } = payment;
    const { confirmation_url: paymentUrl } = confirmation;

    const resultData = {
      paymentId,
      paymentUrl,
      status,
      createdAt,
      confirmation,
      paid,
      test,
    };

    console.log('[makeYookassaPayment] done', {
      resultData,
      payment,
    });
    // debugger;

    return resultData;
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
