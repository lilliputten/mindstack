import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { Link, usePathname } from '@/i18n/routing';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import * as Icons from '@/components/shared/Icons';
import { allTopicsRoute, availableTopicsRoute, myTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import { TopicHeader } from '@/features/topics/components/TopicHeader';
import { TopicProperties } from '@/features/topics/components/TopicProperties';
import { TAvailableTopic } from '@/features/topics/types';
import { useGoToTheRoute, useSessionUser } from '@/hooks';

interface TAvailableTopicsListItemProps {
  index: number;
  style?: React.CSSProperties;
  topic: TAvailableTopic;
}

export function AvailableTopicsListItem(props: TAvailableTopicsListItemProps) {
  const manageScope = TopicsManageScopeIds.AVAILABLE_TOPICS;
  const { topic, style } = props;
  const t = useT();
  const {
    // createdAt,
    // description,
    // isPublic,
    // keywords,
    // langCode,
    // langName,
    // name,
    // updatedAt,
    // userId,
    // workoutStats,
    _count,
    id: topicId,
    userTopicWorkout: workouts,
  } = topic;

  const workout = workouts?.[0];

  const questionsCount = _count?.questions;
  const allowedTraining = !!questionsCount;

  const pathname = usePathname();
  const topicsRoutePath = `${pathname}/${topicId}`;
  const workoutRoutePath = `${availableTopicsRoute}/${topicId}/workout` as TRoutePath;

  const user = useSessionUser();
  const isOwner = topic?.userId && topic?.userId === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;

  const manageTopicsRoute = isOwner ? myTopicsRoute : allTopicsRoute;

  const goToTheRoute = useGoToTheRoute();

  const isCurrentTopicRoutePath = comparePathsWithoutLocalePrefix(topicsRoutePath, pathname);

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
          workout={workout}
          className="flex-1 max-sm:flex-col-reverse"
          showProperties={false}
        />
      </CardHeader>
      {/*!!description && ( // NOTE: The description is displaying in the `TopicHeader` (above)
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
      )*/}
      <CardContent
        className={cn(
          isDev && '__AvailableTopicsList_TopicItem_CardContent_Properties', // DEBUG
          'flex flex-1 flex-wrap items-end gap-4 text-xs max-sm:flex-col max-sm:items-start',
        )}
      >
        <div
          className={cn(
            isDev && '__AvailableTopicsList_TopicItem__TopicProperties', // DEBUG
            'text-truncate flex flex-1 flex-wrap items-center gap-4 gap-y-2 py-3',
          )}
        >
          <TopicProperties topic={topic} showDates />
        </div>
        <div
          className={cn(
            isDev && '__AvailableTopicsList_TopicItem__RightActions', // DEBUG
            'flex flex-wrap items-center gap-2 md:items-end',
          )}
        >
          {allowedEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToTheRoute(`${manageTopicsRoute}/${topicId}`)}
              className="flex gap-2"
              title={t('AvailableTopics.ManageTopic')}
            >
              <Icons.Edit className="size-4" />
            </Button>
          )}
          {allowedTraining && (
            <Link
              href={workoutRoutePath}
              className={cn(
                buttonVariants({ variant: 'theme' }),
                'text-truncate flex items-center gap-2',
              )}
            >
              <Icons.Rocket className="size-4 opacity-50" />
              <span className="truncate">{t('AvailableTopics.ToTraining')}</span>
            </Link>
          )}
          {/*allowedTraining && (
            <Button variant="theme" onClick={startWorkout} className="flex gap-2">
              <Icons.Rocket className="size-4 opacity-50" />
              <span className="truncate">
                {workout?.finished
                  ? t('AvailableTopics.RestartTraining')
                  : workout?.started
                    ? t('AvailableTopics.ResumeTraining')
                    : t('AvailableTopics.StartTraining')}
              </span>
            </Button>
            )*/}
        </div>
      </CardContent>
    </>
  );
  if (!isCurrentTopicRoutePath) {
    cardContent = (
      <Link className="flex-1 text-xl font-medium" href={topicsRoutePath as TRoutePath}>
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
