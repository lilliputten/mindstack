'use client';

import React from 'react';

import { myTopicsRoute } from '@/config/routesConfig';
import { truncateMarkdown } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
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
  const { topicId } = useWorkoutContext();
  const routePath = topicsRoutes[manageScope];

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
  // const questionsCount = _count?.questions;
  // const allowedTraining = !!questionsCount;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(`${routePath}/${topicId}`); // topicsContext.routePath);

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
        id: 'ManageTopic',
        content: 'Manage Topic',
        variant: 'ghost',
        icon: Icons.Edit,
        visibleFor: 'xl',
        disabled: !allowedEdit,
        hidden: !user,
        onClick: () => goToTheRoute(`${myTopicsRoute}/${topicId}`),
      },
    ],
    [allowedEdit, goBack, goToTheRoute, topicId, user],
  );

  const breadcrumbs = useTopicsBreadcrumbsItems({
    scope: manageScope,
    topic: topic,
    lastItem: {
      content: 'Training Review',
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
          // 'xl:col-span-2', // ???
          'relative mx-6 flex flex-1 flex-col overflow-hidden',
          className,
        )}
      >
        <ScrollArea
          className={cn(
            isDev && '__WorkoutTopic_Scroll', // DEBUG
          )}
          viewportClassName={cn(
            isDev && '__WorkoutTopic_ScrollViewport', // DEBUG
            'px-6 [&>div]:!flex [&>div]:flex-col [&>div]:gap-4 [&>div]:flex-1',
          )}
        >
          <CardHeader
            className={cn(
              isDev && '__WorkoutTopic_CardHeader', // DEBUG
              'item-start mt-4 flex flex-col gap-4 p-0',
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
            {/* <TopicProperties topic={topic} className="flex-1 text-sm" showDates /> */}
          </CardHeader>
          <CardContent
            className={cn(
              isDev && '__WorkoutTopic_Content', // DEBUG
              'relative flex flex-1 flex-col gap-4 overflow-hidden px-0',
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
        heading={truncateMarkdown(topic?.name || '...', 100)}
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
