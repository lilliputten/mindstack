import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { updateUser } from '../updateUser';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('updateUser', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  it('should allow user to update their own data', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-own-${dateTag}@test.com`, role: 'USER', grade: 'BASIC' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await updateUser({
        userId: user.id,
        data: { grade: 'PREMIUM' },
      });

      expect(result.grade).toBe('PREMIUM');
      expect(result.id).toBe(user.id);
    } finally {
      if (user) {
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should allow admin to update any user', async () => {
    const dateTag = formatDateTag();
    let admin: TUser | undefined;
    let targetUser: TUser | undefined;

    try {
      admin = (await jestPrisma.user.create({
        data: { email: `admin-${dateTag}@test.com`, role: 'ADMIN', grade: 'BASIC' },
      })) as TUser;

      targetUser = (await jestPrisma.user.create({
        data: { email: `target-${dateTag}@test.com`, role: 'USER', grade: 'BASIC' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(admin);

      const result = await updateUser({
        userId: targetUser.id,
        data: { grade: 'PRO' },
      });

      expect(result.grade).toBe('PRO');
      expect(result.id).toBe(targetUser.id);
    } finally {
      if (targetUser) {
        await jestPrisma.user.delete({ where: { id: targetUser.id } });
      }
      if (admin) {
        await jestPrisma.user.delete({ where: { id: admin.id } });
      }
    }
  });

  it('should prevent non-admin user from updating other users', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;
    let otherUser: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-nonadmin-${dateTag}@test.com`, role: 'USER', grade: 'BASIC' },
      })) as TUser;

      otherUser = (await jestPrisma.user.create({
        data: { email: `other-nonadmin-${dateTag}@test.com`, role: 'USER', grade: 'BASIC' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      await expect(
        updateUser({
          userId: otherUser.id,
          data: { grade: 'PRO' },
        }),
      ).rejects.toThrow('Not authorized to update this user');
    } finally {
      if (otherUser) {
        await jestPrisma.user.delete({ where: { id: otherUser.id } });
      }
      if (user) {
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should throw error when user not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    await expect(
      updateUser({
        userId: 'some-id',
        data: { grade: 'PREMIUM' },
      }),
    ).rejects.toThrow('Authentication required');
  });
});
