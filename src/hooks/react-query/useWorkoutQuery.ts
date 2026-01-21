'use client';

import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { safeJsonParse } from '@/lib/helpers/json';
import { useT } from '@/i18n';
import { defaultStaleTime } from '@/constants';
import { TTopicId } from '@/features/topics/types';
import { TUserId } from '@/features/users/types';
import { createWorkoutStats } from '@/features/workouts/actions/createWorkoutStats';
import { getWorkout } from '@/features/workouts/actions/getWorkout';
import { updateWorkout } from '@/features/workouts/actions/updateWorkout';
import {
  deleteWorkoutFromDB,
  getAllWorkoutTopicIds,
  getWorkoutFromDB,
  saveWorkoutToDB,
} from '@/features/workouts/lib/indexedDB';
import { TWorkoutData } from '@/features/workouts/types';

import { useAvailableTopicById } from './useAvailableTopicById';
import { useQuestionIdsForTopicId } from './useQuestionIdsForTopicId';

const staleTime = defaultStaleTime;

const shuffleQuestionsStr = (ids?: string[]) => {
  if (!ids || !ids.length) {
    return '';
  }
  return [...ids].sort(() => Math.random() - 0.5).join(' ');
};

interface TMemo {
  topicId?: TTopicId;
  userId?: TUserId;
  workout?: TWorkoutData | null;
  questionIds?: string[];
  /** Work only locally, don't update data on the server */
  isOffline?: boolean;
  isWorkoutPending?: boolean;
}

interface TUseWorkoutQueryProps {
  topicId?: TTopicId;
  userId?: TUserId;
  enabled?: boolean;
  preparing?: boolean;
}

