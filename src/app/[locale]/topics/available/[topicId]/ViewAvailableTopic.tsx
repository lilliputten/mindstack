'use client';

import React from 'react';

import { truncateMarkdown } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { allTopicsRoute, availableTopicsRoute, myTopicsRoute } from '@/config';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, topicsRoutes } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useTopicsBreadcrumbsItems } from '@/features/topics/components/TopicsBreadcrumbs';
import { TAvailableTopic } from '@/features/topics/types';
import { useGoBack, useGoToTheRoute, useSessionUser } from '@/hooks';

import { ViewAvailableTopicContent } from './ViewAvailableTopicContent';

const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
const routePath = topicsRoutes[manageScope];

interface TViewAvailableTopicProps {
  topic: TAvailableTopic;
}

export function ViewAvailableTopic(props: TViewAvailableTopicProps) {
  const { topic } = props;
  const topicId = topic.id;
  const t = useT();

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(routePath);

  const workoutContext = useWorkoutContext();
  const {
    // pending,
    // startWorkout,
    // topic,
    // topicId,
    // userId,
    questionIds,
    workout,
  } = workoutContext;

  // const nothingToDisplay = !workout;
  const questionsCount = questionIds?.length || 0;
  const allowedTraining = !!questionsCount;
  // const isWorkoutInProgress = workout?.started && !workout?.finished;

  const user = useSessionUser();
  const isOwner = topic?.userId && topic?.userId === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;

  const manageTopicsRoute = isOwner ? myTopicsRoute : allTopicsRoute;

  const handleResumeWorkout = React.useCallback(() => {
    goToTheRoute(`${availableTopicsRoute}/${topicId}/workout/go`);
  }, [goToTheRoute, topicId]);

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
        visibleFor: 'md',
        disabled: !allowedTraining,
        onClick: handleResumeWorkout, // isWorkoutInProgress ? handleResumeWorkout : handleStartWorkout,
      },
      {
        id: 'ReviewTraining',
        content: t('AvailableTopics.TrainingDetails'),
        variant: 'ghost',
        icon: Icons.LineChart,
        visibleFor: 'lg',
        hidden: !workout,
        onClick: () => goToTheRoute(`${availableTopicsRoute}/${topicId}/workout`),
      },
      {
        id: 'ManageTopic',
        content: t('AvailableTopics.ManageTopic'),
        variant: 'ghost',
        icon: Icons.Edit,
        visibleFor: 'xl',
        disabled: !allowedEdit,
        onClick: () => goToTheRoute(`${manageTopicsRoute}/${topicId}`),
      },
    ],
    [
      t,
      goBack,
      workout,
      allowedTraining,
      handleResumeWorkout,
      allowedEdit,
      goToTheRoute,
      topicId,
      manageTopicsRoute,
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
      <ViewAvailableTopicContent topic={topic} />
    </>
  );
}
