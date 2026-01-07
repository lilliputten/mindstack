'use server';

import { z } from 'zod';

import { UserPaymentProviderType, UserPaymentSchema } from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const updateUserPaymentSchema = UserPaymentSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

type UpdateUserPaymentData = {
  provider: UserPaymentProviderType;
  paymentId?: string;
  uniqueKey: string;
  updates: z.infer<typeof updateUserPaymentSchema>;
};

export async function updateUserPayment(data: UpdateUserPaymentData) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error('Authentication required');
    }

    const validatedUpdates = updateUserPaymentSchema.parse(data.updates);

    const payment = await prisma.userPayment.updateMany({
      where: {
        userId: user.id,
        provider: data.provider,
        paymentId: data.paymentId,
        uniqueKey: data.uniqueKey,
      },
      data: validatedUpdates,
    });

    return payment;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateUserPayment] catch', {
      error,
      data,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
