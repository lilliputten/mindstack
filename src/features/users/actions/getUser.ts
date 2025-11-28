'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { DatabaseError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';

import { TUser } from '../types/TUser';

interface TParams {
  where: Prisma.UserWhereUniqueInput;
  include?: Prisma.UserInclude;
}
export async function getUser(params: TParams) {
  const { where, include = null } = params;
  try {
    const user = await prisma.user.findUnique({ where, include });
    if (!user) {
      return undefined;
    }
    return user as TUser;
  } catch (error) {
    const errorMessage = getErrorText(error);
    const nextMessage = [
      // Combine error message
      'User not found',
      errorMessage,
    ]
      .filter(Boolean)
      .join(': ');
    const nextError = new DatabaseError(nextMessage);
    // eslint-disable-next-line no-console
    console.warn('[getUser]', nextMessage, {
      nextError,
      errorMessage,
      error,
    });
    debugger; // eslint-disable-line no-debugger
    // NOTE: Re-throw an error?
    // throw nextError;
    return undefined;
  }
}
