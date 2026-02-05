'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useAvailableQuestionById } from '@/hooks/react-query/useAvailableQuestionById';
import { Card } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute } from '@/config';
import { isDev } from '@/constants';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useGoBack } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ViewQuestionContentSummary } from './ViewQuestionContentSummary';

interface TViewQuestionCardProps {
  topicId: TTopicId;
  questionId: TQuestionId;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
  availableQuestionQuery: ReturnType<typeof useAvailableQuestionById>;
}

export function ViewQuestionCard(props: TViewQuestionCardProps) {
  const { topicId, questionId, availableTopicQuery, availableQuestionQuery } = props;
  const { manageScope } = useManageTopicsStore();

  const t = useT();

  // const { queryKey: availableTopicQueryKey } = availableQuestionQuery;

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(questionsListRoutePath);

  const { topic } = availableTopicQuery;
  const { question } = availableQuestionQuery;

  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

  if (!topic) {
    throw new Error(`No topic exists for ${topicId}`);
  }
  if (!question) {
    throw new Error(`No question exists for ${questionId}`);
  }

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
        href: `${questionsListRoutePath}/${question.id}/edit`,
      },
      {
        id: 'Answers',
        content: t('Answers'),
        icon: Icons.Answers,
        visibleFor: 'lg',
        href: `${questionsListRoutePath}/${question.id}/answers`,
      },
      {
        id: 'Add New Question',
        content: t('ViewQuestionCard.AddNewQuestion'),
        icon: Icons.Add,
        href: `${questionsListRoutePath}/add`,
      },
      {
        id: 'Delete Question',
        content: t('ViewQuestionCard.DeleteQuestion'),
        icon: Icons.Trash,
        href: `${questionsListRoutePath}/delete?questionId=${question.id}&from=ViewQuestionCard`,
      },
      {
        id: 'Start Training',
        content: t('ToTraining'),
        icon: Icons.Rocket,
        visibleFor: 'md',
        href: `${availableTopicsRoute}/${topicId}/workout`,
        hidden: !allowedTraining,
      },
    ],
    [t, goBack, allowedTraining, topicId, questionsListRoutePath, question.id],
  );

  const breadcrumbs = useQuestionsBreadcrumbsItems({
    scope: manageScope,
    isLoading: !topic,
    topic: topic,
    question: question,
  });

  return (
    <>
      <DashboardHeader
        heading={t('ViewQuestionCard.ViewQuestion')}
        className={cn(
          isDev && '__ViewQuestionCard_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <Card
        className={cn(
          isDev && '__ViewQuestionCard_Card', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6 xl:col-span-2',
        )}
      >
        <ScrollArea>
          <ViewQuestionContentSummary topic={topic} question={question} />
        </ScrollArea>
      </Card>
    </>
  );
}
