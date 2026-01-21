'use client';

import React from 'react';

import { generateArray, truncateMarkdown } from '@/lib/helpers';
import { filterOutEmpties } from '@/lib/helpers/arrays';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  TBreadcrumbsItemProps,
} from '@/components/layout/Breadcrumbs';
import { isDev } from '@/constants';
import { topicsRoutes, TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TQuestion } from '@/features/questions/types';
import { useTopicsBreadcrumbsItems } from '@/features/topics/components/TopicsBreadcrumbs';
import { TTopic } from '@/features/topics/types';

interface TBreadcrumbsProps {
  scope: TTopicsManageScopeId;
  topic?: TTopic; // The topic is required by might by undefined while loading, then display skeleton
  question?: TQuestion;
  lastItem?: TBreadcrumbsItemProps | BreadcrumbsItem;
  inactiveLast?: boolean;
  isLoading?: boolean;
}

export function useQuestionsBreadcrumbsItems(props: TBreadcrumbsProps) {
  const { scope, topic, question, lastItem, isLoading } = props;
  const t = useT();
  const topicsListRoutePath = topicsRoutes[scope];
  const topicRoutePath = topic && `${topicsListRoutePath}/${topic.id}`;
  const questionsListRoutePath = topicRoutePath && `${topicRoutePath}/questions`;
  const questionRoutePath =
    question && questionsListRoutePath && `${questionsListRoutePath}/${question.id}`;
  // TODO: Use i18n translations
  const listTitle = t('Pages.Questions');
  const topicItems = useTopicsBreadcrumbsItems({ scope, topic });
  if (isLoading) {
    return [];
  }
  const items = filterOutEmpties<TBreadcrumbsItemProps>([
    { link: questionsListRoutePath, content: listTitle },
    question && {
      link: questionRoutePath,
      content: truncateMarkdown(question.text, 50),
    },
    lastItem,
  ]);
  return [...topicItems, ...items];
}

export function QuestionsBreadcrumbs(props: TBreadcrumbsProps & TPropsWithClassName) {
  const { className, inactiveLast, isLoading } = props;
  const items = useQuestionsBreadcrumbsItems(props);
  if (isLoading) {
    return (
      <div
        className={cn(
          isDev && '__QuestionsBreadcrumbs_Skeleton', // DEBUG
          'flex gap-2',
        )}
      >
        {generateArray(3).map((_, i) => (
          <Skeleton key={i} className="h-6 w-32 rounded" />
        ))}
      </div>
    );
  }
  if (inactiveLast && items.length) {
    const lastIdx = items.length - 1;
    if (items[lastIdx].link) {
      items[lastIdx] = { ...items[lastIdx], link: undefined };
    }
  }
  return (
    <Breadcrumbs
      className={cn(
        isDev && '__QuestionsBreadcrumbs', // DEBUG
        className,
      )}
      items={items}
    />
  );
}
