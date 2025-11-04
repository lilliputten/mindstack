'use client';

import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { safeJsonParse } from '@/lib/helpers/json';
import { defaultStaleTime } from '@/constants';
import { TTopicId } from '@/features/topics/types';
import { TUserId } from '@/features/users/types';
import { createWorkoutStats } from '@/features/workouts/actions/createWorkoutStats';
import { getWorkout } from '@/features/workouts/actions/getWorkout';
import { updateWorkout } from '@/features/workouts/actions/updateWorkout';
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
  isOffline?: boolean;
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

  const questionIdsQuery = useQuestionIdsForTopicId({ topicId });
  const {
    data: questionIds,
    isLoading: isQuestionIdsLoading,
    isFetched: isQuestionIdsFetched,
  } = questionIdsQuery;

  const isQuestionIdsPending = isQuestionIdsLoading || !isQuestionIdsFetched;

  const availableTopicQuery = useAvailableTopicById({ id: topicId || '' });
  const { topic, isLoading: isTopicLoading, isFetched: isTopicFetched } = availableTopicQuery;
  const isTopicPending = isTopicLoading || !isTopicFetched;

  const isOffline =
    isQuestionIdsPending || isTopicPending || !userId || !topicId || !enabled || !!preparing;

  memo.topicId = topicId;
  memo.userId = userId;
  memo.questionIds = questionIds;
  memo.isOffline = isOffline;

  const queryKey: QueryKey = React.useMemo(() => ['workout', topicId], [topicId]);

  const [localWorkout, setLocalWorkout] = React.useState<TWorkoutData | null>(null);
  const [localInitialized, setLocalInitialized] = React.useState(false);

  // Load from localStorage
  React.useEffect(() => {
    if (typeof localStorage === 'object' && topicId) {
      try {
        const stored = localStorage.getItem(`workout-${topicId}`);
        const data = safeJsonParse<TWorkoutData | null>(stored, null);
        if (data?.startedAt && typeof data.startedAt === 'string') {
          data.startedAt = new Date(data.startedAt);
        }
        if (data?.finishedAt && typeof data.finishedAt === 'string') {
          data.finishedAt = new Date(data.finishedAt);
        }
        setLocalWorkout(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load workout from localStorage:', error);
        debugger; // eslint-disable-line no-debugger
      }
    }
    setLocalInitialized(true);
  }, [topicId]);

  // Save to localStorage
  const saveToLocalStorage = React.useCallback(
    (workout: TWorkoutData | null) => {
      if (typeof localStorage === 'object' && topicId) {
        try {
          if (workout) {
            localStorage.setItem(`workout-${topicId}`, JSON.stringify(workout));
          } else {
            localStorage.removeItem(`workout-${topicId}`);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to save workout to localStorage:', error);
          debugger; // eslint-disable-line no-debugger
        }
      }
    },
    [topicId],
  );

  const isQueryEnabled = !!userId && !!topicId && !!enabled && !preparing;

  const query = useQuery<TWorkoutData | null>({
    queryKey,
    staleTime,
    enabled: isQueryEnabled, // !isOffline && localInitialized,
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

  const workout = isOffline || !query.data ? localWorkout : query.data;
  memo.workout = workout;

  const questionOrderedIds = React.useMemo(
    () => (workout?.questionsOrder ? workout?.questionsOrder.split(' ') : []),
    [workout?.questionsOrder],
  );

  const updateWorkoutData = React.useCallback(
    async (data: Partial<TWorkoutData> | undefined) => {
      if (!data) {
        saveToLocalStorage(null);
        setLocalWorkout(null);
        return;
      }
      const updatedData = memo.workout ? { ...memo.workout, ...data } : (data as TWorkoutData);
      // Always save to localStorage
      saveToLocalStorage(updatedData);
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
          console.error('Failed to update workout on server:', error);
          debugger; // eslint-disable-line no-debugger
          toast.error('Failed to save workout');
        }
      }
    },
    [memo, saveToLocalStorage, isOffline, topicId, queryClient, queryKey],
  );

  const createNewWorkoutData = React.useCallback(() => {
    const questionsOrder = shuffleQuestionsStr(memo.questionIds);
    const now = new Date();
    const newWorkout: TWorkoutData = {
      questionsCount: memo.questionIds?.length || 0,
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
    return newWorkout;
  }, [memo]);

  const createWorkout = React.useCallback(() => {
    const newWorkout = createNewWorkoutData();
    /* console.log('[useWorkoutQuery:createWorkout]', {
     *   newWorkout,
     * });
     */
    updateWorkoutData(newWorkout);
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
    /* console.log('[useWorkoutQuery:startWorkout]', {
     *   updatedWorkout,
     * });
     */
    updateWorkoutData(updatedWorkout);
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
      console.error('Failed to save workout stats:', error);
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

    updateWorkoutData(updateData);
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
    updateWorkoutData(updateData);
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
    updateWorkoutData(updateData);
  }, [memo, questionIds, finishWorkout, updateWorkoutData]);

  const saveResult = React.useCallback(
    (result: boolean | undefined) => {
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
      /* console.log('[useWorkoutQuery:saveResult]', {
       *   updateData,
       * });
       */
      updateWorkoutData(updateData);
    },
    [memo, updateWorkoutData],
  );

  const saveAnswer = React.useCallback(
    (selectedAnswerId?: string) => {
      const updateData: Partial<TWorkoutData> = {
        selectedAnswerId: selectedAnswerId || '',
      };
      /* console.log('[useWorkoutQuery:saveAnswer]', {
       *   updateData,
       * });
       */
      updateWorkoutData(updateData);
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

  const isFetched = query.isFetched || !isQueryEnabled;
  const isPending = !isFetched || query.isLoading || !localInitialized;

  return {
    workout,
    questionIds,
    questionOrderedIds,
    topicId,
    topic,
    isTopicPending,
    userId,
    pending: isPending,
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
  };
}
