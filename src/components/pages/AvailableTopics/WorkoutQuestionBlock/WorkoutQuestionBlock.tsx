'use client';

import React from 'react';
import { toast } from 'sonner';

import { availableTopicsRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { useAvailableQuestionById } from '@/hooks/react-query/useAvailableQuestionById';
import { WorkoutQuestion } from '@/components/pages/AvailableTopics/WorkoutQuestion/WorkoutQuestion';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useAvailableAnswers, useGoToTheRoute } from '@/hooks';

import { WorkoutQuestionBlockSkeleton } from './WorkoutQuestionBlockSkeleton';

interface TMemo {
  nextPageTimerHandler?: ReturnType<typeof setTimeout>;
  isGoingOut?: boolean;
}

export function WorkoutQuestionBlock() {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const {
    topicId,
    workout,
    questionOrderedIds,
    saveResultAndGoNext,
    saveResult,
    saveAnswer,
    finishWorkout,
    goNextQuestion,
    goPrevQuestion,
  } = useWorkoutContext();

  const totalSteps = questionOrderedIds.length;
  const stepIndex = workout?.stepIndex || 0;
  const currentStep = stepIndex + 1;
  const questionId = questionOrderedIds[stepIndex];
  const isExceed = currentStep > totalSteps;

  const workoutRoutePath = `${availableTopicsRoute}/${topicId}/workout`;

  const goToTheRoute = useGoToTheRoute();

  const handleFinishWorkout = React.useCallback(() => {
    // console.log('[WorkoutQuestionBlock:handleFinishWorkout]', {
    //   workoutRoutePath,
    // });
    finishWorkout();
    setTimeout(() => {
      goToTheRoute(workoutRoutePath);
    }, 10);
  }, [finishWorkout, goToTheRoute, workoutRoutePath]);

  React.useEffect(() => {
    if (isExceed && !memo.isGoingOut) {
      const error = new Error(
        `The step index (${currentStep}) exceeds the total steps count (${totalSteps})`,
      );
      // eslint-disable-next-line no-console
      console.warn('[WorkoutQuestionBlock]', error, {
        totalSteps,
        currentStep,
      });
      // debugger;
      handleFinishWorkout();
      memo.isGoingOut = true;
    }
  }, [memo, handleFinishWorkout, isExceed, currentStep, totalSteps]);

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
      const message = 'Cannot load answers data';
      toast.error(message);
    }
  }, [answersError]);

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
    (answerId: string) => {
      const answer = answers.find(({ id }) => id === answerId);
      if (answer) {
        const { isCorrect } = answer;
        /* // UNUSED: Show explanation toast (it's displayed in the selected answer block)
         * if (explanation) {
         *   const markdownContent = (
         *     <MarkdownText className="text-sm" omitLinks>
         *       {explanation}
         *     </MarkdownText>
         *   );
         *   const content = (
         *     <div className="flex flex-col gap-2">
         *       <p className="font-bold uppercase">
         *         {isCorrect ? 'The answer is correct:' : 'The answer is incorrect:'}
         *       </p>
         *       {markdownContent}
         *     </div>
         *   );
         *   toast.info(content);
         * }
         */
        // Update workout with result and move to next question
        saveAnswer(answerId);
        saveResult(isCorrect);
        /* // UNUSED: Auto-advance after delay
         * if (isCorrect) {
         *   memo.nextPageTimerHandler = setTimeout(goToTheNextQuestion, 2000);
         * }
         */
      }
    },
    [answers, saveResult, saveAnswer],
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
      />
    );
  }

  if (!workout) {
    return <PageError error="No active training found." padded={false} border={false} />;
  }

  if (isExceed) {
    return (
      <PageError error="The workout has been (suddenly) finished." padded={false} border={false} />
    );
  }

  if (!questionId) {
    return (
      <PageError
        error="Cannot get current question id from questions order."
        padded={false}
        border={false}
      />
    );
  }

  if (!question) {
    return (
      <PageError error={`Not found question (${questionId}).`} padded={false} border={false} />
    );
  }

  return (
    <WorkoutQuestion
      questionText={question?.text || ''}
      answers={answers}
      isAnswersLoading={isAnswersLoading}
      onAnswerSelect={onAnswerSelect}
      onSkip={onSkip}
      onFinish={handleFinishWorkout}
      onContinue={goToTheNextQuestion}
      goPrevQuestion={goToThePrevQuestion}
    />
  );
}
