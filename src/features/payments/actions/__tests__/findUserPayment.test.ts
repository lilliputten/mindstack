import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { findUserPayment } from '../findUserPayment';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('findUserPayment', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  it('should find payment by provider and uniqueKey', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-find-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      await jestPrisma.userPayment.create({
        data: {
          userId: user.id,
          provider: 'YOOKASSA',
          paymentId: `payment-${dateTag}`,
          uniqueKey: `unique-${dateTag}`,
          status: 'PENDING',
          subscriptionType: 'PRO-MONTH',
        },
      });

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await findUserPayment({
        provider: 'YOOKASSA',
        uniqueKey: `unique-${dateTag}`,
      });

      expect(result).toBeTruthy();
      expect(result?.paymentId).toBe(`payment-${dateTag}`);
    } finally {
      if (user) {
        await jestPrisma.userPayment.deleteMany({ where: { userId: user.id } });
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should return null when payment not found', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-null-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await findUserPayment({
        provider: 'YOOKASSA',
        uniqueKey: 'nonexistent',
      });

      expect(result).toBeNull();
    } finally {
      if (user) {
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should throw error when user not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    await expect(
      findUserPayment({
        provider: 'YOOKASSA',
        uniqueKey: 'test',
      }),
    ).rejects.toThrow('Authentication required');
  });
});
