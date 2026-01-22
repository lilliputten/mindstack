'use client';

import React from 'react';
import { InfiniteData, QueryKey, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { TAllUsedKeys } from '@/lib/types/react-query';
import { composeUrlQuery, getErrorText } from '@/lib/helpers';
import {
  addNewItemToQueryCache,
  deleteItemFromQueryCache,
  getUnqueItemsList,
  invalidateAllUsedKeysExcept,
  stringifyQueryKey,
  updateItemInQueryCache,
} from '@/lib/helpers/react-query';
import { defaultItemsLimit, defaultStaleTime } from '@/constants';
import { getAvailableWorkouts } from '@/features/workouts/actions/getAvailableWorkouts';
import {
  convertWorkoutsToUserTopicWorkouts,
  getAllWorkoutsFromDB,
  guestUserId,
} from '@/features/workouts/lib/indexedDB';
import {
  TAvailableWorkoutsResultsQueryData,
  TGetAvailableWorkoutsParams,
  TUserTopicWorkout,
} from '@/features/workouts/types';
import { useSessionData } from '@/hooks';

const itemsLimit = defaultItemsLimit;
const staleTime = defaultStaleTime;

/** Collection of all used query keys (may already be invalidated) */
const allUsedKeys: TAllUsedKeys = {};

type TUseAvailableWorkoutsProps = Omit<TGetAvailableWorkoutsParams, 'skip' | 'take'> & {
  traceId?: string;
  enabled?: boolean;
  all?: boolean;
};

export function useAvailableWorkouts(props: TUseAvailableWorkoutsProps = {}) {
  const { all, traceId, enabled = true, ...queryProps } = props;

  const { authenticated: isAuthenticated, loading: isUserLoading } = useSessionData();

  const isLocal = !isUserLoading && !isAuthenticated;

  const queryClient = useQueryClient();

  /* Use partial query url as part of the query key */
  const queryUrlHash = React.useMemo(() => {
    // Convert Date objects to ISO strings for URL composition
    const urlParams = {
      ...queryProps,
      minStarted: queryProps.minStarted?.toISOString(),
      maxStarted: queryProps.maxStarted?.toISOString(),
      minFinished: queryProps.minFinished?.toISOString(),
      maxFinished: queryProps.maxFinished?.toISOString(),
    };
    return composeUrlQuery(urlParams);
  }, [queryProps]);

  const queryKey = React.useMemo<QueryKey>(
    () => ['available-workouts', all ? 'all' : 'incremental', queryUrlHash, isLocal],
    [all, queryUrlHash, isLocal],
  );
  allUsedKeys[stringifyQueryKey(queryKey)] = queryKey;

  const isEnabled = enabled && !isUserLoading;

  const queryFn = React.useCallback(
    async (params: { pageParam?: number }) => {
      const { pageParam = 0 } = params;
      // If not authenticated, fall back to IndexedDB
      if (isLocal) {
        try {
          const allWorkouts = await getAllWorkoutsFromDB();
          const convertedWorkouts = convertWorkoutsToUserTopicWorkouts(allWorkouts, guestUserId);
          return {
            items: convertedWorkouts,
            totalCount: convertedWorkouts.length,
            hasNextPage: false,
          };
        } catch (error) {
          const message = 'Cannot load workouts from IndexedDB';
          // eslint-disable-next-line no-console
          console.error('[useAvailableWorkouts:queryFn]', message, {
            error,
            pageParam,
          });
          return {
            items: [],
            totalCount: 0,
            hasNextPage: false,
          };
        }
      }
      // Regular API call for authenticated users
      try {
        const result = await getAvailableWorkouts({
          ...queryProps,
          skip: pageParam,
          take: all ? undefined : itemsLimit,
        });
        return {
          ...result,
          hasNextPage: all ? false : result.items.length >= itemsLimit,
        };
      } catch (error) {
        const details = getErrorText(error);
        const message = 'Cannot load workouts data';
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[useAvailableWorkouts:queryFn]', traceId, comboMsg, {
          traceId,
          details,
          error,
          pageParam,
        });
        throw error;
      }
    },
    [isLocal, queryProps, all, traceId],
  );

  const query = useInfiniteQuery<
    TAvailableWorkoutsResultsQueryData,
    Error,
    InfiniteData<TAvailableWorkoutsResultsQueryData>,
    QueryKey,
    number // Cursor type (from `skip` api parameter)
  >({
    enabled: isEnabled,
    queryKey,
    staleTime,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, page) => acc + page.items.length, 0);
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    queryFn,
  });

  // Create workout items with synthetic IDs for React Query helpers
  const allWorkouts = React.useMemo(() => {
    const workoutsWithIds =
      query.data?.pages.flatMap((page) =>
        page.items.map((workout) => ({
          ...workout,
          id: `${workout.userId}_${workout.topicId}`, // Synthetic composite ID
        })),
      ) || [];
    return getUnqueItemsList([{ items: workoutsWithIds, totalCount: workoutsWithIds.length }]);
  }, [query.data?.pages]);

  /** Add new workout record to the pages data */
  const addNewWorkout = React.useCallback(
    (newWorkout: TUserTopicWorkout, toStart: boolean = true) => {
      const workoutWithId = {
        ...newWorkout,
        id: `${newWorkout.userId}_${newWorkout.topicId}`,
      };
      return addNewItemToQueryCache(queryClient, queryKey, workoutWithId, toStart);
    },
    [queryClient, queryKey],
  );

  /** Delete the specified workout (by composite ID) from the pages data */
  const deleteWorkout = React.useCallback(
    (workoutCompositeId: string) =>
      deleteItemFromQueryCache(queryClient, queryKey, workoutCompositeId),
    [queryClient, queryKey],
  );

  /** Update the specified workout in the pages data */
  const updateWorkout = React.useCallback(
    (updatedWorkout: TUserTopicWorkout) => {
      const workoutWithId = {
        ...updatedWorkout,
        id: `${updatedWorkout.userId}_${updatedWorkout.topicId}`,
      };
      return updateItemInQueryCache(queryClient, queryKey, workoutWithId);
    },
    [queryClient, queryKey],
  );

  /** Invalidate all used keys, except optional specified ones */
  const invalidateAllKeysExcept = React.useCallback(
    (excludeKeys?: QueryKey[]) =>
      invalidateAllUsedKeysExcept(queryClient, excludeKeys, allUsedKeys),
    [queryClient],
  );

  return React.useMemo(() => {
    return {
      ...query,
      isLocal,
      // isEnabled: enabled,
      queryClient,
      queryKey,
      allUsedKeys,
      allWorkouts,
      hasWorkouts: !!allWorkouts.length,
      // Helpers...
      addNewWorkout,
      deleteWorkout,
      updateWorkout,
      invalidateAllKeysExcept,
      queryUrlHash,
    };
  }, [
    query,
    isLocal,
    queryClient,
    queryKey,
    allWorkouts,
    addNewWorkout,
    deleteWorkout,
    updateWorkout,
    invalidateAllKeysExcept,
    queryUrlHash,
  ]);
}

export type TUseAvailableWorkoutsResult = ReturnType<typeof useAvailableWorkouts>;
