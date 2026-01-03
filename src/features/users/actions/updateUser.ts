'use server';

import { z } from 'zod';

import { UserSchema } from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const updateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

type UpdateUserData = {
  userId: string;
  data: z.infer<typeof updateUserSchema>;
};

export async function updateUser({ userId, data }: UpdateUserData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Authentication required');
    }

    // Check authorization: admin can update any user, users can only update themselves
    if (currentUser.role !== 'ADMIN' && currentUser.id !== userId) {
      throw new Error('Not authorized to update this user');
    }

    const updateData = updateUserSchema.parse(data);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return updatedUser;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateUser] catch', {
      error,
      userId,
      data,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
