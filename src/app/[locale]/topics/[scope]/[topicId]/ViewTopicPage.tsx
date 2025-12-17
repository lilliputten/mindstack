'use client';

import React from 'react';
import { toast } from 'sonner';

import { availableTopicsRoute } from '@/config/routesConfig';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { useTopicsBreadcrumbsItems } from '@/features/topics/components/TopicsBreadcrumbs';
import { TTopicId } from '@/features/topics/types';
import {
  useAvailableTopicById,
  useAvailableTopicsByScope,
  useGoBack,
  useGoToTheRoute,
} from '@/hooks';
import { useT } from '@/i18n';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ViewTopicContentSummary } from './ViewTopicContentSummary';

interface TViewTopicPageProps extends TPropsWithClassName {
  topicId: TTopicId;
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
}

export function ViewTopicPage(props: TViewTopicPageProps) {
  const { topicId, availableTopicsQuery, availableTopicQuery } = props;
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const goBack = useGoBack(routePath);
  const goToTheRoute = useGoToTheRoute();
  const t = useT();

  const {
    topic,
    // queryKey: availableTopicQueryKey,
    // isFetched: isTopicFetched,
    // isLoading: isTopicLoading,
    // isCached: isTopicCached,
  } = availableTopicQuery;

  // Error: topic hasn't been found
  if (!topic) {
    throw new Error(t('ViewTopicPage.NoTopicFound'));
  }

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const questionsCount = topic._count?.questions;
  const allowedTraining = !!questionsCount;

  const breadcrumbs = useTopicsBreadcrumbsItems({ topic, scope: manageScope });

  const aiGenerationsStatusQuery = useAIGenerationsStatus();
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = aiGenerationsStatusQuery;

  const handleReload = React.useCallback(() => {
    availableTopicQuery
      .refetch()
      .then((res) => {
        const topic = res.data;
        if (topic) {
          // Add the created item to the cached react-query data
          availableTopicsQuery.updateTopic(topic);
          // Invalidate all other keys...
          availableTopicsQuery.invalidateAllKeysExcept([availableTopicsQuery.queryKey]);
        }
      })
      .catch((error) => {
        const message = t('ViewTopicPage.CannotUpdateTopicData');
        // eslint-disable-next-line no-console
        console.error('[ViewTopicPage:handleReload]', message, {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
      });
  }, [availableTopicQuery, availableTopicsQuery, t]);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        // variant: 'ghost',
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        disabled: !goBack,
        onClick: goBack,
      },
      {
        id: 'Start Training',
        content: t('ViewTopicPage.StartTraining'),
        // variant: 'theme',
        icon: Icons.ArrowRight,
        visibleFor: 'md',
        onClick: () => goToTheRoute(`${availableTopicsRoute}/${topicId}/workout`),
        hidden: !allowedTraining,
      },
      {
        id: 'Reload',
        content: t('ViewTopicPage.Reload'),
        // variant: 'ghost',
        icon: Icons.Refresh,
        // visibleFor: 'lg',
        onClick: handleReload,
      },
      {
        id: 'Edit',
        content: t('Edit'),
        // variant: 'ghost',
        icon: Icons.Edit,
        visibleFor: 'lg',
        onClick: () => goToTheRoute(`${topicRoutePath}/edit`),
      },
      {
        id: 'Questions',
        content: t('Questions'),
        // variant: 'ghost',
        icon: Icons.Questions,
        visibleFor: 'lg',
        onClick: () => goToTheRoute(`${topicRoutePath}/questions`),
      },
      {
        id: 'Add New Question',
        content: t('ViewTopicPage.AddNewQuestion'),
        // variant: 'success',
        icon: Icons.Add,
        // visibleFor: 'lg',
        onClick: () => goToTheRoute(`${questionsListRoutePath}/add`),
      },
      {
        id: 'Generate Questions',
        content: t('ViewTopicPage.GenerateQuestions'),
        // variant: 'secondary',
        icon: Icons.WandSparkles,
        visibleFor: 'lg',
        disabled: !aiGenerationsAllowed || aiGenerationsLoading,
        onClick: () => goToTheRoute(`${questionsListRoutePath}/generate`),
      },
      {
        id: 'Delete Topic',
        content: t('ViewTopicPage.DeleteTopic'),
        // variant: 'destructive',
        icon: Icons.Trash,
        // visibleFor: 'lg',
        onClick: () => goToTheRoute(`${routePath}/delete?topicId=${topicId}&from=ViewTopicPage`),
      },
    ],
    [
      t,
      goBack,
      allowedTraining,
      handleReload,
      aiGenerationsAllowed,
      aiGenerationsLoading,
      goToTheRoute,
      topicId,
      topicRoutePath,
      questionsListRoutePath,
      routePath,
    ],
  );

  return (
    <>
      <DashboardHeader
        heading={t('ViewTopicPage.ViewTopic')}
        className={cn(
          isDev && '__ViewTopicPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <Card
        className={cn(
          isDev && '__ViewTopicCard', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6 xl:col-span-2',
        )}
      >
        <ScrollArea>
          <ViewTopicContentSummary availableTopicQuery={availableTopicQuery} />
        </ScrollArea>
      </Card>
    </>
  );
}
