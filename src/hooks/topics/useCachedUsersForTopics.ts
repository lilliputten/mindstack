import React from 'react';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { TTopic } from '@/features/topics/types';
import { getUsersByIdsList } from '@/features/users/actions';
import { TUser, TUserId } from '@/features/users/types/TUser';

export type TCachedUsers = Record<TUserId, TUser>;

interface TMemo {
  cachedUsers: TCachedUsers;
  loadingIds: TUserId[];
}

interface TUseCachedUsersProps {
  topics: TTopic[];
  bypass: boolean;
}

export function useCachedUsersForTopics(props: TUseCachedUsersProps) {
  const { topics, bypass } = props;
  const [cachedUsers, setCachedUsers] = React.useState<TCachedUsers>({});
  const memo = React.useMemo<TMemo>(() => ({ cachedUsers: {}, loadingIds: [] }), []);
  React.useEffect(() => {
    if (bypass) {
      // User's data isn't required, do nothing
      return;
    }
    const { cachedUsers, loadingIds } = memo;
    const missedIds = topics
      .map(({ userId }) => userId)
      // Filter not loading and absent ids
      .filter((id) => !cachedUsers[id] && !loadingIds.includes(id))
      // Filter unique values only
      .filter((value, index, self) => self.indexOf(value) === index);
    // Nothing to do...
    if (!missedIds.length) {
      return;
    }
    loadingIds.push(...missedIds);
    getUsersByIdsList(missedIds)
      .then((users) => {
        setCachedUsers((cachedUsers) => {
          const updatedCachedUsers = { ...cachedUsers };
          users.forEach((user) => {
            updatedCachedUsers[user.id] = user;
          });
          memo.cachedUsers = updatedCachedUsers;
          return updatedCachedUsers;
        });
      })
      .catch((error) => {
        const message = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[ManageTopicsListCard:useCachedUsersForTopics:getUsersByIdsList]', message, {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error('Error loading users data.');
      })
      .finally(() => {
        memo.loadingIds = memo.loadingIds.filter((id) => !memo.loadingIds.includes(id));
      });
  }, [bypass, topics, memo]);
  return cachedUsers;
}
