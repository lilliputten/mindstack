import React from 'react';
import { QueryKey, useQuery } from '@tanstack/react-query';

import { defaultStaleTime } from '@/constants';

import { getUserById } from '../actions';
import { TUser } from '../types';

const staleTime = defaultStaleTime;

export function useUserById(userId: string | undefined) {
  const queryKey: QueryKey = React.useMemo(() => ['user-by-id', userId], [userId]);

  const queryFn = React.useCallback(async () => {
    if (!userId) return undefined;
    try {
      return await getUserById(userId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[useUserById:queryFn] Error getting user', {
        userId,
        error,
      });
      throw error;
    }
  }, [userId]);

  const query = useQuery<TUser | undefined>({
    queryKey,
    staleTime,
    enabled: !!userId,
    queryFn,
  });

  const user = query.data;
  const loading = !query.isFetched || query.isLoading;

  return React.useMemo(
    () => ({
      user,
      loading,
      queryKey,
      ...query,
    }),
    [user, loading, queryKey, query],
  );
}
