import { useSession } from 'next-auth/react';

import { TUser } from '@/features/users/types/TUser';

/** Client: Get user from client session.
 * Use `getCurrentUser` fro server components.
 */
export function useSessionUser() {
  const session = useSession();
  const user: TUser | undefined = session.data?.user;
  return user;
}

export function useSessionData() {
  const session = useSession();
  const { data, status } = session;
  const user: TUser | undefined = session.data?.user;
  const loading = status === 'loading';
  return { data, status, loading, user };
}
