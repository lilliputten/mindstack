'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import { topicQuestionDeletedEventId } from '@/components/pages/ManageTopicQuestions/DeleteQuestionModal';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import {
  useAvailableQuestionById,
  useAvailableQuestions,
  useAvailableTopicById,
  useGoBack,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { EditQuestionCard } from './EditQuestionCard';

interface TEditQuestionCardHolderProps {
  topicId: TTopicId;
  questionId: TQuestionId;
}

export function EditQuestionCardHolder(props: TEditQuestionCardHolderProps) {
  const t = useT();

  const { topicId, questionId } = props;
  const [hasDeleted, setHasDeleted] = React.useState(false);

  const { manageScope } = useManageTopicsStore();

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(questionsListRoutePath);

  if (!topicId) {
    throw new Error('No topic specified');
  }
  if (!questionId) {
    throw new Error('No question specified');
  }

  // Watch if the question has been deleted (???)
  React.useEffect(() => {
    const handleQuestionDeleted = (event: CustomEvent<TQuestionId>) => {
      const id = event.detail;
      // Make sure the event is for this topic
      if (questionId === id) {
        setHasDeleted(true);
      }
    };
    window.addEventListener(topicQuestionDeletedEventId, handleQuestionDeleted as EventListener);
    return () => {
      window.removeEventListener(
        topicQuestionDeletedEventId,
        handleQuestionDeleted as EventListener,
      );
    };
  }, [questionId]);

  // const availableTopicsQuery = useAvailableTopicsByScope({ manageScope });
  // const {
  //   isFetched: isTopicsFetched,
  //   queryKey: availableTopicsQueryKey,
  //   queryProps: availableTopicsQueryProps,
  // } = availableTopicsQuery;

  const availableTopicQuery = useAvailableTopicById({
    id: topicId,
    // availableTopicsQueryKey,
    // // ...availableTopicsQueryProps,
    // includeWorkout: availableTopicsQueryProps.includeWorkout,
    // includeUser: availableTopicsQueryProps.includeUser,
    // includeQuestionsCount: availableTopicsQueryProps.includeQuestionsCount,
  });

  const {
    // topic,
    isFetched: isTopicFetched,
    // isCached: isTopicCached,
  } = availableTopicQuery;

  const availableQuestionsQuery = useAvailableQuestions({ topicId });
  const {
    queryKey: availableQuestionsQueryKey,
    queryProps: availableQuestionsQueryProps,
    isFetched: isQuestionsFetched,
  } = availableQuestionsQuery;

  const availableQuestionQuery = useAvailableQuestionById({
    id: questionId,
    availableQuestionsQueryKey,
    includeTopic: availableQuestionsQueryProps.includeTopic,
    includeAnswersCount: availableQuestionsQueryProps.includeAnswersCount,
  });
  const {
    question,
    isFetched: isQuestionFetched,
    isCached: isQuestionCached,
    // isLoading: isQuestionLoading,
  } = availableQuestionQuery;
  // const isQuestionLoadingOverall = !question && (!isQuestionFetched || isQuestionLoading);
  const isQuestionReady = isQuestionCached || isQuestionFetched;

  // Effect:hasDeleted
  React.useEffect(() => {
    if (hasDeleted) {
      goBack();
    }
  }, [goBack, hasDeleted]);

  if (hasDeleted) {
    // TODO: Show 'Question has been removed' info?
    return (
      <PageError icon={Icons.Trash} title={t('EditQuestionCardHolder.TheQuestionHasBeenRemoved')} />
    );
  }

  // No data loaded yet - show skeleton
  if (!isTopicFetched || !isQuestionsFetched || !isQuestionReady) {
    return (
      <div
        className={cn(
          isDev && '__EditQuestionCardHolder_Skeleton', // DEBUG
          'flex size-full flex-1 flex-col gap-4 px-6',
        )}
      >
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        {generateArray(3).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!question) {
    throw new Error('No such question found');
  }

  return (
    <EditQuestionCard
      {...props}
      availableTopicQuery={availableTopicQuery}
      availableQuestionsQuery={availableQuestionsQuery}
      availableQuestionQuery={availableQuestionQuery}
    />
  );
}
