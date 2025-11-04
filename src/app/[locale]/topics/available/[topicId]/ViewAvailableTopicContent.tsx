'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { TopicProperties } from '@/features/topics/components/TopicProperties';
import { TAvailableTopic } from '@/features/topics/types';
import { WorkoutControl, WorkoutInfo, WorkoutStats } from '@/features/workouts/components';

interface TViewAvailableTopicContentProps {
  topic: TAvailableTopic;
  className?: string;
}

export function ViewAvailableTopicContent(props: TViewAvailableTopicContentProps) {
  const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
  const { topic, className } = props;

  return (
    <ScrollArea
      className={cn(
        isDev && '__ViewAvailableTopicContent_Scroll', // DEBUG
        className,
      )}
      viewportClassName={cn(
        isDev && '__ViewAvailableTopicContent_ScrollViewport', // DEBUG
        'px-6 [&>div]:my-6 [&>div]:!flex [&>div]:flex-col [&>div]:gap-4 [&>div]:flex-1',
      )}
    >
      <TopicHeader
        scope={manageScope}
        topic={topic}
        showName={false}
        showDescription
        className={cn(
          isDev && '__ViewAvailableTopicContent_TopicHeader', // DEBUG
          '__ViewAvailableTopicContent_ScrollViewport flex-1 items-start max-sm:flex-col-reverse',
        )}
      />
      <TopicProperties topic={topic} className="flex-1 text-sm" showDates />
      <WorkoutInfo className="flex-1" />
      <WorkoutStats />
      <WorkoutControl omitNoWorkoutMessage />
    </ScrollArea>
  );
}
