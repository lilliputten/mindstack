import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { TAvailableAnswer } from '@/features/answers/types';

interface WorkoutQuestionProps {
  questionText: string;
  answers?: TAvailableAnswer[];
  answersCount?: number;
  isAnswersLoading?: boolean;
  onAnswerSelect: (answerId: string) => void;
  onSkip: () => void;
  onFinish: () => void;
  onContinue: () => void;
  goPrevQuestion: () => void;
}

export function WorkoutQuestion({
  questionText,
  answers,
  answersCount,
  isAnswersLoading,
  onAnswerSelect,
  onSkip,
  onFinish,
  onContinue,
  goPrevQuestion,
}: WorkoutQuestionProps) {
  const t = useT();
  const { workout, questionIds } = useWorkoutContext();
  const totalSteps = questionIds?.length || 0;
  const stepIndex = workout?.stepIndex || 0;
  const currentStep = stepIndex + 1;

  const selectedAnswer = workout?.selectedAnswerId
    ? answers?.find(({ id }) => id === workout.selectedAnswerId)
    : undefined;

  const isFinished = currentStep >= totalSteps;

  const answersContent = React.useMemo(() => {
    const count = answersCount || 2;
    return isAnswersLoading || !answers ? (
      // Show answers skeleton...
      generateArray(count).map((i) => <Skeleton key={i} className="h-14 w-full" />)
    ) : !answers.length ? (
      <p className="opacity-50">{t('WorkoutQuestion.NoAnswersCreated')}</p>
    ) : (
      answers.map((answer) => {
        const isSelected = selectedAnswer?.id === answer.id;
        const isCorrect = answer.isCorrect;
        let borderColor = 'border-border';
        let bgColor = 'bg-background/50';
        if (selectedAnswer) {
          if (isCorrect) {
            borderColor = isSelected ? 'border-green-500' : 'border-green-500 border-dashed';
            bgColor = isSelected ? 'bg-green-500/20' : 'bg-green-500/5';
          } else if (isSelected) {
            borderColor = 'border-red-500';
            bgColor = 'bg-red-500/20';
          } else {
            borderColor += ' opacity-50';
          }
        }
        return (
          <button
            key={answer.id}
            onClick={() => !selectedAnswer && onAnswerSelect(answer.id)}
            disabled={!!selectedAnswer}
            className={cn(
              isDev && '__WorkoutQuestion_Answer', // DEBUG
              'flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition',
              'hover:bg-theme-500/15 hover:text-accent-foreground',
              selectedAnswer && 'pointer-events-none',
              borderColor,
              bgColor,
            )}
          >
            <div className="flex flex-1 flex-col gap-4">
              <MarkdownText omitLinks>{answer.text}</MarkdownText>
              {isSelected && (
                <div className="flex flex-col gap-2">
                  <p
                    className={cn(
                      selectedAnswer?.isCorrect ? 'text-green-500' : 'text-red-500',
                      'font-semibold uppercase',
                    )}
                  >
                    {selectedAnswer?.isCorrect
                      ? t('WorkoutQuestion.TheAnswerIsCorrect')
                      : t('WorkoutQuestion.TheAnswerIsIncorrect')}
                  </p>
                  {selectedAnswer?.explanation && (
                    <MarkdownText>{selectedAnswer?.explanation}</MarkdownText>
                  )}
                </div>
              )}
            </div>
            {!!selectedAnswer && (
              <div className="ml-2 flex-shrink-0">
                {isCorrect ? (
                  <Icons.CheckIcon className="size-5 text-green-500" />
                ) : isSelected ? (
                  <Icons.XIcon className="size-5 text-red-500" />
                ) : null}
              </div>
            )}
          </button>
        );
      })
    );
  }, [answers, answersCount, isAnswersLoading, onAnswerSelect, selectedAnswer, t]);

  const questionContent = React.useMemo(
    () => (
      <div
        data-testid="__WorkoutQuestion_Content"
        className={cn(
          isDev && '__WorkoutQuestion_Content', // DEBUG
          'flex flex-col gap-4',
        )}
      >
        <MarkdownText className="text-lg">{questionText}</MarkdownText>
        {/* Answers */}
        <div
          data-testid="__WorkoutQuestion_Answers"
          className={cn(
            isDev && '__WorkoutQuestion_Answers', // DEBUG
            'grid lg:grid-cols-2',
            'gap-4 py-2',
          )}
        >
          {answersContent}
        </div>
      </div>
    ),
    [answersContent, questionText],
  );

  const actionsContent = React.useMemo(
    () => (
      <div
        className={cn(
          isDev && '__WorkoutQuestion_Actions', // DEBUG
          'content-truncate flex flex-wrap justify-center gap-2',
        )}
      >
        {/* Back Button */}
        {currentStep > 1 && (
          <Button
            data-testid="__WorkoutQuestion_Skip_Button"
            className="content-truncate flex gap-2"
            variant="outline"
            onClick={goPrevQuestion}
          >
            <Icons.ArrowLeft className="size-5 opacity-50" />
            <span className="truncate">{t('Back')}</span>
          </Button>
        )}
        {!isFinished &&
          (selectedAnswer ? (
            <Button
              data-testid="__WorkoutQuestion_Skip_Button"
              className={cn(
                selectedAnswer?.isCorrect && 'animate-pulse',
                'content-truncate flex gap-2',
              )}
              variant={selectedAnswer ? 'theme' : 'outline'}
              onClick={onContinue}
            >
              <Icons.ArrowRight className="size-5 opacity-50" />
              <span className="truncate">{t('Continue')}</span>
            </Button>
          ) : (
            <>
              {/* Skip Button */}
              {!selectedAnswer /* && currentStep < totalSteps */ && (
                <Button
                  data-testid="__WorkoutQuestion_Skip_Button"
                  className="content-truncate flex gap-2"
                  variant="outline"
                  onClick={onSkip}
                >
                  <Icons.ArrowRight className="size-5 opacity-50" />
                  <span className="truncate">{t('Skip')}</span>
                </Button>
              )}
            </>
          ))}
        {/* Finish Button */}
        <Button
          data-testid="__WorkoutQuestion_Finish_Button"
          className={cn(
            'content-truncate flex gap-2',
            isFinished && 'animate-pulse',
            // selectedAnswer && 'disabled',
          )}
          variant={isFinished && selectedAnswer ? 'theme' : 'outline'}
          onClick={onFinish}
        >
          <Icons.Flag className="size-5 opacity-50" />
          <span className="truncate">{t('Finish')}</span>
        </Button>
      </div>
    ),
    [currentStep, goPrevQuestion, isFinished, onContinue, onFinish, onSkip, selectedAnswer, t],
  );

  return (
    <div data-testid="__WorkoutQuestion" className="flex flex-col gap-4">
      {questionContent}
      {actionsContent}
    </div>
  );
}
