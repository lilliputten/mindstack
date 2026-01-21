'use server';

import {
  IConfirmationWithoutData,
  ICreatePayment,
  IPaymentMethodType,
} from '@a2seven/yoo-checkout';

import { useFakePrices, WEBHOOK_HOST } from '@/config/envServer';
import { CustomAPIError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { getT } from '@/i18n';
import { pricingChooseRoute } from '@/config';
import { stringifyPrice } from '@/features/currencies';
import { TCurrencyType } from '@/features/currencies/types';
import { calculatePricingForUser } from '@/features/payments/actions/calculatePricingForUser';
import { TSubscriptionType } from '@/features/subscriptions';

import { getYookassaCheckoutObject } from './helpers';

export interface TStartYookassaPaymentParams {
  subscriptionType: TSubscriptionType;
  uniqueKey: string; // Idempotency key
  paymentType?: IPaymentMethodType; // 'bank_card' etc
}

/** Start yookassa payment */
export async function startYookassaCheckoutPayment(params: TStartYookassaPaymentParams) {
  const { uniqueKey, paymentType, subscriptionType: rawSubscriptionType } = params;
  const t = await getT();

  const user = await getCurrentUser();
  if (!user) {
    throw new CustomAPIError(t('YookassaPayment.UnauthorizedPaymentError'));
  }

  // Use calculatePricingForUser to get proper pricing and comparison data
  const { prices, comparisonResult, requestedGrade, currentGrade, subscriptionType } =
    await calculatePricingForUser(rawSubscriptionType);

  const currency: TCurrencyType = 'RUB';
  const price = useFakePrices ? 1 : prices?.[currency];

  if (!price) {
    throw new Error(
      t('YookassaPayment.FailedToCalculatePrice', { subscriptionType: rawSubscriptionType }),
    );
  }

  // Log different scenarios based on comparison result
  if (comparisonResult.type === 'upgrade') {
    // This is an upgrade scenario
    // eslint-disable-next-line no-console
    console.log('[startYookassaCheckoutPayment]', 'Processing upgrade payment', {
      user,
      currentGrade,
      requestedGrade,
      price,
    });
  } else if (comparisonResult.type === 'downgrade') {
    // This is a downgrade - should not happen in normal flow, but we'll log it
    // eslint-disable-next-line no-console
    console.warn(
      '[startYookassaCheckoutPayment]',
      'Downgrade payment detected - this should not happen normally',
      {
        user,
        currentGrade,
        requestedGrade,
      },
    );
    // For downgrades, we might want to redirect to support instead of processing payment
    throw new CustomAPIError(t('YookassaPayment.DowngradeRequestsThroughSupport'));
  } else {
    // Same grade - renewal or period change
    // eslint-disable-next-line no-console
    console.log('[startYookassaCheckoutPayment]', 'Processing renewal or period change', {
      user,
      currentGrade,
      requestedGrade,
      price,
    });
  }

  try {
    const checkout = getYookassaCheckoutObject();

    const successKey = [
      // Compose success url from provider (YOOKASSA, in lowercase) and uniqueKey
      'yookassa',
      uniqueKey,
    ].join('-');

    // Route: `/pricing/choose/[subscriptionType]/success/[successKey]`
    const successUrl = `${WEBHOOK_HOST}${pricingChooseRoute}/${subscriptionType.toLowerCase()}/success/${successKey}`;
    // const cancelUrl = `${WEBHOOK_HOST}${pricingChooseRoute}/${subscriptionType.toLowerCase()}/cancel/${successKey}`;

    const payment_method_data = paymentType ? { type: paymentType } : undefined;

    const confirmationData: IConfirmationWithoutData = {
      type: 'redirect',
      return_url: successUrl,
    };

    const createPayload: ICreatePayment = {
      amount: {
        value: stringifyPrice(price),
        currency,
      },
      payment_method_data,
      confirmation: confirmationData,
      // language: locale, // TODO: There no locale support in the API
    };

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
      price,
      currency,
      paymentId,
      paymentUrl,
      status,
      createdAt,
      confirmation,
      paid,
      test,
    };

    return resultData;
  } catch (error) {
    const message = t('YookassaPayment.PaymentError');
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[startYookassaCheckoutPayment]', comboMsg, {
      error,
      params,
    });
    debugger; // eslint-disable-line no-debugger
    // Re-throw error
    throw error;
  }
}
