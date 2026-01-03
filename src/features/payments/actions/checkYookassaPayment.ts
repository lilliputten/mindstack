'use server';

import { Payment } from '@a2seven/yoo-checkout';

import { CustomAPIError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';

import { getYookassCheckoutObject } from './getYookassCheckoutObject';

export interface TCheckYookassaPaymentParams {
  paymentId: string;
  uniqueKey: string; // Idempotency key
}

export async function checkYookassaPayment(params: TCheckYookassaPaymentParams) {
  const { paymentId } = params;

  const user = await getCurrentUser();
  if (!user) {
    throw new CustomAPIError('Cannot proceed payments for unauthorized users');
  }

  try {
    const checkout = getYookassCheckoutObject();

    const payment: Payment = await checkout.getPayment(paymentId);

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
      // id: paymentId,
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

    console.log('[checkYookassaPayment] done', {
      resultData,
      payment,
    });
    // debugger;

    return resultData;
  } catch (error) {
    const message = 'Error checking yookassa payment';
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[checkYookassaPayment]', comboMsg, {
      error,
      paymentId,
    });
    debugger; // eslint-disable-line no-debugger
    // Re-throw errors from checkAllowedAIGenerations or other errors
    throw error;
  }
}
