'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableQuestionById, useAvailableTopicById } from '@/hooks';

import { ViewQuestionCard } from './ViewQuestionCard';

interface TViewQuestionPageHolderProps {
  topicId: TTopicId;
  questionId: TQuestionId;
}

export function ViewQuestionPageHolder(props: TViewQuestionPageHolderProps) {
  const { topicId, questionId } = props;
  // const { manageScope } = useManageTopicsStore();

  if (!topicId) {
    throw new Error('No topic ID specified');
  }
  if (!questionId) {
    throw new Error('No question ID specified');
  }

  const availableTopicQuery = useAvailableTopicById({ id: topicId });
  const { isFetched: isTopicFetched, isCached: isTopicCached } = availableTopicQuery;
  const isTopicReady = isTopicCached || isTopicFetched;

  const availableQuestionQuery = useAvailableQuestionById({
    id: questionId,
    traceId: 'ViewQuestionPageHolder',
  });
  const { isFetched: isQuestionFetched, isCached: isQuestionCached } = availableQuestionQuery;
  const isQuestionReady = isQuestionCached || isQuestionFetched;

  // No data loaded yet - show skeleton
  if (!isTopicReady || !isQuestionReady) {
    return (
      <div
        className={cn(
          isDev && '__ViewQuestionPageHolder_Skeleton', // DEBUG
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

  return (
    <ViewQuestionCard
      topicId={topicId}
      questionId={questionId}
      availableTopicQuery={availableTopicQuery}
      availableQuestionQuery={availableQuestionQuery}
    />
  );
}
