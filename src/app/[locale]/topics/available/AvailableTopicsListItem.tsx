import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { availableTopicsRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { MarkdownText } from '@/components/ui/MarkdownText';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { TopicProperties } from '@/features/topics/components/TopicProperties';
import { TTopic } from '@/features/topics/types';
import { useAvailableTopicsByScope } from '@/hooks';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { usePathname } from '@/i18n/routing'; // TODO: Use 'next/navigation'

interface TAvailableTopicsListItemProps {
  index: number;
  style?: React.CSSProperties;
  topic: TTopic;
}

export function AvailableTopicsListItem(props: TAvailableTopicsListItemProps) {
  const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
  const { topic, style } = props;
  const {
    id,
    // userId,
    // name,
    description,
    // isPublic,
    // langCode,
    // langName,
    // keywords,
    // createdAt,
    // updatedAt,
    _count,
  } = topic;
  const questionsCount = _count?.questions;
  const allowedTraining = !!questionsCount;
  const { routePath } = useAvailableTopicsByScope({ manageScope });
  const router = useRouter();
  const pathname = usePathname();
  const topicsRoutePath = `${routePath}/${id}`;
  const workoutRoutePath = `${availableTopicsRoute}/${id}/workout`;
  const isCurrentTopicRoutePath = comparePathsWithoutLocalePrefix(topicsRoutePath, pathname);
  const startWorkout = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    router.push(workoutRoutePath);
  };
  /* const defaultAction = (ev: React.MouseEvent) => {
   *   ev.stopPropagation();
   *   router.push(topicRoutePath);
   * };
   */
  let cardContent = (
    <>
      <CardHeader
        className={cn(
          isDev && '__AvailableTopicsList_TopicItem_CardHeader', // DEBUG
          'flex flex-1 flex-row gap-2 pb-4',
          'max-sm:flex-col-reverse',
        )}
      >
        <TopicHeader
          scope={manageScope}
          topic={topic}
          className="flex-1 max-sm:flex-col-reverse"
          showProperties={false}
        />
      </CardHeader>
      {!!description && (
        <CardContent
          className={cn(
            isDev && '__AvailableTopicsList_TopicItem_CardContent_Description', // DEBUG
            'flex flex-1 flex-col',
          )}
        >
          <div id="description">
            <MarkdownText omitLinks>{description}</MarkdownText>
          </div>
        </CardContent>
      )}
      <CardContent
        className={cn(
          isDev && '__AvailableTopicsList_TopicItem_CardContent_Properties', // DEBUG
          'flex flex-1 flex-wrap gap-4 text-xs max-sm:flex-col md:items-center',
        )}
      >
        <div
          className={cn(
            isDev && '__AvailableTopicsList_TopicItem__TopicProperties', // DEBUG
            'flex flex-1 flex-wrap items-center gap-4 gap-y-2 py-3',
          )}
        >
          <TopicProperties topic={topic} showDates />
        </div>
        <div
          className={cn(
            isDev && '__AvailableTopicsList_TopicItem__RightActions', // DEBUG
            'flex flex-wrap items-center gap-4 md:items-end',
          )}
        >
          {allowedTraining && (
            <Button variant="theme" onClick={startWorkout} className="flex gap-2">
              <Icons.ArrowRight className="hidden size-4 opacity-50 sm:flex" />
              <span>Start Training</span>
            </Button>
          )}
        </div>
      </CardContent>
    </>
  );
  if (!isCurrentTopicRoutePath) {
    cardContent = (
      <Link className="flex-1 text-xl font-medium" href={topicsRoutePath}>
        {cardContent}
      </Link>
    );
  }
  return (
    <Card
      className={cn(
        isDev && '__AvailableTopicsList_TopicItem_Card', // DEBUG
        'relative flex flex-1 flex-col',
        'overflow-visible',
        'cursor-pointer border border-theme-800/10 transition',
        'bg-theme/10',
        'hover:bg-theme/15',
      )}
      // onClick={defaultAction}
      style={{
        ...style,
      }}
    >
      {cardContent}
    </Card>
  );
}
