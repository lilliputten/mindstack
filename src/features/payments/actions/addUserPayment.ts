'use server';

import { z } from 'zod';

import {
  UserPaymentProviderType,
  UserPaymentSchema,
  UserPaymentStatusType,
} from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
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
    // eslint-disable-next-line no-console
    console.error('[addUserPayment] catch', {
      error,
      data,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
