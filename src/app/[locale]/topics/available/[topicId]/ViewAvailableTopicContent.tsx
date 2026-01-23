'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageEmpty } from '@/components/pages/shared';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { TAvailableTopic } from '@/features/topics/types';
import { WorkoutControl, WorkoutStats } from '@/features/workouts/components';
import { useGoToTheRoute } from '@/hooks';

interface TViewAvailableTopicContentProps {
  topic: TAvailableTopic;
  className?: string;
}

export function ViewAvailableTopicContent(props: TViewAvailableTopicContentProps) {
  const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
  const { topic, className } = props;
  const topicId = topic.id;

  const t = useT();

  const workoutContext = useWorkoutContext();
  const {
    workout,
    startWorkout,
    // questionIds,
  } = workoutContext;
  // const isWorkoutInProgress = workout?.started && !workout?.finished;
  // const questionsCount = questionIds?.length || 0;
  // const allowedTraining = !!questionsCount;
  const nothingToDisplay = !workout;

  const goToTheRoute = useGoToTheRoute();

  const workoutRoutePath = `${availableTopicsRoute}/${topicId}/workout` as TRoutePath;
  const workoutRouteGoPath = `${workoutRoutePath}/go` as TRoutePath;

  const handleStart = React.useCallback(() => {
    startWorkout().then(() => goToTheRoute(workoutRouteGoPath));
  }, [startWorkout, goToTheRoute, workoutRouteGoPath]);

  return (
    <ScrollArea
      className={cn(
        isDev && '__ViewAvailableTopicContent_Scroll', // DEBUG
        'flex-1',
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
            'items-stretch max-sm:flex-col-reverse',
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
          icon={Icons.Rocket}
          title={t('ViewAvailableTopicContent.TrainingNotStarted')}
          description={t('ViewAvailableTopicContent.NoActiveTrainingText')}
          framed={false}
          buttons={<WorkoutControl omitNoWorkoutMessage handleStart={handleStart} />}
        />
      ) : (
        <>
          <WorkoutStats />
          <WorkoutControl omitNoWorkoutMessage handleStart={handleStart} />
        </>
      )}
    </ScrollArea>
  );
}
