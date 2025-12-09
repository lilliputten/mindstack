// This file should only be used in server components
'use server';

import { cache } from 'react';

import { auth } from '@/auth';
import {
  checkIfUserExists,
  TCheckIfUserExistsParams,
} from '@/features/users/helpers/checkIfUserExists';
import { TUser } from '@/features/users/types/TUser';

type TParams = Omit<TCheckIfUserExistsParams, 'id'>;

/** Get user data.
 * NOTE: Use `useSessionData` on the client.
 */
export const getCurrentUser = cache<(params?: TParams) => Promise<TUser | undefined>>(
  async (params: TParams = {}) => {
    const session = await auth();
    const user = session?.user;
    const id = user?.id;
    if (!id) {
      return undefined;
    }
    // TODO: Check also if the user really exists in the database>
    return await checkIfUserExists({ ...params, id });
  },
);

export async function isLoggedUser() {
  const user = await getCurrentUser();
  return !!user;
}

export async function isAdminUser() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  return isAdmin;
}
