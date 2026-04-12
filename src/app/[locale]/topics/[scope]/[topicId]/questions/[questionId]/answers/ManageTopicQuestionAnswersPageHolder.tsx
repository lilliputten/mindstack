'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { useAvailableAnswers, useAvailableQuestionById, useAvailableTopicById } from '@/hooks';

import {
  ManageTopicQuestionAnswersListCard,
  TManageTopicQuestionAnswersListCardProps,
} from './ManageTopicQuestionAnswersListCard';

type TManageTopicQuestionAnswersPageHolderProps = Omit<
  TManageTopicQuestionAnswersListCardProps,
  'availableTopicQuery' | 'availableQuestionQuery' | 'availableAnswersQuery'
>;

export function ManageTopicQuestionAnswersPageHolder(
  props: TManageTopicQuestionAnswersPageHolderProps,
) {
  const { topicId, questionId } = props;
  // const { manageScope } = useManageTopicsStore();

  if (!topicId) {
    throw new Error('No topic ID specified');
  }
  if (!questionId) {
    throw new Error('No question ID specified');
  }

  const availableTopicQuery = useAvailableTopicById({
    id: topicId,
    // availableTopicsQueryKey,
    // // ...availableTopicsQueryProps,
    // includeWorkout: availableTopicsQueryProps.includeWorkout,
    // includeUser: availableTopicsQueryProps.includeUser,
    // includeQuestionsCount: availableTopicsQueryProps.includeQuestionsCount,
  });
  const {
    // topic,
    isFetched: isTopicFetched,
    isCached: isTopicCached,
  } = availableTopicQuery;
  const isTopicReady = isTopicCached || isTopicFetched;

  const availableQuestionQuery = useAvailableQuestionById({
    id: questionId,
    traceId: 'ManageTopicQuestionAnswersPageHolder',
    // availableQuestionsQueryKey,
    // ...availableQuestionsQueryProps,
  });
  const {
    // question,
    isFetched: isQuestionFetched,
    isCached: isQuestionCached,
    // isLoading: isQuestionLoading,
  } = availableQuestionQuery;
  const isQuestionReady = isQuestionCached || isQuestionFetched;

  const availableAnswersQuery = useAvailableAnswers({ questionId });
  const {
    isFetched: isAnswersFetched,
    // isCached: isAnswersCached,
  } = availableAnswersQuery;

  // No data loaded yet - show skeleton
  if (!isAnswersFetched || !isQuestionReady || !isTopicReady) {
    return (
      <div
        className={cn(
          isDev && '__ManageTopicQuestionAnswersPageHolder_Skeleton', // DEBUG
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
    <ManageTopicQuestionAnswersListCard
      availableTopicQuery={availableTopicQuery}
      availableQuestionQuery={availableQuestionQuery}
      availableAnswersQuery={availableAnswersQuery}
      {...props}
    />
  );
}
