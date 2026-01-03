import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { updateCurrentUser } from '../updateCurrentUser';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('updateCurrentUser', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  it('should update user grade', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-grade-${dateTag}@test.com`, role: 'USER', grade: 'BASIC' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await updateCurrentUser({ grade: 'PREMIUM' });

      expect(result.grade).toBe('PREMIUM');
      expect(result.id).toBe(user.id);
    } finally {
      if (user) {
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should update multiple fields', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-multi-${dateTag}@test.com`, role: 'USER', grade: 'BASIC' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await updateCurrentUser({
        grade: 'PRO',
        role: 'ADMIN',
      });

      expect(result.grade).toBe('PRO');
      expect(result.role).toBe('ADMIN');
      expect(result.id).toBe(user.id);
    } finally {
      if (user) {
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should update user name', async () => {
    const dateTag = formatDateTag();
    let user: TUser | undefined;

    try {
      user = (await jestPrisma.user.create({
        data: { email: `user-name-${dateTag}@test.com`, role: 'USER', name: 'Old Name' },
      })) as TUser;

      mockedGetCurrentUser.mockResolvedValue(user);

      const result = await updateCurrentUser({ name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(result.id).toBe(user.id);
    } finally {
      if (user) {
        await jestPrisma.user.delete({ where: { id: user.id } });
      }
    }
  });

  it('should throw error when user not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    await expect(updateCurrentUser({ grade: 'PREMIUM' })).rejects.toThrow(
      'Authentication required',
    );
  });
});
