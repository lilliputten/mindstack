import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { updateUserPayment } from '../updateUserPayment';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('updateUserPayment', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  it('should update payment status', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-update-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      await jestPrisma.userPayment.create({
        data: {
          userId: user.id,
          provider: 'YOOKASSA',
          paymentId: `payment-${dateTag}`,
          uniqueKey: `unique-${dateTag}`,
          status: 'PENDING',
          subscriptionType: 'PRO-MONTH',
          currency: 'USD',
          price: 9.99,
        },
      });

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await updateUserPayment({
        provider: 'YOOKASSA',
        paymentId: `payment-${dateTag}`,
        uniqueKey: `unique-${dateTag}`,
        updates: { status: 'SUCCEED' },
      });

      expect(result.count).toBe(1);

      const updatedPayment = await jestPrisma.userPayment.findFirst({
        where: {
          userId: user.id,
          provider: 'YOOKASSA',
          uniqueKey: `unique-${dateTag}`,
        },
      });

      expect(updatedPayment?.status).toBe('SUCCEED');
    } finally {
      if (user) {
        await jestPrisma.userPayment.deleteMany({ where: { userId: user.id } });
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should update multiple fields', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-multi-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      await jestPrisma.userPayment.create({
        data: {
          userId: user.id,
          provider: 'YOOKASSA',
          paymentId: `payment-${dateTag}`,
          uniqueKey: `unique-${dateTag}`,
          status: 'PENDING',
          subscriptionType: 'PRO-MONTH',
          currency: 'USD',
          price: 9.99,
        },
      });

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await updateUserPayment({
        provider: 'YOOKASSA',
        paymentId: `payment-${dateTag}`,
        uniqueKey: `unique-${dateTag}`,
        updates: {
          status: 'SUCCEED',
          subscriptionType: 'PRO-YEAR',
          price: 99.99,
        },
      });

      expect(result.count).toBe(1);

      const updatedPayment = await jestPrisma.userPayment.findFirst({
        where: {
          userId: user.id,
          provider: 'YOOKASSA',
          uniqueKey: `unique-${dateTag}`,
        },
      });

      expect(updatedPayment?.status).toBe('SUCCEED');
      expect(updatedPayment?.subscriptionType).toBe('PRO-YEAR');
      expect(updatedPayment?.price).toBe(99.99);
    } finally {
      if (user) {
        await jestPrisma.userPayment.deleteMany({ where: { userId: user.id } });
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should return count 0 when payment not found', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-notfound-${dateTag}@test.com`, role: 'USER' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await updateUserPayment({
        provider: 'YOOKASSA',
        paymentId: 'nonexistent',
        uniqueKey: 'nonexistent',
        updates: { status: 'SUCCEED' },
      });

      expect(result.count).toBe(0);
    } finally {
      if (user) {
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should throw error when user not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    await expect(
      updateUserPayment({
        provider: 'YOOKASSA',
        paymentId: 'test',
        uniqueKey: 'test',
        updates: { status: 'SUCCEED' },
      }),
    ).rejects.toThrow('Authentication required');
  });
});
