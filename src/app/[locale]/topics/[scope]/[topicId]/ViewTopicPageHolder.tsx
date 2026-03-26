'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useAvailableTopicsByScope } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ViewTopicPage } from './ViewTopicPage';

interface TViewTopicPageHolderProps extends TPropsWithClassName {
  topicId: TTopicId;
}

export function ViewTopicPageHolder(props: TViewTopicPageHolderProps) {
  const { topicId } = props;
  const { manageScope } = useManageTopicsStore();

  if (!topicId) {
    throw new Error('No topic specified');
  }

  const availableTopicsQuery = useAvailableTopicsByScope({
    traceId: 'ViewTopicPageHolder',
    manageScope,
  });
  const {
    isFetched: isTopicsFetched,
    queryKey: availableTopicsQueryKey,
    queryProps: availableTopicsQueryProps,
  } = availableTopicsQuery;

  const availableTopicQuery = useAvailableTopicById({
    id: topicId,
    availableTopicsQueryKey,
    // ...availableTopicsQueryProps,
    includeWorkout: availableTopicsQueryProps.includeWorkout,
    includeUser: availableTopicsQueryProps.includeUser,
    includeQuestionsCount: availableTopicsQueryProps.includeQuestionsCount,
  });

  const {
    // topic,
    isFetched: isTopicFetched,
    isCached: isTopicCached,
  } = availableTopicQuery;

  const isTopicReady = isTopicCached || isTopicFetched;

  // No data loaded yet - show skeleton
  if (!isTopicReady || !isTopicsFetched) {
    return (
      <div
        className={cn(
          isDev && '__ViewTopicPage_Skeleton', // DEBUG
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
    <ViewTopicPage
      topicId={topicId}
      availableTopicsQuery={availableTopicsQuery}
      availableTopicQuery={availableTopicQuery}
    />
  );
}
