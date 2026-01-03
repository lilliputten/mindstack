'use server';

import { z } from 'zod';

import { UserSchema } from '@/generated/prisma';

import { getCurrentUser } from '@/lib/session';

import { updateUser } from './updateUser';

const _updateCurrentUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

type UpdateCurrentUserData = z.infer<typeof _updateCurrentUserSchema>;

export async function updateCurrentUser(data: UpdateCurrentUserData) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error('Authentication required');
    }

    return await updateUser({ userId: user.id, data });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateCurrentUser] catch', {
      error,
      data,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
