import React from 'react';
import Link from 'next/link';
import { useFormatter } from 'next-intl';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { safeJsonParse } from '@/lib/helpers/json';
import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, topicsRoutes, TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TAvailableTopic, TIncludedUserTopicWorkout } from '@/features/topics/types';
import { TWorkoutData } from '@/features/workouts/types';
import { useSessionUser } from '@/hooks';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { usePathname } from '@/i18n/routing'; // TODO: Use 'next/navigation'

import { TopicProperties } from './TopicProperties';

interface TTopicHeaderOptions {
  showDates?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  showProperties?: boolean;
  withLink?: boolean;
}

interface TTopicHeaderProps {
  topic: TAvailableTopic;
  workout?: Partial<TIncludedUserTopicWorkout>;
  isWorkoutLoading?: boolean;
  scope?: TTopicsManageScopeId;
  className?: string;
}

const TRUNCATE_TITLE = false;

function ShowDetails(
  props: Pick<TTopicHeaderOptions, 'showDates'> &
    Pick<TTopicHeaderProps, 'topic' | 'workout' | 'isWorkoutLoading'> & {
      className?: string;
    },
) {
  const { topic, workout, isWorkoutLoading, showDates } = props;
  const { userId, isPublic, createdAt, updatedAt } = topic;

  const topicId = topic.id;

  const user = useSessionUser();
  const isOwner = userId && userId === user?.id;
  const format = useFormatter();
  const PublicIcon = isPublic ? Icons.Eye : Icons.EyeOff;

  // NOTE: Fetch the workout state from the passed workout data (if any) or try to get it from the local storage, otherwise
  const isActiveWorkout = React.useMemo(() => {
    let data: Partial<TIncludedUserTopicWorkout> | undefined;
    if (workout && !isWorkoutLoading) {
      data = workout;
    } else if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`workout-${topicId}`);
      if (stored) {
        try {
          data = safeJsonParse<TWorkoutData | undefined>(stored, undefined);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[TopicHeader:Memo:isActiveWorkout] Error parsing local workout data', {
            error,
            stored,
            data,
          });
          debugger; // eslint-disable-line no-debugger
        }
      }
    }
    return !!data?.started && !data?.finished;
  }, [isWorkoutLoading, topicId, workout]);

  return (
    <>
      {isActiveWorkout && (
        <span id="isOwner" title="The training is active">
          <Icons.Play className="size-4 text-theme-600" />
        </span>
      )}
      {isOwner && (
        <span id="isOwner" title="Your Topic">
          <Icons.ShieldCheck className="size-4 text-green-600" />
        </span>
      )}
      {isPublic && (
        <span id="isPublic" title={isPublic ? 'Public' : 'Private'}>
          <PublicIcon className="size-4" />
        </span>
      )}
      {showDates && (
        <span id="createdAt" className="flex items-center gap-1 text-xs" title="Creation date">
          <Icons.CalendarDays className="mr-1 size-4 opacity-50" />{' '}
          {getFormattedRelativeDate(format, createdAt)}
        </span>
      )}
      {showDates && updatedAt && !!compareDates(updatedAt, createdAt) && (
        <span id="createdAt" className="flex items-center gap-1 text-xs" title="Updated date">
          <Icons.Pencil className="mr-1 size-4 opacity-50" />{' '}
          {getFormattedRelativeDate(format, updatedAt)}
        </span>
      )}
    </>
  );
}

export function TopicHeader(props: TTopicHeaderProps & TTopicHeaderOptions) {
  const {
    topic,
    workout,
    isWorkoutLoading,
    scope = TopicsManageScopeIds.AVAILABLE_TOPICS,
    className,
    // Options...
    showDates,
    showName = true,
    showDescription = true,
    showProperties = true,
    withLink,
  } = props;
  const {
    id,
    // userId,
    name,
    description,
    // isPublic,
    // langCode,
    // langName,
    // keywords,
    // createdAt,
    // updatedAt,
    // _count,
  } = topic;
  const topicsListRoutePath = topicsRoutes[scope];
  const topicRoutePath = `${topicsListRoutePath}/${id}`;
  const pathname = usePathname();
  let nameContent = showName ? <>{name}</> : null;
  if (nameContent && withLink) {
    const isCurrentTopicRoutePath = comparePathsWithoutLocalePrefix(topicRoutePath, pathname);
    if (!isCurrentTopicRoutePath) {
      // Do not use a link if it's already on the its page
      nameContent = (
        <Link className="flex-1 text-xl font-medium hover:underline" href={topicRoutePath}>
          {nameContent}
        </Link>
      );
    }
  }

  const hasName = !!nameContent;
  const hasDescription = showDescription && !!description;
  const hasMainSection = hasName || hasDescription;

  const showDetails = !hasMainSection || showProperties;

  return (
    <div
      className={cn(
        isDev && '__TopicHeader', // DEBUG
        'flex flex-col items-stretch gap-4',
        className,
      )}
    >
      {hasMainSection && (
        <div
          className={cn(
            isDev && '__TopicHeader_MainSection', // DEBUG
            'flex flex-1 items-start gap-2 max-sm:flex-col',
          )}
        >
          <div
            className={cn(
              isDev && '__TopicHeader_Texts', // DEBUG
              'flex flex-1 flex-col gap-2',
              TRUNCATE_TITLE ? 'truncate' : 'overflow-hidden text-ellipsis',
            )}
          >
            {hasName && (
              <h2
                id="name"
                className={cn(
                  isDev && '__TopicHeader_Name', // DEBUG
                  TRUNCATE_TITLE ? 'truncate' : 'overflow-hidden text-ellipsis',
                  'text-xl',
                )}
              >
                {nameContent}
              </h2>
            )}
            {hasDescription && (
              <div
                className={cn(
                  isDev && '__TopicHeader_Description', // DEBUG
                  'text-ellipsis text-base',
                )}
              >
                <MarkdownText>{description}</MarkdownText>
              </div>
            )}
          </div>
          <div
            className={cn(
              isDev && '__TopicHeader_RightDetails', // DEBUG
              '!mt-0 flex min-h-6 flex-wrap items-center gap-4 gap-y-2',
              'text-xs opacity-50',
            )}
          >
            <ShowDetails
              topic={topic}
              workout={workout}
              isWorkoutLoading={isWorkoutLoading}
              showDates={showDates}
            />
          </div>
        </div>
      )}
      {showDetails && (
        <div
          className={cn(
            isDev && '__TopicHeader_DetailsSection', // DEBUG
            'flex flex-1 flex-wrap items-center gap-4 gap-y-2',
            'text-xs opacity-50',
          )}
        >
          {!hasMainSection && (
            <ShowDetails
              topic={topic}
              workout={workout}
              isWorkoutLoading={isWorkoutLoading}
              showDates={showDates}
            />
          )}
          {showProperties && <TopicProperties topic={topic} showDates />}
        </div>
      )}
    </div>
  );
}
