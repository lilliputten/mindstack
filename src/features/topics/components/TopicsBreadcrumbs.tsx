'use client';

import React from 'react';

import { truncateString } from '@/lib/helpers';
import { filterOutEmpties } from '@/lib/helpers/arrays';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  TBreadcrumbsItemProps,
} from '@/components/layout/Breadcrumbs';
import { isDev } from '@/constants';
import { topicsNamespaces, topicsRoutes, TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TTopic } from '@/features/topics/types';
import { useT } from '@/i18n';

interface TBreadcrumbsProps {
  scope: TTopicsManageScopeId;
  topic?: TTopic | BreadcrumbsItem;
  lastItem?: TBreadcrumbsItemProps | BreadcrumbsItem;
  inactiveLast?: boolean;
  isLoading?: boolean;
}

export function useTopicsBreadcrumbsItems(props: TBreadcrumbsProps) {
  const { scope, topic, lastItem } = props;
  const t = useT();
  const topicsListRoutePath = topicsRoutes[scope];
  const namespace = topicsNamespaces[scope];
  // TODO: Use i18n translation by `scope`
  const listTitle = t(`Pages.${namespace}Title`); // capitalizeString(scope) + ' ' + 'Topics'; /* + (isDev ? '*' : '') */
  const items = filterOutEmpties<TBreadcrumbsItemProps>([
    { link: topicsListRoutePath, content: listTitle },
    !topic
      ? null
      : topic instanceof BreadcrumbsItem
        ? topic
        : {
            link: `${topicsListRoutePath}/${topic.id}`,
            content: truncateString(topic.name, 50),
          },
    lastItem,
  ]);
  return items;
}

export function TopicsBreadcrumbs(props: TBreadcrumbsProps & TPropsWithClassName) {
  const { className, isLoading, inactiveLast } = props;
  const items = useTopicsBreadcrumbsItems(props);
  if (isLoading) {
    return (
      <div
        className={cn(
          isDev && '__TopicsBreadcrumbs_Skeleton', // DEBUG
          'flex gap-2',
        )}
      >
        {[...Array(2)].map((_, i) => (
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
        isDev && '__TopicsBreadcrumbs', // DEBUG
        className,
      )}
      items={items}
    />
  );
}
