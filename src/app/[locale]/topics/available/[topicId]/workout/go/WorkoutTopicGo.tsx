'use client';

import React from 'react';

import { truncateMarkdown } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Skeleton } from '@/components/ui/Skeleton';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { allTopicsRoute, availableTopicsRoute, myTopicsRoute } from '@/config';
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
  // workoutContext?: ReturnType<typeof useWorkoutContext>;
}

export function WorkoutTopicGo() {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const workoutContext = useWorkoutContext();
  const {
    ///
    pending: isWorkoutPending,
    topicId,
    workout,
    startWorkout,
    refetch: refetchWorkout,
    // isPending,
    // isFetched,
    // isLoading,
  } = workoutContext;
  // memo.workoutContext = workoutContext;
  // const isWorkoutReady =
  //   !workoutContext.isPending && !workoutContext.isLoading && workoutContext.isFetched;
  // const isWorkoutPending = !isWorkoutReady;

  const t = useT();

  const [inited, setInited] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);

  if (!topicId) {
    throw new Error('No workout topic ID found');
  }

  const availableTopicQuery = useAvailableTopicById({ id: topicId });
  const {
    topic,
    isLoading: isTopicLoading,
    isFetched: isTopicFetched,
    refetch: refetchTopic,
  } = availableTopicQuery;
  const isTopicPending = isTopicLoading && !isTopicFetched;

  const questionsOrder = workout?.questionsOrder;
  const stepIndex = workout?.stepIndex || 0;

  const isWorkoutFinished = workout?.finished;
  const isWorkoutInProgress = workout?.started && !isWorkoutFinished;
  // const hasActiveWorkout = workout && isWorkoutInProgress;

  const workoutRoutePath = `${availableTopicsRoute}/${topicId}/workout`;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(workoutRoutePath);

  const user = useSessionUser();
  const isOwner = topic?.userId && topic?.userId === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;
  // const questionsCount = _count?.questions;
  // const allowedTraining = !!questionsCount;

  const manageTopicsRoute = isOwner ? myTopicsRoute : allTopicsRoute;

  const unpackedQuestionsOrder = React.useMemo(() => {
    return questionsOrder ? questionsOrder.split(' ') : [];
  }, [questionsOrder]);

  const currentQuestionId = unpackedQuestionsOrder[stepIndex] || '';
  const nextQuestionId = unpackedQuestionsOrder[stepIndex + 1] || '';

  const availableQuestionQuery = useAvailableQuestionById({ id: currentQuestionId || '' });
  const {
    question,
    // isFetched: isQuestionFetched,
    // isLoading: isQuestionLoading,
  } = availableQuestionQuery;

  React.useEffect(() => {
    // NOTE: Or display a message below (see `!workout` condition)
    if (!isWorkoutPending && !workout) {
      goToTheRoute(workoutRoutePath);
    }
  }, [isWorkoutPending, workout, goToTheRoute, workoutRoutePath]);

  const handleStart = React.useCallback(() => {
    if (!memo.isStarting) {
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
  }, [memo, startWorkout]);

  /* // Effect:Start workout if no active one (and hasn't been any activity yet) (Is it necessary?)
   * React.useEffect(() => {
   *   console.log('[WorkoutTopicGo:Effect:Start]', {
   *     memo,
   *     hasActiveWorkout,
   *     isWorkoutPending,
   *   });
   *   if (!memo.isStarting && !memo.hasWorkoutUpdated && !hasActiveWorkout && !isWorkoutPending) {
   *     const message = 'No active training: startaing it now!';
   *     // eslint-disable-next-line no-console
   *     console.warn('[WorkoutTopicGo:Effect:Start]', message, {
   *       memo,
   *       hasActiveWorkout,
   *       isWorkoutPending,
   *     });
   *     handleStart();
   *   }
   * }, [memo, startWorkout, hasActiveWorkout, isWorkoutPending, isWorkoutFinished, handleStart]);
   */

  // Effect:Finished: Detect any question changes to determinde if we should to (re-)start a workout if none
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
        if (isWorkoutFinished && !memo.isStarting) {
          const message = 'No active training';
          // eslint-disable-next-line no-console
          console.warn('[WorkoutTopicGo:Effect:Finished]', message, {
            isWorkoutFinished,
          });
          /* // TODO: Redirect to the workout page?
           * setTimeout(() => {
           *   // DEBUG: isMounted = false
           *   if (isMounted) {
           *     goToTheRoute(workoutRoutePath);
           *   }
           * }, 2000);
           */
        }
        setInited(true);
      }
    }
  }, [
    memo,
    isWorkoutPending,
    currentQuestionId,
    isWorkoutFinished,
    goToTheRoute,
    workoutRoutePath,
  ]);

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
        id: 'ManageTopic',
        content: t('AvailableTopics.ManageTopic'),
        variant: 'ghost',
        icon: Icons.Edit,
        visibleFor: 'xl',
        hidden: !allowedEdit,
        onClick: () => goToTheRoute(`${manageTopicsRoute}/${topicId}`),
      },
      {
        id: 'ManageQuestion',
        content: t('AvailableTopics.ManageQuestion'),
        variant: 'ghost',
        icon: Icons.Questions,
        visibleFor: 'xl',
        hidden: !isWorkoutInProgress || !allowedEdit,
        onClick: () =>
          goToTheRoute(`${myTopicsRoute}/${topicId}/questions/${currentQuestionId || ''}`),
      },
    ],
    [
      t,
      goBack,
      allowedEdit,
      isWorkoutInProgress,
      goToTheRoute,
      manageTopicsRoute,
      topicId,
      currentQuestionId,
    ],
  );

  const breadcrumbs = useTopicsBreadcrumbsItems({
    scope: manageScope,
    topic: topic,
    lastItem: {
      content: t('WorkoutTopic.Training'),
      // link: isWorkoutInProgress ? questionsContext.routePath : undefined,
    },
  });

  const isWaiting = isTopicPending || isWorkoutPending; // || !topic || !workout;

  const content = isWaiting ? (
    <ContentSkeleton omitHeader answersCount={question?._count?.answers} />
  ) : !topic ? (
    <PageError
      className={cn(
        isDev && '__WorkoutTopicGo_Error_NoTopic', // DEBUG
      )}
      error={t('WorkoutTopicGo.NoTopicFound')}
      reset={refetchTopic}
      // extraActions={extraActions}
    />
  ) : !workout ? (
    <PageError
      className={cn(
        isDev && '__WorkoutWorkoutGo_Error_NoWorkout', // DEBUG
      )}
      error={t('WorkoutTopicGo.NoWorkoutFound')}
      reset={refetchWorkout}
      // extraActions={extraActions}
    />
  ) : isStarting ? (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
      <Icons.Spinner className="mx-auto size-8 animate-spin text-theme" />
      <p>{t('WorkoutTopic.TrainingIsStarting')}</p>
    </div>
  ) : isWorkoutFinished ? (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
      <Icons.Activity className="mx-auto size-8 text-theme" />
      <p className="text-lg">{t('WorkoutTopic.TrainingAlreadyCompleted')}</p>
      <WorkoutControl className="items-center p-6" handleStart={handleStart} />
    </div>
  ) : (
    <ScrollArea
      className={cn(
        isDev && '__WorkoutTopicGo_Scroll', // DEBUG
      )}
      viewportClassName={cn(
        isDev && '__WorkoutTopicGo_ScrollViewport', // DEBUG
        '[&>div]:!flex [&>div]:flex-col [&>div]:gap-4 [&>div]:flex-1',
      )}
    >
      <TopicHeader
        scope={TopicsManageScopeIds.AVAILABLE_TOPICS}
        topic={topic}
        className="flex-1 px-6 max-sm:flex-col-reverse"
        showName={false}
        showDescription
      />
      {/* <TopicProperties topic={topic} className="flex-1 text-sm" showDates /> */}
      <WorkoutTopicGoContent topic={topic} />
    </ScrollArea>
  );

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