export function useWorkoutQuery(props: TUseWorkoutQueryProps) {
  const { enabled = true, preparing, topicId, userId } = props;
  const queryClient = useQueryClient();
  const memo = React.useMemo<TMemo>(() => ({}), []);

  const t = useT();

  const questionIdsQuery = useQuestionIdsForTopicId({ topicId });
  const {
    data: questionIds,
    isLoading: isQuestionIdsLoading,
    isFetched: isQuestionIdsFetched,
  } = questionIdsQuery;

  const isQuestionIdsPending = isQuestionIdsLoading || !isQuestionIdsFetched;

  const availableTopicQuery = useAvailableTopicById({ id: topicId || '' });
  const { topic, isLoading: isTopicLoading, isFetched: isTopicFetched } = availableTopicQuery;
  const isTopicReady = !isTopicLoading && isTopicFetched;
  const isTopicPending = !isTopicReady;

  /** Work only locally, don't update data on the server */
  const isOffline =
    isQuestionIdsPending || isTopicPending || !userId || !topicId || !enabled || !!preparing;

  memo.topicId = topicId;
  memo.userId = userId;
  memo.questionIds = questionIds;
  memo.isOffline = isOffline;

  const queryKey: QueryKey = React.useMemo(() => ['workout', topicId], [topicId]);

  const [localWorkout, setLocalWorkout] = React.useState<TWorkoutData | null>(null);
  const [localInitialized, setLocalInitialized] = React.useState(false);

  // Load from IndexedDB
  React.useEffect(() => {
    let isMounted = true;

    async function loadFromDB() {
      if (!topicId) {
        if (isMounted) {
          setLocalInitialized(true);
        }
        return;
      }

      try {
        const data = await getWorkoutFromDB(topicId);
        if (isMounted) {
          if (data) {
            const workoutData = safeJsonParse<TWorkoutData | null>(JSON.stringify(data), null);
            if (workoutData?.startedAt && typeof workoutData.startedAt === 'string') {
              workoutData.startedAt = new Date(workoutData.startedAt);
            }
            if (workoutData?.finishedAt && typeof workoutData.finishedAt === 'string') {
              workoutData.finishedAt = new Date(workoutData.finishedAt);
            }
            setLocalWorkout(workoutData);
          } else {
            setLocalWorkout(null);
          }
          setLocalInitialized(true);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[useWorkoutQuery:loadFromDB]', 'Failed to load workout from IndexedDB', {
          error,
          topicId,
        });
        debugger; // eslint-disable-line no-debugger
        if (isMounted) {
          setLocalInitialized(true);
        }
      }
    }

    loadFromDB();

    return () => {
      isMounted = false;
    };
  }, [topicId]);

  const query = useQuery<TWorkoutData | null>({
    queryKey,
    staleTime,
    enabled: !isOffline,
    queryFn: async () => {
      try {
        if (!topicId || !userId) {
          return null;
        }
        const serverData: TWorkoutData | undefined = await getWorkout(topicId);
        /* console.log('[useWorkoutQuery:queryFn] Received server data', {
         *   topicId,
         *   userId,
         *   serverData,
         * });
         */
        return serverData || null;
      } catch (error) {
        const details = error instanceof APIError ? error.details : null;
        const message = 'Cannot load workout data';
        // eslint-disable-next-line no-console
        console.error('[useWorkoutQuery:queryFn]', message, { details, error, topicId });
        debugger; // eslint-disable-line no-debugger
        return null;
      }
    },
  });

  const isQueryReady =
    isOffline || (query.isFetched && !query.isLoading && !query.isPending && !query.isRefetching);
  const isWorkoutReady = isTopicReady && isQueryReady && localInitialized;
  const isWorkoutPending = !isWorkoutReady;
  memo.isWorkoutPending = isWorkoutPending;

  const workout = isOffline || !query.data ? localWorkout : query.data;
  memo.workout = workout;

  // console.log('[useWorkoutQuery:DEBUG:XXX]', {
  //   // query,
  //   isTopicReady,
  //   isWorkoutReady,
  //   isWorkoutPending,
  //   localInitialized,
  // });

  // Effect:DEBUG
  React.useEffect(() => {
    console.log('[useWorkoutQuery:Effect:DEBUG]', {
      workout,
      isOffline,
      enabled,
      preparing,
      questionIds,
      isQuestionIdsPending,
      questionIdsQuery,
      topic,
      isWorkoutPending,
      isTopicLoading,
      isTopicFetched,
    });
  }, [
    ///
    workout,
    isOffline,
    enabled,
    preparing,
    topic,
    questionIds,
    isQuestionIdsPending,
    questionIdsQuery,
    isWorkoutPending,
    isTopicLoading,
    isTopicFetched,
  ]);

  const questionOrderedIds = React.useMemo(
    () => (workout?.questionsOrder ? workout?.questionsOrder.split(' ') : []),
    [workout?.questionsOrder],
  );

  const updateWorkoutData = React.useCallback(
    async (data: Partial<TWorkoutData> | undefined) => {
      if (!topicId) {
        return;
      }
      if (!data) {
        await deleteWorkoutFromDB(topicId);
        setLocalWorkout(null);
        return;
      }
      const updatedData = memo.workout ? { ...memo.workout, ...data } : (data as TWorkoutData);
      console.log('[useWorkoutQuery:updateWorkoutData] start', {
        updatedData,
        memo,
        data,
      });
      debugger;
      // Always save to IndexedDB
      await saveWorkoutToDB(topicId, updatedData);
      setLocalWorkout(updatedData);
      memo.workout = updatedData;
      // Save to server if online
      if (!isOffline) {
        try {
          if (data && topicId) {
            const serverData = await updateWorkout(topicId, data);
            /* console.log('[useWorkoutQuery:updateWorkoutData] Saved to server', {
             *   serverData,
             *   updatedData,
             * });
             */
            queryClient.setQueryData(queryKey, serverData);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(
            '[useWorkoutQuery:updateWorkoutData]',
            'Failed to update workout on server',
            {
              error,
              topicId,
              data,
            },
          );
          debugger; // eslint-disable-line no-debugger
          toast.error(t('Workout.FailedToSaveWorkout'));
        }
      }
    },
    [memo, isOffline, topicId, queryClient, queryKey, t],
  );

  const createNewWorkoutData = React.useCallback(() => {
    const { questionIds } = memo;
    const questionsOrder = shuffleQuestionsStr(questionIds);
    const now = new Date();
    const newWorkout: TWorkoutData = {
      questionsCount: questionIds?.length || 0,
      questionsOrder,
      questionResults: '',
      stepIndex: 0,
      started: true,
      finished: false,
      currentRatio: 0,
      currentTime: 0,
      correctAnswers: 0,
      selectedAnswerId: '',
      startedAt: now,
      finishedAt: now,
    };
    console.log('[useWorkoutQuery:createNewWorkoutData]', {
      questionsOrder,
      questionIds,
      now,
      newWorkout,
      memo,
    });
    // debugger;
    return newWorkout;
  }, [memo]);

  const createWorkout = React.useCallback(() => {
    const newWorkout = createNewWorkoutData();
    /* console.log('[useWorkoutQuery:createWorkout]', {
     *   newWorkout,
     * });
     */
    return updateWorkoutData(newWorkout);
  }, [createNewWorkoutData, updateWorkoutData]);

  const startWorkout = React.useCallback(() => {
    const workout = memo.workout || createNewWorkoutData();
    const now = new Date();
    const updatedWorkout: TWorkoutData = {
      ...workout,
      startedAt: now, // (new Date()).toISOString()
      finishedAt: now,
      started: true,
      finished: false,
      stepIndex: 0,
      questionResults: '',
      selectedAnswerId: '', // Answer for the current question. If defined then consider that user already chosen the answer but hasn't went to the next question (show the choice and suggest to go further)
      currentRatio: 0, // Current ratio (if finished)
      currentTime: 0, // Current time remained to thefinish, in seconds (if finished)
      correctAnswers: 0, // Current correct answers count (if finished)
    };
    console.log('[useWorkoutQuery:startWorkout]', {
      updatedWorkout,
    });
    // debugger;
    return updateWorkoutData(updatedWorkout);
  }, [createNewWorkoutData, memo.workout, updateWorkoutData]);

  const finishWorkout = React.useCallback(async () => {
    if (!memo.workout || !topicId) return;

    const { questionResults, startedAt } = memo.workout;
    const totalSteps = questionIds?.length || 0;
    const finishedAt = new Date();
    const results = safeJsonParse<number[]>(questionResults, []);
    const correctAnswers = results.filter(Boolean).length;
    const currentTime = startedAt
      ? Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)
      : 0;
    const currentRatio = totalSteps ? Math.round((100 * correctAnswers) / totalSteps) : 0;

    // Save workout stats to database
    try {
      if (userId) {
        await createWorkoutStats({
          topicId,
          totalQuestions: totalSteps,
          correctAnswers,
          ratio: currentRatio,
          timeSeconds: currentTime,
          startedAt: startedAt || finishedAt,
          finishedAt,
        });
      }
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['workout-stats-history', topicId],
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[useWorkoutQuery:finishWorkout]', 'Failed to save workout stats', {
        error,
        topicId,
        userId,
        totalSteps,
        correctAnswers,
        currentRatio,
        currentTime,
      });
      debugger; // eslint-disable-line no-debugger
    }

    const updateData: Partial<TWorkoutData> = {
      started: false,
      finished: true,
      selectedAnswerId: '',
      stepIndex: 0,
      correctAnswers,
      finishedAt,
      currentTime,
      currentRatio,
    };
    /* console.log('[useWorkoutQuery:finishWorkout]', {
     *   updateData,
     * });
     */

    return updateWorkoutData(updateData);
  }, [memo, questionIds, updateWorkoutData, topicId, userId, queryClient]);

  const goPrevQuestion = React.useCallback(() => {
    if (!memo.workout) return;
    const newStepIndex = memo.workout.stepIndex ? memo.workout.stepIndex - 1 : 0;
    const updateData: Partial<TWorkoutData> = {
      stepIndex: newStepIndex,
      selectedAnswerId: '',
    };
    /* console.log('[useWorkoutQuery:goPrevQuestion]', {
     *   updateData,
     * });
     */
    return updateWorkoutData(updateData);
  }, [memo, updateWorkoutData]);

  const goNextQuestion = React.useCallback(() => {
    if (!memo.workout) return;
    const totalSteps = questionIds?.length || 0;
    const stepIndex = memo.workout.stepIndex || 0;
    if (stepIndex >= totalSteps - 1) {
      return finishWorkout();
    }
    const updateData: Partial<TWorkoutData> = {
      stepIndex: stepIndex + 1,
      selectedAnswerId: '',
    };
    /* console.log('[useWorkoutQuery:goNextQuestion]', {
     *   updateData,
     * });
     */
    return updateWorkoutData(updateData);
  }, [memo, questionIds, finishWorkout, updateWorkoutData]);

  const saveResult = React.useCallback(
    (result: boolean | undefined, selectedAnswerId?: string) => {
      if (!memo.workout) return;
      const currentResults = memo.workout.questionResults || '[]';
      const resultsList = safeJsonParse<(number | null)[]>(currentResults, []);
      const idx = memo.workout.stepIndex || 0;
      const resultVal = result == undefined ? null : Number(result);
      resultsList[idx] = resultVal;
      const correctAnswers = resultsList.filter(Boolean).length;
      const questionResults = JSON.stringify(resultsList);
      const updateData: Partial<TWorkoutData> = {
        questionResults,
        correctAnswers,
      };
      if (selectedAnswerId) {
        updateData.selectedAnswerId = selectedAnswerId;
      }
      console.log('[useWorkoutQuery:saveResult]', {
        updateData,
      });
      debugger;
      return updateWorkoutData(updateData);
    },
    [memo, updateWorkoutData],
  );

  const saveAnswer = React.useCallback(
    (selectedAnswerId?: string) => {
      const updateData: Partial<TWorkoutData> = {
        selectedAnswerId: selectedAnswerId || '',
      };
      console.log('[useWorkoutQuery:saveAnswer]', {
        updateData,
      });
      // debugger;
      return updateWorkoutData(updateData);
    },
    [updateWorkoutData],
  );

  const saveResultAndGoNext = React.useCallback(
    (result: boolean | undefined) => {
      /* console.log('[useWorkoutQuery:saveResultAndGoNext]', {
       *   result,
       * });
       */
      saveResult(result);
      goNextQuestion();
    },
    [saveResult, goNextQuestion],
  );

  return React.useMemo(
    () => ({
      workout,
      questionIds,
      questionOrderedIds,
      topicId,
      topic,
      isTopicPending,
      userId,
      pending: !isWorkoutReady,
      isWorkoutReady,
      queryKey,
      createWorkout,
      startWorkout,
      finishWorkout,
      goPrevQuestion,
      goNextQuestion,
      saveResult,
      saveAnswer,
      saveResultAndGoNext,
      updateWorkoutData,
      ...query,
    }),
    [
      workout,
      questionIds,
      questionOrderedIds,
      topicId,
      topic,
      isTopicPending,
      userId,
      isWorkoutReady,
      queryKey,
      createWorkout,
      startWorkout,
      finishWorkout,
      goPrevQuestion,
      goNextQuestion,
      saveResult,
      saveAnswer,
      saveResultAndGoNext,
      updateWorkoutData,
      query,
    ],
  );
}

export async function getAllLocalWorkoutTopicIds(): Promise<string[]> {
  try {
    return await getAllWorkoutTopicIds();
  } catch (error) {
    const message = 'Failed to get workout topic IDs from IndexedDB';
    // eslint-disable-next-line no-console
    console.error('[useWorkoutQuery:getAllLocalWorkoutTopicIds]', message, {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    return [];
  }
}
