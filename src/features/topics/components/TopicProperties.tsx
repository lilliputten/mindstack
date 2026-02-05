'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { getFormattedRelativeDate } from '@/lib/helpers/dates';
import { useT } from '@/i18n';
import * as Icons from '@/components/shared/Icons';
import { PlainCategoriesListByCategoryIds } from '@/features/categories/components'; // ATTENTION: Inter-features import!
import { TAvailableTopic } from '@/features/topics/types';
import { SmallUserBlock, useUserById } from '@/features/users';

interface TTopicPropertiesOptions {
  showDates?: boolean;
  omitExtraDetails?: boolean;
}
interface TTopicPropertiesProps {
  topic: TAvailableTopic;
}

export function TopicProperties(props: TTopicPropertiesProps & TTopicPropertiesOptions) {
  const t = useT();
  const {
    topic,
    // Options...
    showDates,
    omitExtraDetails,
  } = props;
  const format = useFormatter();
  const {
    // description,
    // id,
    // isPublic,
    // name,
    // userId,
    _count,
    createdAt,
    keywords,
    langCode,
    langName,
    updatedAt,
    userId,
  } = topic;
  const categoryIds = topic.categoryIds || topic.categories?.map(({ id }) => id);
  const userQuery = useUserById(userId);
  const { user, isLoading: isUserLoading } = userQuery;
  const questionsCount = _count?.questions;
  const keywordsList = keywords
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const keywordsContent = keywordsList?.map((kw, idx) => (
    <span key={`${idx}-${kw}`} className="rounded-sm border bg-theme-700/10 px-1">
      {kw}
    </span>
  ));
  const langContent = [
    langName && (
      <span key="langName" className="truncate">
        {langName}
      </span>
    ),
    langCode && (
      <span key="langCode" className="truncate opacity-50">
        ({langCode})
      </span>
    ),
  ].filter(Boolean);
  const createdDateStr = getFormattedRelativeDate(format, createdAt);
  const updatedDateStr = getFormattedRelativeDate(format, updatedAt);
  const areDifferentDates =
    /* !!compareDates(updatedAt, createdAt) && */ createdDateStr !== updatedDateStr;
  return (
    <>
      <span id="questions" className="flex items-center gap-1 truncate" title={t('QuestionsCount')}>
        <Icons.Questions className="mr-1 size-4 shrink-0 opacity-50" />{' '}
        <span className="truncate">{questionsCount ? questionsCount : t('NoQuestions')}</span>
      </span>
      {!!(langName || langCode) && (
        <span id="language" className="flex items-center gap-1 truncate" title={t('TopicLanguage')}>
          <Icons.Languages className="mr-1 size-4 shrink-0 opacity-50" />{' '}
          <span className="flex gap-1 truncate">{langContent}</span>
        </span>
      )}
      {!omitExtraDetails && !!keywordsContent?.length && (
        <span
          id="keyword"
          className="flex flex-wrap items-center gap-1 truncate"
          title={t('Keywords')}
        >
          <Icons.Tags className="mr-1 size-4 shrink-0 opacity-50" /> {keywordsContent}
        </span>
      )}
      {!!categoryIds?.length && (
        <span id="categories" className="flex items-center gap-1 truncate" title={t('Categories')}>
          <Icons.Categories className="mr-1 size-4 shrink-0 opacity-50" />
          <PlainCategoriesListByCategoryIds
            className="max-w-50 truncate"
            categoryIds={categoryIds}
          />
        </span>
      )}
      {!!userId && (
        <span id="user-author" className="flex items-center gap-1 truncate" title={t('Author')}>
          <SmallUserBlock isLoading={isUserLoading} user={user} tiny />
        </span>
      )}
      {showDates && (
        <span
          id="createdAt"
          className="flex items-center gap-1 truncate text-xs"
          title={t('CreationDate')}
        >
          <Icons.CalendarDays className="mr-1 size-4 shrink-0 opacity-50" />{' '}
          <span className="truncate">{createdDateStr}</span>
        </span>
      )}
      {!omitExtraDetails && showDates && updatedAt && areDifferentDates && (
        <span
          id="createdAt"
          className="flex items-center gap-1 truncate text-xs"
          title={t('UpdatedDate')}
        >
          <Icons.Pencil className="mr-1 size-4 shrink-0 opacity-50" />{' '}
          <span className="truncate">{updatedDateStr}</span>
        </span>
      )}
    </>
  );
}
