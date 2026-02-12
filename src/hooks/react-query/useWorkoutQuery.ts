'use client';

import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorText, invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers';
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
import { TWorkout, TWorkoutData } from '@/features/workouts/types';

import { useSessionData } from '../useSessionUser';
import { useAvailableTopicById } from './useAvailableTopicById';
import { useQuestionIdsForTopicId } from './useQuestionIdsForTopicId';

interface TUseWorkoutQueryProps {
  topicId?: TTopicId;
  enabled?: boolean;
  traceId?: string;
}

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
  query?: ReturnType<typeof useQuery>;
  mounted?: boolean;
}

export function useWorkoutQuery(props: TUseWorkoutQueryProps) {
  const { enabled = true, topicId, traceId } = props;
  const queryClient = useQueryClient();
  const memo = React.useMemo<TMemo>(() => ({}), []);

  const t = useT();

  const { authenticated: isAuthenticated, loading: isUserLoading } = useSessionData();

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

  // AKA isOffline
  const isLocal = !isUserLoading && !isAuthenticated;

  memo.topicId = topicId;
  memo.questionIds = questionIds;

  const queryKey: QueryKey = React.useMemo(() => ['workout', topicId], [topicId]);

  const areDepsReady = !isUserLoading && !isTopicPending && !isQuestionIdsPending;
  const isEnabled = enabled && areDepsReady;

  const fetchFromIndexedDB = React.useCallback(async (topicId?: string) => {
    if (!topicId) {
      return undefined;
    }
    const data = await getWorkoutFromDB(topicId);
    if (!data) {
      return undefined;
    }
    const workoutData = safeJsonParse<TWorkoutData | undefined>(JSON.stringify(data), undefined);
    if (!workoutData) {
      return undefined;
    }
    // WTF?
    if (workoutData.startedAt && typeof workoutData.startedAt === 'string') {
      workoutData.startedAt = new Date(workoutData.startedAt);
    }
    if (workoutData.finishedAt && typeof workoutData.finishedAt === 'string') {
      workoutData.finishedAt = new Date(workoutData.finishedAt);
    }
    return workoutData;
  }, []);

  const queryFn = React.useCallback(async () => {
    try {
      if (!topicId) return null;

      const result = await Promise.race([
        isLocal ? fetchFromIndexedDB(topicId) : getWorkout(topicId),
        new Promise<never>((_, reject) => setTimeout(() => reject('timeout'), 10000)),
      ]);

      return result || null;
    } catch (error) {
      if (!memo.mounted) {
        const message = 'Query failed while unmounted. Probably, that is not an error.';
        // eslint-disable-next-line no-console
        console.warn('[useWorkoutQuery:queryFn]', traceId, message, { topicId });
      } else if (error === 'timeout') {
        const message = 'Query has been timed out and will be started over';
        // eslint-disable-next-line no-console
        console.warn('[useWorkoutQuery:queryFn]', traceId, message, { topicId });
      } else {
        const message = 'Cannot load workout data';
        // eslint-disable-next-line no-console
        console.error('[useWorkoutQuery:queryFn]', traceId, message, {
          traceId,
          error,
          topicId,
          errorDetails: getErrorText(error),
        });
        debugger; // eslint-disable-line no-debugger
        throw error;
      }
      return null;
    }
  }, [memo, isLocal, topicId, fetchFromIndexedDB, traceId]);

  const query = useQuery<TWorkoutData | null>({
    queryKey,
    staleTime,
    enabled: isEnabled,
    queryFn: queryFn,
  });
  memo.query = query;

  React.useEffect(() => {
    const query = memo.query;
    if (query) {
      memo.mounted = true;
      return () => {
        memo.mounted = false;
        const { isFetching } = query;
        if (isFetching) {
          queryClient.cancelQueries({ queryKey, exact: true });
          queryClient.resetQueries({ queryKey, exact: true });
          queryClient.removeQueries({ queryKey, exact: true });
        }
      };
    }
  }, [memo, queryKey, queryClient]);

  const isQueryReady =
    query.isFetched && !query.isLoading && !query.isPending && !query.isRefetching;
  const isWorkoutReady = areDepsReady && isQueryReady;

  const workout = query.data;
  memo.workout = workout;

  const questionOrderedIds = React.useMemo(
    () => (workout?.questionsOrder ? workout?.questionsOrder.split(' ') : []),
    [workout?.questionsOrder],
  );

  const updateWorkoutData = React.useCallback(
    async (data: Partial<TWorkout> | undefined) => {
      if (!topicId) {
        return;
      }
      if (!data) {
        await deleteWorkoutFromDB(topicId);
        // setLocalWorkout(undefined);
        return;
      }
      const updatedData = memo.workout ? { ...memo.workout, ...data } : (data as TWorkoutData);
      // Always save to IndexedDB
      await saveWorkoutToDB(topicId, updatedData);
      // setLocalWorkout(updatedData);
      memo.workout = updatedData;
      // Save to server if online
      if (!isLocal) {
        try {
          await updateWorkout(topicId, updatedData);
        } catch (error) {
          const message = 'Failed to update workout on server';
          // eslint-disable-next-line no-console
          console.error('[useWorkoutQuery:updateWorkoutData]', message, {
            error,
            topicId,
            data,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(t('Workout.FailedToSaveWorkout'));
        }
      }
      queryClient.setQueryData(queryKey, updatedData);
      // Invalidate queries
      const invalidatePrefixes = [
        // Invalidate all possible keys
        ['workout', topicId],
        ['available-workouts'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [queryKey]);
    },
    [memo, isLocal, topicId, queryClient, queryKey, t],
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
    return newWorkout;
  }, [memo]);

  const createWorkout = React.useCallback(() => {
    const newWorkout = createNewWorkoutData();
    return updateWorkoutData(newWorkout);
  }, [createNewWorkoutData, updateWorkoutData]);

  const startWorkout = React.useCallback(() => {
    const { questionIds } = memo;
    const workout = memo.workout
      ? { ...memo.workout, questionsOrder: shuffleQuestionsStr(questionIds) }
      : createNewWorkoutData();
    const now = new Date();
    const updatedWorkout: TWorkoutData = {
      ...workout,
      startedAt: now,
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
    return updateWorkoutData(updatedWorkout);
  }, [createNewWorkoutData, memo, updateWorkoutData]);

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
      if (!isLocal) {
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

    return updateWorkoutData(updateData);
  }, [memo, questionIds, updateWorkoutData, topicId, queryClient, isLocal]);

  const goPrevQuestion = React.useCallback(() => {
    if (!memo.workout) return;
    const newStepIndex = memo.workout.stepIndex ? memo.workout.stepIndex - 1 : 0;
    const updateData: Partial<TWorkoutData> = {
      stepIndex: newStepIndex,
      selectedAnswerId: '',
    };
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
      return updateWorkoutData(updateData);
    },
    [memo, updateWorkoutData],
  );

  const saveResultAndGoNext = React.useCallback(
    async (result: boolean | undefined) => {
      await saveResult(result);
      await goNextQuestion();
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
      pending: !isWorkoutReady,
      queryKey,
      createWorkout,
      startWorkout,
      finishWorkout,
      goPrevQuestion,
      goNextQuestion,
      saveResult,
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
      isWorkoutReady,
      queryKey,
      createWorkout,
      startWorkout,
      finishWorkout,
      goPrevQuestion,
      goNextQuestion,
      saveResult,
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
