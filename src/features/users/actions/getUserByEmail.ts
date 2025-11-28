'use server';

import { prisma } from '@/lib/db';

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        name: true,
        emailVerified: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}
