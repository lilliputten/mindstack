'use server';

import { TelegramUserData } from '@telegram-auth/server';

import { prisma } from '@/lib/db';

export async function createUserOrUpdateTelegramUser(user: TelegramUserData) {
  const provider = 'telegram-auth';
  const providerAccountId = user.id.toString();
  // User id is a telegram id
  const userId = providerAccountId;
  const { first_name, photo_url } = user;
  const userData = {
    name: first_name,
    image: photo_url,
  };
  const accountData = {
    // userId: userId,
    type: 'credentials',
    provider,
    providerAccountId,
  };

  try {
    // New approach
    const foundAccount = await prisma.account.findFirst({
      where: {
        provider,
        providerAccountId,
      },
    });
    const foundUser = await prisma.user.findFirst({
      where: {
        id: userId,
        // Try to find by linked account?
        accounts: {
          some: {
            provider,
            providerAccountId,
          },
        },
      },
    });

    return await prisma.$transaction(async (tx) => {
      let finalUser = foundUser;
      if (!finalUser) {
        finalUser = await tx.user.create({
          data: {
            id: userId,
            ...userData,
          },
        });
      } else {
        finalUser = await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            ...userData,
          },
        });
      }
      let finalAccount = foundAccount;
      if (!finalAccount) {
        finalAccount = await tx.account.create({
          data: {
            userId,
            ...accountData,
          },
        });
      }
      return finalUser;
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[createUserOrUpdateTelegramUser:transaction] catch', {
      error,
    });
    // debugger; // eslint-disable-line no-debugger
    throw error;
  }
  /*
   * // Old approach
   * await prisma.account.upsert({
   *   where: {
   *     userId: userId,
   *     provider,
   *     providerAccountId,
   *   },
   *   create: {
   *     userId: userId,
   *     type: 'credentials',
   *     provider,
   *     providerAccountId,
   *   },
   *   update: {
   *     userId: userId,
   *     type: 'credentials',
   *     provider,
   *     providerAccountId,
   *   },
   * });
   */
}
