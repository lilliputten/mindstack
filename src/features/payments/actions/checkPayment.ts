'use server';

import { UserPaymentProviderType } from '@/generated/prisma';

import { CustomAPIError } from '@/lib/errors';

import { checkStripePayment } from './checkStripePayment';
import { checkYookassaPayment } from './checkYookassaPayment';

export interface TCheckPaymentParams {
  provider: UserPaymentProviderType;
  paymentId: string;
  uniqueKey: string; // Idempotency key
}

type TCbParams = Pick<TCheckPaymentParams, 'paymentId' | 'uniqueKey'>;
type TCb = (p: TCbParams) => Promise<{ isPaid: boolean }>;

const checkCallbacks: Record<UserPaymentProviderType, TCb> = {
  STRIPE: checkStripePayment,
  YOOKASSA: checkYookassaPayment,
};

export async function checkPayment(params: TCheckPaymentParams) {
  const { provider, paymentId, uniqueKey } = params;
  const cb = checkCallbacks[provider];
  if (!cb) {
    throw new CustomAPIError(`Unknown payment provider specified (${provider})`);
  }
  return await cb({ paymentId, uniqueKey });
}
