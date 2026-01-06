'use server';

import { z } from 'zod';

import {
  UserPaymentProviderType,
  UserPaymentSchema,
  UserPaymentStatusType,
} from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { TCurrencyType } from '@/features/currencies';
import { TSubscriptionType } from '@/features/subscriptions/types';

const addUserPaymentSchema = UserPaymentSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(['PENDING', 'FAILED', 'SUCCEED']).default('PENDING'),
});

type AddUserPaymentData = {
  provider: UserPaymentProviderType;
  paymentId: string;
  uniqueKey: string;
  status?: UserPaymentStatusType;
  subscriptionType: TSubscriptionType;
  currency: TCurrencyType;
  price: number;
};

export async function addUserPayment(data: AddUserPaymentData) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error('Authentication required');
    }

    const validatedData = addUserPaymentSchema.parse({
      ...data,
      status: data.status || 'PENDING',
    });

    const payment = await prisma.userPayment.create({
      data: {
        userId: user.id,
        ...validatedData,
      },
    });

    return payment;
  } catch (error) {
    const message = 'Error parsing user payment data';
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');

    // eslint-disable-next-line no-console
    console.error('[addUserPayment]', comboMsg, {
      error,
      data,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(message);
  }
}
