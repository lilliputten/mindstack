'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import * as Icons from '@/components/shared/Icons';
import { TAvailableTopic } from '@/features/topics/types';

interface TTopicPropertiesOptions {
  showDates?: boolean;
}
interface TTopicPropertiesProps {
  topic: TAvailableTopic;
}

export function TopicProperties(props: TTopicPropertiesProps & TTopicPropertiesOptions) {
  const {
    topic,
    // Options...
    showDates,
  } = props;
  const format = useFormatter();
  const {
    // id,
    // userId,
    user,
    // name,
    // description,
    // isPublic,
    langCode,
    langName,
    keywords,
    createdAt,
    updatedAt,
    _count,
  } = topic;
  const questionsCount = _count?.questions;
  const keywordsList = keywords
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const keywordsContent = keywordsList?.map((kw, idx) => (
    <span key={`${idx}-${kw}`} className="rounded-sm bg-theme-300/10 px-2">
      {kw}
    </span>
  ));
  const langContent = [
    langName && <span key="langName">{langName}</span>,
    langCode && (
      <span key="langCode" className="opacity-50">
        ({langCode})
      </span>
    ),
  ].filter(Boolean);
  const userName = user && (user.name || user.email);
  return (
    <>
      {!!questionsCount && (
        <span id="questions" className="flex items-center gap-1" title="Questions count">
          <Icons.Questions className="mr-1 size-4 opacity-50" /> {questionsCount}
        </span>
      )}
      {!!(langName || langCode) && (
        <span id="language" className="flex items-center gap-1" title="Topic language">
          <Icons.Languages className="mr-1 size-4 opacity-50" /> {langContent}
        </span>
      )}
      {!!keywordsContent?.length && (
        <span id="keyword" className="flex flex-wrap items-center gap-1" title="Keywords">
          <Icons.Tags className="mr-1 size-4 opacity-50" /> {keywordsContent}
        </span>
      )}
      {!!(user && userName) && (
        <span id="user-author" className="flex items-center gap-1" title="Author">
          <Icons.CircleUserRound className="mr-1 size-4 opacity-50" /> {userName}
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
