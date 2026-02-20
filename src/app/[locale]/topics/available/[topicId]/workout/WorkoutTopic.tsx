'use client';

import React from 'react';

import { truncateMarkdown } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Skeleton } from '@/components/ui/Skeleton';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Icons } from '@/components/shared';
import { allTopicsRoute, availableTopicsRoute, myTopicsRoute } from '@/config';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, topicsRoutes } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { useTopicsBreadcrumbsItems } from '@/features/topics/components/TopicsBreadcrumbs';
import { WorkoutControl, WorkoutStats } from '@/features/workouts/components';
import { useAvailableTopicById, useGoBack, useGoToTheRoute, useSessionData } from '@/hooks';

import { ContentSkeleton } from './ContentSkeleton';

export function WorkoutTopic(props: TPropsWithClassName) {
  const { className } = props;
  const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
  const routePath = topicsRoutes[manageScope];
  const t = useT();

  const workoutContext = useWorkoutContext();
  const {
    topicId,
    // topic,
    // userId,
    workout,
    // pending: isWorkoutPending,
    startWorkout,
    questionIds,
    // topic,
  } = workoutContext;

  const questionsCount = questionIds?.length || 0;
  const allowedTraining = !!questionsCount;
  // const isWorkoutInProgress = workout?.started && !workout?.finished;

  if (!topicId) {
    throw new Error('No workout topic ID specified');
  }

  const availableTopicQuery = useAvailableTopicById({ id: topicId });
  const { topic, isLoading: isTopicLoading, isFetched: isTopicFetched } = availableTopicQuery;
  const isTopicPending = isTopicLoading && !isTopicFetched;

  const { user } = useSessionData();

  const isOwner = topic?.userId && topic?.userId === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;

  const manageTopicsRoute = isOwner ? myTopicsRoute : allTopicsRoute;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(`${routePath}/${topicId}`);

  const handleResumeWorkout = React.useCallback(() => {
    goToTheRoute(`${availableTopicsRoute}/${topicId}/workout/go`);
  }, [goToTheRoute, topicId]);

  const handleStart = React.useCallback(() => {
    startWorkout().then(() => {
      handleResumeWorkout();
    });
  }, [startWorkout, handleResumeWorkout]);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        variant: 'ghost',
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'StartTraining',
        content: workout?.finished
          ? t('AvailableTopics.RestartTraining')
          : workout?.started
            ? t('AvailableTopics.ResumeTraining')
            : t('AvailableTopics.StartTraining'),
        variant: 'theme',
        icon: Icons.Activity,
        visibleFor: 'sm',
        disabled: !allowedTraining,
        onClick: handleStart, // isWorkoutInProgress ? handleResumeWorkout : handleStartWorkout,
      },
      {
        id: 'ManageTopic',
        content: t('AvailableTopics.ManageTopic'),
        variant: 'ghost',
        icon: Icons.Edit,
        visibleFor: 'xl',
        disabled: !allowedEdit,
        hidden: !user,
        onClick: () => goToTheRoute(`${manageTopicsRoute}/${topicId}`),
      },
    ],
    [
      t,
      goBack,
      workout?.finished,
      workout?.started,
      allowedTraining,
      handleStart,
      allowedEdit,
      user,
      goToTheRoute,
      manageTopicsRoute,
      topicId,
    ],
  );

  const breadcrumbs = useTopicsBreadcrumbsItems({
    scope: manageScope,
    topic: topic || undefined,
    lastItem: {
      content: t('AvailableTopics.TrainingDetails'),
      // link: isWorkoutInProgress ? questionsContext.routePath : undefined,
    },
  });

  const content =
    isTopicPending || !topic ? (
      <ContentSkeleton />
    ) : (
      <ScrollArea
        className={cn(
          isDev && '__WorkoutTopic_Scroll', // DEBUG
          'flex flex-1 flex-col',
          className,
        )}
        viewportClassName={cn(
          isDev && '__WorkoutTopic_ScrollViewport', // DEBUG
          'flex flex-col flex-1',
          'px-6 [&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
        )}
      >
        <TopicHeader
          scope={TopicsManageScopeIds.AVAILABLE_TOPICS}
          topic={topic}
          className={cn(
            isDev && '__WorkoutTopic_TopicHeader', // DEBUG
            'items-start max-sm:flex-col-reverse',
          )}
          showName={false}
          showDescription
        />
        <WorkoutStats full className="flex-1" />
        <WorkoutControl omitNoWorkoutMessage handleStart={handleStart} />
      </ScrollArea>
    );

  return (
    <>
      <DashboardHeader
        heading={
          topic?.name ? truncateMarkdown(topic?.name, 100) : <Skeleton className="h-8 w-1/2" />
        }
        className={cn(
          isDev && '__WorkoutTopic_DashboardHeader', // DEBUG
          'mx-6',
        )}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {content}
    </>
  );
}
