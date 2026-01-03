import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { dayMs } from '@/constants/datetime';
import { TUser } from '@/features/users/types/TUser';

import { immediatelyCleanStaleUserPayments } from '../cleanStaleUserPayments';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('cleanStaleUserPayments', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  it('should clean old failed payments', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      const oldDate = new Date(Date.now() - 2 * dayMs);
      await jestPrisma.userPayment.create({
        data: {
          userId: user.id,
          provider: 'YOOKASSA',
          paymentId: `old-payment-${dateTag}`,
          uniqueKey: `old-unique-${dateTag}`,
          status: 'FAILED',
          subscriptionType: 'PRO-MONTH',
          currency: 'USD',
          price: 9.99,
          createdAt: oldDate,
        },
      });

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await immediatelyCleanStaleUserPayments(dayMs);
      expect(result.count).toBeGreaterThan(0);
    } finally {
      if (user) {
        await jestPrisma.userPayment.deleteMany({ where: { userId: user.id } });
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should not clean recent payments', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      await jestPrisma.userPayment.create({
        data: {
          userId: user.id,
          provider: 'YOOKASSA',
          paymentId: `recent-payment-${dateTag}`,
          uniqueKey: `recent-unique-${dateTag}`,
          status: 'FAILED',
          subscriptionType: 'PRO-MONTH',
          currency: 'USD',
          price: 9.99,
        },
      });

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await immediatelyCleanStaleUserPayments(dayMs);
      expect(result.count).toBe(0);
    } finally {
      if (user) {
        await jestPrisma.userPayment.deleteMany({ where: { userId: user.id } });
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should throw error when user not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    await expect(immediatelyCleanStaleUserPayments()).rejects.toThrow('Authentication required');
  });
});
