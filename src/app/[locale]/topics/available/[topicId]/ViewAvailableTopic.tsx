'use client';

import React from 'react';

import { availableTopicsRoute, myTopicsRoute } from '@/config/routesConfig';
import { truncateMarkdown } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, topicsRoutes } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useTopicsBreadcrumbsItems } from '@/features/topics/components/TopicsBreadcrumbs';
import { TTopic } from '@/features/topics/types';
import { useGoBack, useGoToTheRoute, useSessionUser } from '@/hooks';

import { ViewAvailableTopicContent } from './ViewAvailableTopicContent';

const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
const routePath = topicsRoutes[manageScope];

interface TViewAvailableTopicProps {
  topic: TTopic;
}
export function ViewAvailableTopic(props: TViewAvailableTopicProps) {
  const { topic } = props;
  const topicId = topic.id;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(routePath);

  const workoutContext = useWorkoutContext();
  const {
    //  topicId, topic,
    userId,
    workout,
    // pending,
    startWorkout,
    questionIds,
  } = workoutContext;

  const questionsCount = questionIds?.length || 0;
  const allowedTraining = !!questionsCount;
  const isWorkoutInProgress = workout?.started && !workout?.finished;

  const user = useSessionUser();
  const isOwner = userId && userId === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;
  // const questionsCount = _count?.questions;
  // const allowedTraining = !!questionsCount;

  const handleResumeWorkout = React.useCallback(() => {
    // console.log('[WorkoutControl:handleResumeWorkout]');
    goToTheRoute(`${availableTopicsRoute}/${topicId}/workout/go`);
  }, [goToTheRoute, topicId]);

  const handleStartWorkout = React.useCallback(() => {
    // console.log('[WorkoutControl:handleStartWorkout]');
    startWorkout();
    setTimeout(handleResumeWorkout, 10);
  }, [handleResumeWorkout, startWorkout]);

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
        onClick: isWorkoutInProgress ? handleResumeWorkout : handleStartWorkout,
      },
      {
        id: 'ReviewTraining',
        content: 'Review Training',
        variant: 'ghost',
        icon: Icons.LineChart,
        visibleFor: 'lg',
        // disabled: !workout,
        onClick: () => goToTheRoute(`${availableTopicsRoute}/${topicId}/workout`),
      },
      {
        id: 'ManageTopic',
        content: 'Manage Topic',
        variant: 'ghost',
        icon: Icons.Edit,
        visibleFor: 'xl',
        disabled: !allowedEdit,
        onClick: () => goToTheRoute(`${myTopicsRoute}/${topicId}`),
      },
    ],
    [
      allowedEdit,
      allowedTraining,
      goBack,
      goToTheRoute,
      handleResumeWorkout,
      handleStartWorkout,
      isWorkoutInProgress,
      topicId,
      workout?.finished,
      workout?.started,
    ],
  );

  const breadcrumbs = useTopicsBreadcrumbsItems({
    scope: manageScope,
    topic: topic,
  });

  return (
    <>
      <DashboardHeader
        heading={
          topic?.name ? truncateMarkdown(topic?.name, 100) : <Skeleton className="h-8 w-1/2" />
        }
        className={cn(
          isDev && '__ViewAvailableTopic_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <Card
        className={cn(
          isDev && '__ViewAvailableTopic_Card', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden xl:col-span-2',
        )}
      >
        <ViewAvailableTopicContent topic={topic} />
      </Card>
    </>
  );
}
