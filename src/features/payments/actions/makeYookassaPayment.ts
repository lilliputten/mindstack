'use server';

import { ICreatePayment, IPaymentMethodType } from '@a2seven/yoo-checkout';

import { useFakePrices, WEBHOOK_HOST } from '@/config/envServer';
import { CustomAPIError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { pricingChooseRoute } from '@/config';
import { stringifyPrice } from '@/features/currencies';
import { TCurrencyType } from '@/features/currencies/types';
import { gradeComparison } from '@/features/payments/helpers';
import {
  ensurePaidableSubscriptionType,
  getGradeFromSubscriptionType,
  TSubscriptionType,
} from '@/features/subscriptions';
import { getAllSubscriptionPrices } from '@/features/subscriptions/actions/getAllSubscriptionPrices';
import { getT } from '@/i18n';

import { getYookassaCheckoutObject } from './helpers';

export interface TMakeYookassaPaymentParams {
  subscriptionType: TSubscriptionType;
  uniqueKey: string; // Idempotency key
  paymentType?: IPaymentMethodType; // 'bank_card' etc
}

/** Start yookassa payment */
export async function makeYookassaPayment(params: TMakeYookassaPaymentParams) {
  const { uniqueKey, paymentType, subscriptionType: rawSubscriptionType } = params;
  const t = await getT();

  const user = await getCurrentUser();
  if (!user) {
    throw new CustomAPIError(t('MakeYookassaPayment.UnauthorizedPaymentError'));
  }

  // Parse and check paidable subscription type
  const subscriptionType = ensurePaidableSubscriptionType(rawSubscriptionType);

  const currency: TCurrencyType = 'RUB';

  // Get the requested grade from the subscription type
  const requestedGrade = getGradeFromSubscriptionType(subscriptionType);
  const currentGrade = user.grade;

  // Compare grades using helper
  const comparisonResult = gradeComparison(currentGrade, requestedGrade);

  // Get prices for the requested subscription type
  const prices = await getAllSubscriptionPrices(subscriptionType);
  const price = useFakePrices ? 1 : prices?.[currency];

  if (!price) {
    throw new Error(
      `Failed to calculate a proper price for the payment for the subscription type "${subscriptionType}"`,
    );
  }

  // Calculate price difference for upgrade scenarios
  if (comparisonResult.type === 'upgrade') {
    // This is an upgrade - user pays the full price of the new plan
    // In a real implementation, you might want to calculate the difference between current and new plan
    // For now, we'll use the full price of the requested plan
    // eslint-disable-next-line no-console
    console.log('[makeYookassaPayment]', 'Processing upgrade payment', {
      user,
      currentGrade,
      requestedGrade,
      price,
    });
  } else if (comparisonResult.type === 'downgrade') {
    // This is a downgrade - should not happen in normal flow, but we'll log it
    // eslint-disable-next-line no-console
    console.warn(
      '[makeYookassaPayment]',
      'Downgrade payment detected - this should not happen normally',
      {
        user,
        currentGrade,
        requestedGrade,
      },
    );
    // For downgrades, we might want to redirect to support instead of processing payment
    throw new CustomAPIError('Downgrade requests should be processed through support');
  } else {
    // Same grade - renewal or period change
    // eslint-disable-next-line no-console
    console.log('[makeYookassaPayment]', 'Processing renewal or period change', {
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

    const payment_method_data = paymentType ? { type: paymentType } : undefined;
    const createPayload: ICreatePayment = {
      amount: {
        // TODO: Convert to cents (kopeks)?
        value: stringifyPrice(price),
        currency,
      },
      payment_method_data,
      confirmation: {
        type: 'redirect',
        return_url: successUrl,
      },
    };

    // eslint-disable-next-line no-debugger
    debugger;
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
    const message = t('MakeYookassaPayment.PaymentError');
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[makeYookassaPayment]', comboMsg, {
      error,
      params,
    });
    debugger; // eslint-disable-line no-debugger
    // Re-throw error
    throw error;
  }
}
