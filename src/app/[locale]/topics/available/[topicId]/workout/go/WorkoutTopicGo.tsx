'use client';

import React from 'react';

import { availableTopicsRoute, myTopicsRoute } from '@/config/routesConfig';
import { truncateMarkdown } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Skeleton } from '@/components/ui/Skeleton';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { TQuestionId } from '@/features/questions/types';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { useTopicsBreadcrumbsItems } from '@/features/topics/components/TopicsBreadcrumbs';
import { WorkoutControl } from '@/features/workouts/components';
import {
  useAvailableAnswers,
  useAvailableQuestionById,
  useAvailableTopicById,
  useGoBack,
  useGoToTheRoute,
  useSessionUser,
} from '@/hooks';

import { ContentSkeleton } from './ContentSkeleton';
import { WorkoutTopicGoContent } from './WorkoutTopicGoContent';

const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;

function NextQuestionPrefetcher({ questionId }: { questionId?: TQuestionId }) {
  useAvailableQuestionById({ id: questionId || '' });
  useAvailableAnswers({
    itemsLimit: null,
    questionId: questionId || '',
  });
  /* // DEBUG
   * const { isFetched: isQuestionFetched, isLoading: isQuestionLoading } = nextQuestionQuery;
   * const isQuestionReady = isQuestionFetched && !isQuestionLoading;
   * const { isFetched: isAnswersFetched, isLoading: isAnswersLoading } = nextAnswersQuery;
   * const isAnswersReady = isAnswersFetched && !isAnswersLoading;
   * React.useEffect(() => {
   *   if (questionId) {
   *     console.log('[NextQuestionPrefetcher]', {
   *       questionId,
   *       isQuestionReady,
   *       isAnswersReady,
   *     });
   *   }
   * }, [questionId, isQuestionReady, isAnswersReady]);
   */
  return null;
}

interface TMemo {
  questionId?: TQuestionId;
  finished?: boolean;
  // Detect any question changes to determinde if we should to (re-)start a workout if none
  hasWorkoutUpdated?: boolean;
  isStarting?: boolean;
  // Init timeout handler, if not resolved (true)
  // initTimeoutHandler?: ReturnType<typeof setTimeout> | true;
}

export function WorkoutTopicGo() {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const { topicId, workout, pending: isWorkoutPending, startWorkout } = useWorkoutContext();

  const [inited, setInited] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);

  if (!topicId) {
    throw new Error('No workout topic ID found');
  }

  const availableTopicQuery = useAvailableTopicById({ id: topicId });
  const { topic, isLoading: isTopicLoading, isFetched: isTopicFetched } = availableTopicQuery;
  const isTopicPending = isTopicLoading && !isTopicFetched;

  const questionsOrder = workout?.questionsOrder;
  const stepIndex = workout?.stepIndex || 0;

  const isWorkoutFinished = workout?.finished;
  const isWorkoutInProgress = workout?.started && !isWorkoutFinished;
  const hasActiveWorkout = workout && isWorkoutInProgress;

  const workoutRoutePath = `${availableTopicsRoute}/${topicId}/workout`;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(workoutRoutePath);

  const user = useSessionUser();
  const isOwner = topic?.userId && topic?.userId === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;
  // const questionsCount = _count?.questions;
  // const allowedTraining = !!questionsCount;

  const unpackedQuestionsOrder = React.useMemo(() => {
    return questionsOrder ? questionsOrder.split(' ') : [];
  }, [questionsOrder]);

  const currentQuestionId = unpackedQuestionsOrder[stepIndex] || '';
  const nextQuestionId = unpackedQuestionsOrder[stepIndex + 1] || '';

  // Effect: Detect any question changes to determinde if we should to (re-)start a workout if none
  React.useEffect(() => {
    if (currentQuestionId) {
      const hasFinishedRightNow = !!memo.questionId && Boolean(memo.finished) !== isWorkoutFinished;
      if (!isWorkoutPending && (currentQuestionId !== memo.questionId || hasFinishedRightNow)) {
        // Real change (or just initializtion otherwise)
        if (memo.questionId || hasFinishedRightNow) {
          memo.hasWorkoutUpdated = true;
        }
        memo.questionId = currentQuestionId;
        memo.finished = isWorkoutFinished;
        setInited(true);
      }
    }
  }, [memo, isWorkoutPending, currentQuestionId, isWorkoutFinished]);

  const availableQuestionQuery = useAvailableQuestionById({ id: currentQuestionId || '' });
  const {
    question,
    // isFetched: isQuestionFetched,
    // isLoading: isQuestionLoading,
  } = availableQuestionQuery;

  // Effect: Start workout if no active one (and hasn't been any activity yet)
  React.useEffect(() => {
    if (!memo.isStarting && !memo.hasWorkoutUpdated && !hasActiveWorkout && !isWorkoutPending) {
      // eslint-disable-next-line no-console
      console.warn('[WorkoutTopicGo] No active training: startaing it now!');
      memo.isStarting = true;
      setIsStarting(true);
      startWorkout()
        .then(() => {
          setInited(true);
        })
        .finally(() => {
          memo.isStarting = false;
          setIsStarting(false);
        });
    }
  }, [memo, startWorkout, hasActiveWorkout, isWorkoutPending, isWorkoutFinished]);

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
        onClick: () =>
          goToTheRoute(`${myTopicsRoute}/${topicId}/questions/${currentQuestionId || ''}`),
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
    isTopicPending || !topic || isWorkoutPending || !workout ? (
      <ContentSkeleton omitHeader answersCount={question?._count?.answers} />
    ) : isStarting ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
        <Icons.Spinner className="mx-auto size-8 animate-spin text-theme" />
        <p>The training is starting...</p>
      </div>
    ) : isWorkoutFinished ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
        <Icons.Activity className="mx-auto size-8 text-theme" />
        <p className="text-lg">The training is already completed.</p>
        <WorkoutControl className="items-center" />
      </div>
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
        heading={
          topic?.name ? truncateMarkdown(topic?.name, 100) : <Skeleton className="h-8 w-1/2" />
        }
        className={cn(
          isDev && '__WorkoutTopicGo_DashboardHeader', // DEBUG
          'mx-6',
        )}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {content}
      {inited && !!nextQuestionId && <NextQuestionPrefetcher questionId={nextQuestionId} />}
    </>
  );
}
