'use server';

import { UserPaymentProviderType } from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

type FindUserPaymentData = {
  provider: UserPaymentProviderType;
  uniqueKey: string;
};

export async function findUserPayment(data: FindUserPaymentData) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error('Authentication required');
    }
    const payment = await prisma.userPayment.findFirst({
      where: {
        userId: user.id,
        provider: data.provider,
        uniqueKey: data.uniqueKey,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return payment;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[findUserPayment] catch', {
      error,
      data,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
