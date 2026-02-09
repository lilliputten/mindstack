'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { TAnswerId } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableAnswerById, useAvailableQuestionById, useAvailableTopicById } from '@/hooks';

import { ViewAnswerCard } from './ViewAnswerCard';

interface TViewAnswerPageHolderProps {
  topicId: TTopicId;
  questionId: TQuestionId;
  answerId: TAnswerId;
}

export function ViewAnswerPageHolder(props: TViewAnswerPageHolderProps) {
  const { topicId, questionId, answerId } = props;
  const t = useT();
  // const { manageScope } = useManageTopicsStore();

  if (!topicId) {
    throw new Error(t('NoTopicFound'));
  }
  if (!questionId) {
    throw new Error(t('NoQuestionFound'));
  }
  if (!answerId) {
    throw new Error(t('NoAnswerFound'));
  }

  const availableTopicQuery = useAvailableTopicById({ id: topicId });
  const { topic, isFetched: isTopicFetched, isCached: isTopicCached } = availableTopicQuery;
  const isTopicReady = isTopicCached || isTopicFetched;

  const availableQuestionQuery = useAvailableQuestionById({ id: questionId });
  const {
    question,
    isFetched: isQuestionFetched,
    isCached: isQuestionCached,
  } = availableQuestionQuery;
  const isQuestionReady = isQuestionCached || isQuestionFetched;

  const availableAnswerQuery = useAvailableAnswerById({ id: answerId });
  const { answer, isFetched: isAnswerFetched, isCached: isAnswerCached } = availableAnswerQuery;
  const isAnswerReady = isAnswerCached || isAnswerFetched;

  // No data loaded yet - show skeleton
  if (!isTopicReady || !isQuestionReady || !isAnswerReady) {
    return (
      <div
        className={cn(
          isDev && '__ViewAnswerPageHolder_Skeleton', // DEBUG
          'flex size-full flex-1 flex-col gap-4 px-6',
        )}
      >
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        {generateArray(3).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!topic) {
    throw new Error(t('NoTopicFound'));
  }
  if (!question) {
    throw new Error(t('NoQuestionFound'));
  }
  if (!answer) {
    throw new Error(t('NoAnswerFound'));
  }

  return <ViewAnswerCard topic={topic} question={question} answer={answer} />;
}
