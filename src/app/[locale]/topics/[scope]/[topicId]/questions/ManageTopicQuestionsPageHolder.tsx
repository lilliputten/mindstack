'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { useAvailableQuestions, useAvailableTopicById } from '@/hooks';

import {
  ManageTopicQuestionsListCard,
  TManageTopicQuestionsListCardProps,
} from './ManageTopicQuestionsListCard';

type TManageTopicQuestionsPageHolderProps = Omit<
  TManageTopicQuestionsListCardProps,
  'availableTopicQuery' | 'availableQuestionsQuery'
>;

export function ManageTopicQuestionsPageHolder(props: TManageTopicQuestionsPageHolderProps) {
  const { topicId } = props;
  // const { manageScope } = useManageTopicsStore();

  if (!topicId) {
    throw new Error('No topic specified');
  }

  const availableTopicQuery = useAvailableTopicById({
    id: topicId,
    // availableTopicsQueryKey,
    // // ...availableTopicsQueryProps,
    // includeWorkout: availableTopicsQueryProps.includeWorkout,
    // includeUser: availableTopicsQueryProps.includeUser,
    // includeQuestionsCount: availableTopicsQueryProps.includeQuestionsCount,
  });

  const { isFetched: isTopicFetched, isCached: isTopicCached } = availableTopicQuery;
  const isTopicReady = isTopicCached || isTopicFetched;

  const availableQuestionsQuery = useAvailableQuestions({
    traceId: 'ManageTopicQuestionsPageHolder',
    topicId,
    // itemsLimit: null, // Take all questions, without paging
  });
  const { isFetched: isQuestionsFetched } = availableQuestionsQuery;
  const isQuestionsReady = isQuestionsFetched;

  // No data loaded yet - show skeleton
  if (!isQuestionsReady || !isTopicReady) {
    return (
      <div
        className={cn(
          isDev && '__ManageTopicQuestionsPageHolder_Skeleton', // DEBUG
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

  /* // New approach, via QuestionsEditor, moved to the Topic Card
  return (
    <QuestionsEditor
      topicId={topicId}
      availableTopicQuery={availableTopicQuery}
      availableQuestionsQuery={availableQuestionsQuery}
    />
    );
  */

  // Old table-based component
  return (
    <ManageTopicQuestionsListCard
      topicId={topicId}
      availableTopicQuery={availableTopicQuery}
      availableQuestionsQuery={availableQuestionsQuery}
    />
  );
}
