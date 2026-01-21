'use client';

import React from 'react';

import { truncateMarkdown } from '@/lib/helpers';
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
import { TAnswer } from '@/features/answers/types';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TQuestion } from '@/features/questions/types';
import { TTopic } from '@/features/topics/types';

interface TBreadcrumbsProps {
  scope: TTopicsManageScopeId;
  topic?: TTopic; // The topic is required by might by undefined while loading, then display skeleton
  question?: TQuestion;
  answer?: TAnswer;
  lastItem?: TBreadcrumbsItemProps | BreadcrumbsItem;
  inactiveLast?: boolean;
  isLoading?: boolean;
}
export function useAnswersBreadcrumbsItems(props: TBreadcrumbsProps) {
  const { scope, topic, question, answer, lastItem, isLoading } = props;
  const t = useT();
  const topicsListRoutePath = topicsRoutes[scope];
  const topicRoutePath = topic && `${topicsListRoutePath}/${topic.id}`;
  const questionsListRoutePath = topicRoutePath && `${topicRoutePath}/questions`;
  const questionRoutePath =
    question && questionsListRoutePath && `${questionsListRoutePath}/${question.id}`;
  const answersListRoutePath = questionRoutePath && `${questionRoutePath}/answers`;
  const answerRoutePath = answer && answersListRoutePath && `${answersListRoutePath}/${answer.id}`;
  // TODO: Use i18n translations
  const listTitle = t('Pages.Answers');
  const questionItems = useQuestionsBreadcrumbsItems({ scope, topic, question });
  if (isLoading) {
    return [];
  }
  const items = filterOutEmpties<TBreadcrumbsItemProps>([
    { link: answersListRoutePath, content: listTitle },
    answer && {
      link: answerRoutePath,
      content: truncateMarkdown(answer.text, 50),
    },
    lastItem,
  ]);
  return [...questionItems, ...items];
}

export function AnswersBreadcrumbs(props: TBreadcrumbsProps & TPropsWithClassName) {
  const { className, inactiveLast, isLoading } = props;
  const items = useAnswersBreadcrumbsItems(props);
  if (isLoading) {
    return (
      <div
        className={cn(
          isDev && '__AnswersBreadcrumbs_Skeleton', // DEBUG
          'flex flex-wrap gap-2',
        )}
      >
        {[...Array(4)].map((_, i) => (
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
        isDev && '__AnswersBreadcrumbs', // DEBUG
        className,
      )}
      items={items}
    />
  );
}
