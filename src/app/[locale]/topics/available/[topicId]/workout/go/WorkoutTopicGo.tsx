'use client';

import React from 'react';

import { availableTopicsRoute, myTopicsRoute } from '@/config/routesConfig';
import { truncateMarkdown } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { useTopicsBreadcrumbsItems } from '@/features/topics/components/TopicsBreadcrumbs';
import {
  useAvailableQuestionById,
  useAvailableTopicById,
  useGoBack,
  useGoToTheRoute,
  useSessionUser,
} from '@/hooks';

import { ContentSkeleton } from './ContentSkeleton';
import { WorkoutTopicGoContent } from './WorkoutTopicGoContent';

const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;

export function WorkoutTopicGo() {
  const { topicId, workout, pending } = useWorkoutContext();

  if (!topicId) {
    throw new Error('No workout topic ID found');
  }

  const availableTopicQuery = useAvailableTopicById({ id: topicId });
  const { topic, isLoading: isTopicLoading, isFetched: isTopicFetched } = availableTopicQuery;
  const isTopicPending = isTopicLoading && !isTopicFetched;

  const isWorkoutInProgress = workout?.started && !workout?.finished;

  const workoutRoutePath = `${availableTopicsRoute}/${topicId}/workout`;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(workoutRoutePath);

  const user = useSessionUser();
  const isOwner = topic?.userId && topic?.userId === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;
  // const questionsCount = _count?.questions;
  // const allowedTraining = !!questionsCount;

  const currentQuestionId = React.useMemo(() => {
    if (!workout?.questionsOrder) return null;
    const questionsOrder = workout.questionsOrder ? workout.questionsOrder.split(' ') : [];
    const currentIndex = workout.stepIndex || 0;
    return questionsOrder[currentIndex] || null;
  }, [workout?.questionsOrder, workout?.stepIndex]);

  const availableQuestionQuery = useAvailableQuestionById({ id: currentQuestionId || '' });
  const {
    question,
    // isFetched: isQuestionFetched,
    // isLoading: isQuestionLoading,
  } = availableQuestionQuery;

  React.useEffect(() => {
    if ((!workout || !isWorkoutInProgress) && !pending) {
      // eslint-disable-next-line no-console
      console.warn('[WorkoutTopicGo] No active training: go to the workout review page', {
        workout,
      });
      goBack();
      // goToTheRoute(workoutRoutePath);
    }
  }, [goBack, workoutRoutePath, workout, isWorkoutInProgress, pending]);

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
        hidden: !allowedEdit,
        onClick: () => goToTheRoute(`${myTopicsRoute}/${topicId}`),
      },
      {
        id: 'ManageQuestion',
        content: 'Manage Question',
        variant: 'ghost',
        icon: Icons.Questions,
        visibleFor: 'xl',
        hidden: !isWorkoutInProgress || !allowedEdit,
        onClick: () => goToTheRoute(`${myTopicsRoute}/${topicId}/questions/${currentQuestionId}`),
      },
    ],
    [allowedEdit, goBack, goToTheRoute, topicId, isWorkoutInProgress, currentQuestionId],
  );

  const breadcrumbs = useTopicsBreadcrumbsItems({
    scope: manageScope,
    topic: topic,
    lastItem: {
      content: 'Training',
      // link: isWorkoutInProgress ? questionsContext.routePath : undefined,
    },
  });

  const content =
    isTopicPending || !topic ? (
      <ContentSkeleton omitHeader answersCount={question?._count?.answers} />
    ) : (
      <Card
        className={cn(
          isDev && '__WorkoutTopicGo', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden',
        )}
      >
        <ScrollArea
          className={cn(
            isDev && '__WorkoutTopicGo_Scroll', // DEBUG
          )}
          viewportClassName={cn(
            isDev && '__WorkoutTopicGo_ScrollViewport', // DEBUG
            '[&>div]:!flex [&>div]:flex-col [&>div]:gap-4 [&>div]:flex-1',
          )}
        >
          <CardHeader
            className={cn(
              isDev && '__WorkoutTopicGo_Header', // DEBUG
              'item-start flex flex-col gap-4',
            )}
          >
            <TopicHeader
              scope={TopicsManageScopeIds.AVAILABLE_TOPICS}
              topic={topic}
              className="flex-1 max-sm:flex-col-reverse"
              showName={false}
              showDescription
            />
            {/* <TopicProperties topic={topic} className="flex-1 text-sm" showDates /> */}
          </CardHeader>
          <CardContent
            className={cn(
              isDev && '__WorkoutTopicGo_Content', // DEBUG
              'relative flex flex-1 flex-col overflow-hidden px-0',
            )}
          >
            <WorkoutTopicGoContent topic={topic} />
          </CardContent>
        </ScrollArea>
      </Card>
    );

  /* // DEMO: Show ContentSkeleton
   * if (false) {
   *   return <ContentSkeleton />;
   * }
   */

  return (
    <>
      <DashboardHeader
        heading={truncateMarkdown(topic?.name || '...', 100)}
        className={cn(
          isDev && '__WorkoutTopicGo_DashboardHeader', // DEBUG
          'mx-6',
        )}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {content}
    </>
  );
}
