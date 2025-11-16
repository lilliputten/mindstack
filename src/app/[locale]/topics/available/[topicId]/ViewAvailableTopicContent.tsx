'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageEmpty } from '@/components/pages/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { TAvailableTopic } from '@/features/topics/types';
import { WorkoutControl, WorkoutStats } from '@/features/workouts/components';

interface TViewAvailableTopicContentProps {
  topic: TAvailableTopic;
  className?: string;
}

export function ViewAvailableTopicContent(props: TViewAvailableTopicContentProps) {
  const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
  const { topic, className } = props;

  const workoutContext = useWorkoutContext();
  const {
    workout,
    // questionIds,
  } = workoutContext;
  // const isWorkoutInProgress = workout?.started && !workout?.finished;
  // const questionsCount = questionIds?.length || 0;
  // const allowedTraining = !!questionsCount;
  const nothingToDisplay = !workout;

  return (
    <ScrollArea
      className={cn(
        isDev && '__ViewAvailableTopicContent_Scroll', // DEBUG
        'my-6 flex-1',
        className,
      )}
      viewportClassName={cn(
        isDev && '__ViewAvailableTopicContent_ScrollViewport', // DEBUG
        'flex flex-col',
        'px-6 [&>div]:flex-1 [&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
      )}
    >
      <div
        className={cn(
          isDev && '__ViewAvailableTopicContent_Header', // DEBUG
          'flex flex-col gap-4',
        )}
      >
        <TopicHeader
          scope={manageScope}
          topic={topic}
          showName={false}
          showDescription
          className={cn(
            isDev && '__ViewAvailableTopicContent_TopicHeader', // DEBUG
            'items-start max-sm:flex-col-reverse',
          )}
        />
        {/*
        <WorkoutInfo
          className={cn(
            isDev && '__ViewAvailableTopicContent_WorkoutInfo', // DEBUG
            'text-xs',
          )}
          workout={workout}
          omitNoWorkoutMessage
          // hideTimes
        />
        */}
      </div>
      {nothingToDisplay ? (
        <PageEmpty
          className="size-full flex-1"
          icon={Icons.Activity}
          title="The training has not been started"
          description="You have no active training nor history records to display. Start training now."
          framed={false}
          buttons={<WorkoutControl omitNoWorkoutMessage />}
        />
      ) : (
        <>
          <WorkoutStats />
          <WorkoutControl omitNoWorkoutMessage />
        </>
      )}
    </ScrollArea>
  );
}
