'use client';

import React from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { useAvailableQuestionById } from '@/hooks/react-query/useAvailableQuestionById';
import { buttonVariants } from '@/components/ui/Button';
import { WorkoutQuestion } from '@/components/pages/AvailableTopics/WorkoutQuestion/WorkoutQuestion';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { availableTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useAvailableAnswers } from '@/hooks';

import { WorkoutQuestionBlockSkeleton } from './WorkoutQuestionBlockSkeleton';

interface TMemo {
  nextPageTimerHandler?: ReturnType<typeof setTimeout>;
  isGoingOut?: boolean;
}

export function WorkoutQuestionBlock() {
  const t = useT();
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const workoutContext = useWorkoutContext();
  const {
    topicId,
    workout,
    questionOrderedIds,
    saveResultAndGoNext,
    saveResult,
    finishWorkout,
    goNextQuestion,
    goPrevQuestion,
    pending: isWorkoutPending,
  } = workoutContext;

  const totalSteps = questionOrderedIds.length;
  const stepIndex = workout?.stepIndex || 0;
  const currentStep = stepIndex + 1;
  const questionId = questionOrderedIds[stepIndex];
  const isExceed = currentStep > totalSteps;

  const handleFinishWorkout = React.useCallback(() => {
    finishWorkout();
    // setTimeout(() => {
    //   goToTheRoute(workoutRoutePath);
    // }, 10);
  }, [finishWorkout]);

  // Effect:Exceed
  React.useEffect(() => {
    if (isExceed && !memo.isGoingOut && !isWorkoutPending) {
      const error = new Error(
        `The step index (${currentStep}) exceeds the total steps count (${totalSteps})`,
      );
      // eslint-disable-next-line no-console
      console.warn('[WorkoutQuestionBlock:Effect:Exceed]', error, {
        totalSteps,
        currentStep,
      });
      handleFinishWorkout();
      const handler = setTimeout(() => {
        memo.isGoingOut = true;
      }, 1000);
      return () => {
        clearTimeout(handler);
      };
    }
  }, [isWorkoutPending, memo, handleFinishWorkout, isExceed, currentStep, totalSteps]);

  const availableQuestionQuery = useAvailableQuestionById({ id: questionId });
  const {
    question,
    isFetched: isQuestionFetched,
    isLoading: isQuestionLoading,
  } = availableQuestionQuery;

  // Fetch answers using dedicated hook
  const availableAnswersQuery = useAvailableAnswers({
    itemsLimit: null,
    questionId,
    // enabled: !!questionId,
  });
  const {
    allAnswers: answers,
    isLoading: isAnswersLoading,
    error: answersError,
  } = availableAnswersQuery;

  const isLoadingOverall =
    (!question || !answers) && (isAnswersLoading || !isQuestionFetched || isQuestionLoading);

  // Handle answers loading error
  React.useEffect(() => {
    if (answersError) {
      const message = t('WorkoutQuestion.CannotLoadAnswersData');
      toast.error(message);
    }
  }, [answersError, t]);

  const goToTheNextQuestion = React.useCallback(() => {
    if (memo.nextPageTimerHandler) {
      clearTimeout(memo.nextPageTimerHandler);
      memo.nextPageTimerHandler = undefined;
    }
    goNextQuestion();
  }, [memo, goNextQuestion]);

  const goToThePrevQuestion = React.useCallback(() => {
    goPrevQuestion();
  }, [goPrevQuestion]);

  const onAnswerSelect = React.useCallback(
    async (answerId: string) => {
      const answer = answers.find(({ id }) => id === answerId);
      if (answer) {
        const { isCorrect } = answer;
        // Update workout with result and move to next question
        await saveResult(isCorrect, answerId);
        /* // UNUSED: Auto-advance after delay (?)
         * if (isCorrect) {
         *   memo.nextPageTimerHandler = setTimeout(goToTheNextQuestion, 2000);
         * }
         */
      }
    },
    [answers, saveResult],
  );

  const onSkip = React.useCallback(() => {
    // Update workout with false result and move to next question
    saveResultAndGoNext(undefined);
  }, [saveResultAndGoNext]);

  if (isLoadingOverall) {
    return (
      <WorkoutQuestionBlockSkeleton
        className={cn(
          isDev && '__WorkoutQuestionBlock_Skeleton', // DEBUG
        )}
        answersCount={answers?.length || question?._count?.answers}
      />
    );
  }

  if (!workout) {
    return (
      <PageError error={t('WorkoutQuestion.NoActiveTrainingFound')} padded={false} border={false} />
    );
  }

  if (isExceed) {
    return (
      <PageError
        error={t('WorkoutQuestion.WorkoutHasBeenFinished')}
        padded={false}
        border={false}
      />
    );
  }

  if (!questionId) {
    return (
      <PageError
        error={t('WorkoutQuestion.CannotGetCurrentQuestionId')}
        padded={false}
        border={false}
      />
    );
  }

  if (!question) {
    return (
      <PageError
        error={t('WorkoutQuestion.NotFoundQuestion')}
        explanation={t('WorkoutQuestion.NotFoundQuestionExplanation', { questionId })}
        extraActions={
          <Link
            href={`${availableTopicsRoute}/${topicId}/workout` as TRoutePath}
            className={cn(buttonVariants({ variant: 'theme' }), 'content-truncate flex gap-2')}
          >
            <Icons.Rocket className="size-4 shrink-0" />
            <span className="truncate">{t('ToTraining')}</span>
          </Link>
        }
        padded={false}
        border={false}
      />
    );
  }

  return (
    <WorkoutQuestion
      questionText={question?.text || ''}
      answers={answers}
      answersCount={answers?.length || question?._count?.answers}
      isAnswersLoading={isAnswersLoading}
      onAnswerSelect={onAnswerSelect}
      onSkip={onSkip}
      onFinish={handleFinishWorkout}
      onContinue={goToTheNextQuestion}
      goPrevQuestion={goToThePrevQuestion}
    />
  );
}
