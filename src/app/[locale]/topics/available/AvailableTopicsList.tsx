import React from 'react';

import { getRandomHashString } from '@/lib/helpers/strings';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollAreaInfinite } from '@/components/ui/ScrollAreaInfinite';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext/TopicsContextDefinitions';
import { useAvailableTopicsByScope } from '@/hooks';

import { AvailableTopicsListItem } from './AvailableTopicsListItem';

const saveScrollHash = getRandomHashString();

interface TProps extends TPropsWithClassName {
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
  manageScope: TTopicsManageScopeId;
}

export function AvailableTopicsList(props: TProps) {
  const { className, availableTopicsQuery } = props;

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, allTopics } =
    availableTopicsQuery;

  return (
    <ScrollAreaInfinite
      effectorData={allTopics}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      saveScrollKey="AvailableTopicsList"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__AvailableTopicsList', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        className,
      )}
      viewportClassName={cn(
        isDev && '__AvailableTopicsList_Viewport', // DEBUG
        'relative flex flex-1 flex-col',
        '[&>div]:gap-4 [&>div]:flex-col [&>div]:px-6',
      )}
      containerClassName={cn(
        isDev && '__AvailableTopicsList_Container', // DEBUG
        'relative flex flex-col gap-4',
      )}
    >
      {allTopics.map((topic, index) => (
        <AvailableTopicsListItem key={topic.id} index={index} topic={topic} />
      ))}
    </ScrollAreaInfinite>
  );
}
