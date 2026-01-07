import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { addUserPayment } from '../addUserPayment';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('addUserPayment', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  it('should create a payment record', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      const paymentData = {
        provider: 'YOOKASSA' as const,
        paymentId: `payment-${dateTag}`,
        uniqueKey: `unique-${dateTag}`,
        subscriptionType: 'PRO-MONTH' as const,
        currency: 'USD' as const,
        price: 9.99,
      };

      const result = await addUserPayment(paymentData);

      expect(result.userId).toBe(user.id);
      expect(result.provider).toBe('YOOKASSA');
      expect(result.paymentId).toBe(`payment-${dateTag}`);
      expect(result.status).toBe('PENDING');
    } finally {
      if (user) {
        await jestPrisma.userPayment.deleteMany({ where: { userId: user.id } });
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should throw error when user not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    await expect(
      addUserPayment({
        provider: 'YOOKASSA',
        paymentId: 'test',
        uniqueKey: 'test',
        subscriptionType: 'PRO-MONTH',
        currency: 'USD',
        price: 9.99,
      }),
    ).rejects.toThrow('Authentication required');
  });
});
