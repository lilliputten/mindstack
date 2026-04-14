'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute } from '@/config';
import { isDev } from '@/constants';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { useAnswersBreadcrumbsItems } from '@/features/answers/components/AnswersBreadcrumbs';
import { TAvailableAnswer } from '@/features/answers/types';
import { TAvailableQuestion } from '@/features/questions/types';
import { TAvailableTopic } from '@/features/topics/types';
import { useGoBack } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ViewAnswerContent } from './ViewAnswerContent';

interface TViewAnswerCardProps {
  topic: TAvailableTopic;
  question: TAvailableQuestion;
  answer: TAvailableAnswer;
}

export function ViewAnswerCard(props: TViewAnswerCardProps) {
  const { topic, question, answer } = props;
  const { manageScope } = useManageTopicsStore();

  const t = useT();

  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

  // Calculate paths...
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topic.id}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${question.id}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answer.id}`;

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(answersListRoutePath);
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus({
    traceId: 'ViewAnswerCard',
  });

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        disabled: !goBack,
        onClick: goBack,
      },
      {
        id: 'Edit',
        content: t('Edit'),
        icon: Icons.Edit,
        visibleFor: 'lg',
        href: `${answersListRoutePath}/${answer.id}/edit`,
      },
      {
        id: 'AddNewAnswer',
        content: t('AddNewAnswer'),
        icon: Icons.Add,
        visibleFor: 'xl',
        href: `${answersListRoutePath}/add`,
      },
      {
        id: 'GenerateAnswers',
        content: t('GenerateAnswers'),
        icon: Icons.WandSparkles,
        visibleFor: 'xl',
        disabled: !aiGenerationsAllowed || aiGenerationsLoading,
        href: `${answersListRoutePath}/generate`,
      },
      {
        id: 'DeleteAnswer',
        content: t('DeleteAnswer'),
        icon: Icons.Trash,
        visibleFor: 'xl',
        href: `${answersListRoutePath}/delete?answerId=${answer.id}&from=ViewAnswerCard`,
      },
      {
        id: 'AddNewQuestion',
        content: t('AddNewQuestion'),
        icon: Icons.Add,
        href: `${questionsListRoutePath}/add`,
      },
      {
        id: 'GoToTheQuestion',
        content: t('GoToTheQuestion'),
        icon: Icons.ArrowRight,
        href: questionRoutePath,
      },
      {
        id: 'AddNewTopic',
        content: t('AddNewTopic'),
        icon: Icons.Add,
        href: `${topicsListRoutePath}/add`,
      },
      {
        id: 'GoToTheTopic',
        content: t('GoToTheTopic'),
        icon: Icons.ArrowRight,
        href: topicRoutePath,
      },
      {
        id: 'ToTraining',
        content: t('ToTraining'),
        icon: Icons.Rocket,
        href: `${availableTopicsRoute}/${topic.id}/workout`,
        hidden: !allowedTraining,
      },
    ],
    [
      t,
      goBack,
      answersListRoutePath,
      answer.id,
      aiGenerationsAllowed,
      aiGenerationsLoading,
      questionsListRoutePath,
      topicsListRoutePath,
      questionRoutePath,
      topicRoutePath,
      topic.id,
      allowedTraining,
    ],
  );

  const breadcrumbs = useAnswersBreadcrumbsItems({
    scope: manageScope,
    isLoading: !topic || !question || !answer,
    topic: topic,
    question: question,
    answer: answer,
  });

  return (
    <>
      <DashboardHeader
        heading={t('ViewAnswerCard.ViewAnswer')}
        className={cn(
          isDev && '__ViewAnswerCard_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <Card
        className={cn(
          isDev && '__ViewAnswerCard_Card', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6 xl:col-span-2',
        )}
      >
        <ViewAnswerContent topic={topic} question={question} answer={answer} />
      </Card>
    </>
  );
}
