'use client';

import React from 'react';

import { allTopicsRoute, availableTopicsRoute, myTopicsRoute } from '@/config/routesConfig';
import { truncateMarkdown } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Skeleton } from '@/components/ui/Skeleton';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
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

  const workoutContext = useWorkoutContext();
  const {
    topicId,
    // topic,
    // userId,
    workout,
    // pending,
    // startWorkout,
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
  const goBack = useGoBack(`${routePath}/${topicId}`); // topicsContext.routePath);

  const handleResumeWorkout = React.useCallback(() => {
    goToTheRoute(`${availableTopicsRoute}/${topicId}/workout/go`);
  }, [goToTheRoute, topicId]);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: 'Back',
        variant: 'ghost',
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'StartTraining',
        content: workout?.finished
          ? 'Restart Training'
          : workout?.started
            ? 'Resume Training'
            : 'Start Training',
        variant: 'theme',
        icon: Icons.Activity,
        visibleFor: 'sm',
        disabled: !allowedTraining,
        onClick: handleResumeWorkout, // isWorkoutInProgress ? handleResumeWorkout : handleStartWorkout,
      },
      {
        id: 'ManageTopic',
        content: 'Manage Topic',
        variant: 'ghost',
        icon: Icons.Edit,
        visibleFor: 'xl',
        disabled: !allowedEdit,
        hidden: !user,
        onClick: () => goToTheRoute(`${manageTopicsRoute}/${topicId}`),
      },
    ],
    [
      goBack,
      workout?.finished,
      workout?.started,
      allowedTraining,
      handleResumeWorkout,
      allowedEdit,
      user,
      goToTheRoute,
      manageTopicsRoute,
      topicId,
    ],
  );

  const breadcrumbs = useTopicsBreadcrumbsItems({
    scope: manageScope,
    topic: topic,
    lastItem: {
      content: 'Training Details',
      // link: isWorkoutInProgress ? questionsContext.routePath : undefined,
    },
  });

  const content =
    isTopicPending || !topic ? (
      <ContentSkeleton omitHeader />
    ) : (
      <Card
        className={cn(
          isDev && '__WorkoutTopic_Card', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6',
          className,
        )}
      >
        <ScrollArea
          className={cn(
            isDev && '__WorkoutTopic_Scroll', // DEBUG
          )}
          viewportClassName={cn(
            isDev && '__WorkoutTopic_ScrollViewport', // DEBUG
            'flex flex-col flex-1',
            'px-6 [&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
          )}
        >
          <CardHeader
            className={cn(
              isDev && '__WorkoutTopic_CardHeader', // DEBUG
              'item-start flex flex-col gap-6 p-0',
            )}
          >
            <TopicHeader
              scope={TopicsManageScopeIds.AVAILABLE_TOPICS}
              topic={topic}
              className={cn(
                isDev && '__WorkoutTopic_TopicHeader', // DEBUG
                'flex-1 items-start max-sm:flex-col-reverse',
              )}
              showName={false}
              showDescription
            />
          </CardHeader>
          <CardContent
            className={cn(
              isDev && '__WorkoutTopic_Content', // DEBUG
              'relative flex flex-1 flex-col gap-4 overflow-hidden px-0 pb-0',
            )}
          >
            <WorkoutStats full />
            <WorkoutControl omitNoWorkoutMessage />
          </CardContent>
        </ScrollArea>
      </Card>
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
