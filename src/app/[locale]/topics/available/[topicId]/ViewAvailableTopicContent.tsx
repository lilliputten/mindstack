'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageEmpty } from '@/components/pages/shared';
import { Icons } from '@/components/shared';
import { availableTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { TopicBriefInfo } from '@/features/topics';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { TAvailableTopic } from '@/features/topics/types';
import { WorkoutControl, WorkoutStats } from '@/features/workouts/components';
import { useGoToTheRoute } from '@/hooks';

import { InnerSkeleton } from './ContentSkeleton';

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
    isLoading: isWorkoutLoading,
    isFetched: isWorkoutFetched,
    // questionIds,
  } = workoutContext;
  const isWorkoutReady = !isWorkoutLoading && isWorkoutFetched;
  // const isWorkoutInProgress = workout?.started && !workout?.finished;
  // const questionsCount = questionIds?.length || 0;
  // const allowedTraining = !!questionsCount;
  const noWorkout = !workout;

  const goToTheRoute = useGoToTheRoute();

  const workoutRoutePath = `${availableTopicsRoute}/${topicId}/workout` as TRoutePath;
  const workoutRouteGoPath = `${workoutRoutePath}/go` as TRoutePath;

  const handleStart = React.useCallback(() => {
    startWorkout().then(() => goToTheRoute(workoutRouteGoPath));
  }, [startWorkout, goToTheRoute, workoutRouteGoPath]);

  if (false || !isWorkoutReady) {
    return <InnerSkeleton className="mx-6" />;
  }

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
          'flex shrink-0 flex-col gap-4',
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
      {noWorkout ? (
        <PageEmpty
          className="size-full flex-1"
          icon={Icons.Rocket}
          // title={t('ViewAvailableTopicContent.TrainingNotStarted')}
          // description={t('ViewAvailableTopicContent.NoActiveTrainingText')}
          explanation={
            <div className="flex flex-col gap-4">
              <h3 className="content-truncate font-heading text-2xl font-bold">
                {t('ViewAvailableTopicContent.TrainingNotStarted')}
              </h3>
              <p className="content-truncate text-center text-sm font-normal leading-6 text-muted-foreground">
                {t('ViewAvailableTopicContent.NoActiveTrainingText')}
              </p>
              <TopicBriefInfo
                topicId={topicId}
                className={cn(
                  isDev && '__ViewAvailableTopicContent_TopicBriefInfo', // DEBUG
                  'mb-2',
                )}
              />
            </div>
          }
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
